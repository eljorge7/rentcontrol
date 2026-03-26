import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { PrismaService } from '../prisma/prisma.service';
import { MikrotikService } from '../mikrotik/mikrotik.service';

import { SettingsService } from '../settings/settings.service';

@Injectable()
export class MercadopagoService {
  private readonly logger = new Logger(MercadopagoService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private mikrotik: MikrotikService,
    private settingsService: SettingsService,
  ) {}

  private async getClient() {
    const token = await this.settingsService.getValue('MERCADOPAGO_ACCESS_TOKEN', this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN') || 'APP_USR-test-token');
    return new MercadoPagoConfig({
      accessToken: token || '',
      options: { timeout: 5000 }
    });
  }

  async createPreference(chargeId: string, user: any) {
    const charge: any = await this.prisma.charge.findUnique({
      where: { id: chargeId },
      include: { lease: { include: { unit: { include: { property: true } } } }, payments: true }
    });

    if (!charge) throw new NotFoundException('Charge not found');
    if (charge.status === 'PAID') throw new NotFoundException('Charge is already paid');

    const domain = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';

    const totalPaid = charge.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
    const remaining = charge.amount - totalPaid;

    const client = await this.getClient();
    const preference = new Preference(client);
    
    try {
      const response = await preference.create({
        body: {
          items: [
            {
              id: charge.id,
              title: charge.description || 'Cargo RentControl',
              description: `Pago de ${charge.type} - ${charge.lease?.unit?.name || ''}`,
              picture_url: `${domain}/logo.png`, // Optional
              quantity: 1,
              unit_price: remaining,
              currency_id: 'MXN',
            }
          ],
          back_urls: {
            success: `${domain}/tenant/billing/success`,
            failure: `${domain}/tenant/billing/cancel`,
            pending: `${domain}/tenant/billing`
          },
          auto_return: 'approved',
          notification_url: `${backendUrl}/mercadopago/webhook`,
          external_reference: charge.id,
        }
      });

      return { url: response.init_point };
    } catch (error) {
      this.logger.error('Error creating MercadoPago preference', error);
      throw error;
    }
  }

  async handleWebhook(query: any, body: any) {
    // Mercado Pago sends topic and id or just type and data.id
    let paymentId: string;

    if (query?.topic === 'payment' && query?.id) {
      paymentId = query.id;
    } else if (body?.type === 'payment' && body?.data?.id) {
      paymentId = body.data.id;
    } else {
      return { received: true, ignored: true };
    }

    try {
      const client = await this.getClient();
      const paymentClient = new Payment(client);
      const mpPayment = await paymentClient.get({ id: paymentId });

      if (mpPayment && mpPayment.status === 'approved') {
        const chargeId = mpPayment.external_reference;
        const amount = mpPayment.transaction_amount;

        if (chargeId) {
          this.logger.log(`MercadoPago payment successful for charge ${chargeId}`);
          await this.processSuccessfulPayment(chargeId, paymentId.toString(), amount || 0);
        }
      }
    } catch (error) {
      this.logger.error(`Error processing webhook for payment ${paymentId}`, error);
    }
    
    return { received: true };
  }

  private async processSuccessfulPayment(chargeId: string, transactionId: string, amount: number) {
    // Check if we already registered this transaction to avoid duplicates
    const existingPayment = await this.prisma.payment.findFirst({
      where: { method: 'MERCADOPAGO', reference: transactionId }
    });

    if (existingPayment) {
      this.logger.log(`Payment ${transactionId} already processed.`);
      return;
    }

    const charge = await this.prisma.charge.findUnique({
      where: { id: chargeId },
      include: { lease: { include: { unit: { include: { property: { include: { owner: { include: { managementPlan: true } } } } } } } } }
    });

    if (!charge) {
      this.logger.error(`Charge not found for webhook payment: ${chargeId}`);
      return;
    }

    // Guardar el pago
    const payment = await this.prisma.payment.create({
      data: {
        chargeId: chargeId,
        amount: amount,
        method: 'MERCADOPAGO',
        reference: transactionId,
      }
    });

    // Comisión si hay plan de gestión
    const owner = (charge as any).lease?.unit?.property?.owner;
    if (owner && owner.managerId && owner.managementPlan) {
      const grossCommission = (amount * owner.managementPlan.commission) / 100;
      if (grossCommission > 0) {
        const systemFee = grossCommission * 0.15;
        const netManager = grossCommission - systemFee;

        await this.prisma.commission.create({
          data: {
            amount: netManager,
            systemFee: systemFee,
            description: `Comisión (${owner.managementPlan.commission}%) por cobro vía Mercado Pago.`,
            status: 'PENDING',
            managerId: owner.managerId,
            paymentId: payment.id,
            platformEarning: {
              create: {
                amount: systemFee,
                description: `Fee 15% sobre Comisión MercadoPago`,
                managerId: owner.managerId
              }
            }
          }
        });
      }
    }

    // Marcar cargo como pagado si el pago es mayor o igual al cargo
    const allPayments = await this.prisma.payment.findMany({ where: { chargeId } });
    const totalPaid = allPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

    if (totalPaid >= charge.amount) {
      await this.prisma.charge.update({
        where: { id: charge.id },
        data: { status: 'PAID' }
      });

      // Restaurar Internet si estaba suspendido
      try {
        const leaseServices = await this.prisma.leaseService.findMany({
          where: { leaseId: charge.leaseId, status: 'SUSPENDED' }
        });
        
        if (leaseServices.length > 0) {
          const router = await this.prisma.mikrotikRouter.findFirst({ where: { isActive: true } });
          if (router) {
            for (const service of leaseServices as any[]) {
              if (service.pppoeUser) {
                await this.mikrotik.restorePppSecret(router.id, service.pppoeUser);
                await this.prisma.leaseService.update({ where: { id: service.id }, data: { status: 'ACTIVE' } });
              } else if (service.ipAddress) {
                await this.mikrotik.restoreIp(router.id, service.ipAddress);
                await this.prisma.leaseService.update({ where: { id: service.id }, data: { status: 'ACTIVE' } });
              }
            }
          }
        }
      } catch (err) {
        this.logger.error("Error intentando restaurar internet en Mikrotik tras pago:", err);
      }

    } else if (totalPaid > 0) {
      await this.prisma.charge.update({
        where: { id: charge.id },
        data: { status: 'PARTIAL' }
      });
    }
  }
}
