import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SaasBillingService {
  private readonly logger = new Logger(SaasBillingService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron('0 0 1 * *') // Se ejecuta el día 1 de cada mes a las 00:00 hrs
  async processMonthlyBilling() {
    this.logger.log('Iniciando proceso automático de cobranza mensual SaaS...');

    const clients = await this.prisma.user.findMany({
      where: { facturaproTenantId: { not: null }, isActive: true },
      include: {
        subscriptions: {
          include: { tier: { include: { app: true } } }
        }
      }
    });

    for (const client of clients) {
      if (client.subscriptions.length === 0) continue;

      const realTotal = client.subscriptions.reduce((acc, sub) => acc + sub.tier.monthlyPrice, 0);
      const feeToCharge = client.customMonthlyFee !== null ? client.customMonthlyFee : realTotal;

      if (feeToCharge > 0) {
        this.logger.log(`Generando estado de cuenta para ${client.name}: $${feeToCharge}`);
        
        if (client.phone) {
          const message = `*MAJIA OS - ESTADO DE CUENTA*\n\nHola ${client.name},\n\nEste es tu recordatorio mensual de servicio para tu ecosistema corporativo en la nube.\n\n*Servicios Activos:*\n${client.subscriptions.map(s => `- ${s.tier.app.name} (${s.tier.name})`).join('\n')}\n\n*Total a Pagar:* $${feeToCharge} MXN\n\nPor favor realiza el pago antes del día 5 para evitar la suspensión del servicio.\n\n_Tu factura automatizada (CFDI) estará disponible en breve._`;
          
          try {
            await this.notificationsService.sendWhatsAppMessage(client.phone, message);
          } catch (e) {
             this.logger.error(`Error enviando WhatsApp automatizado a ${client.name}: ${e.message}`);
          }
        }
      }
    }

    this.logger.log('Proceso automático de cobranza SaaS finalizado.');
  }
}
