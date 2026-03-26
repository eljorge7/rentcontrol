import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { MikrotikService } from '../mikrotik/mikrotik.service';

import { SettingsService } from '../settings/settings.service';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private mikrotik: MikrotikService,
    private settingsService: SettingsService,
  ) {}

  private async getStripeInstance() {
    const key = await this.settingsService.getValue('STRIPE_SECRET_KEY', this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_123');
    return new Stripe(key || '', { apiVersion: '2023-10-16' as any });
  }

  async createCheckoutSession(chargeId: string, user: any) {
    const charge: any = await this.prisma.charge.findUnique({
      where: { id: chargeId },
      include: { lease: { include: { unit: { include: { property: true } } } } }
    });

    if (!charge) throw new NotFoundException('Charge not found');
    if (charge.status === 'PAID') throw new NotFoundException('Charge is already paid');

    const domain = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const stripeObj = await this.getStripeInstance();

    const session = await stripeObj.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: charge.description || 'Cargo RentControl',
              description: `Pago de ${charge.type} - ${charge.lease?.unit?.name || ''}`,
            },
            unit_amount: Math.round(charge.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${domain}/tenant/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/tenant/billing/cancel`,
      metadata: {
        chargeId: charge.id,
        tenantId: user?.userId || 'unknown',
      },
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const defaultSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    const webhookSecret = await this.settingsService.getValue('STRIPE_WEBHOOK_SECRET', defaultSecret);
    
    let event: Stripe.Event;
    const stripeObj = await this.getStripeInstance();

    try {
      if (webhookSecret) {
        event = stripeObj.webhooks.constructEvent(payload, signature, webhookSecret);
      } else {
        event = JSON.parse(payload.toString());
      }
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const chargeId = session.metadata?.chargeId;

      if (chargeId) {
        this.logger.log(`Payment successful for charge ${chargeId}`);
        await this.processSuccessfulPayment(chargeId, session.id, (session.amount_total || 0) / 100);
      }
    }

    return { received: true };
  }

  private async processSuccessfulPayment(chargeId: string, transactionId: string, amount: number) {
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
        method: 'STRIPE',
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
            description: `Comisión (${owner.managementPlan.commission}%) por cobro vía Stripe.`,
            status: 'PENDING',
            managerId: owner.managerId,
            paymentId: payment.id,
            platformEarning: {
              create: {
                amount: systemFee,
                description: `Fee 15% sobre Comisión Stripe`,
                managerId: owner.managerId
              }
            }
          }
        });
      }
    }

    // Marcar cargo como pagado si el pago es mayor o igual al cargo
    const allPayments = await this.prisma.payment.findMany({ where: { chargeId } });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

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
