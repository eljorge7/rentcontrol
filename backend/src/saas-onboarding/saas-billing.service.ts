import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { FacturaProService } from '../facturapro/facturapro.service';

@Injectable()
export class SaasBillingService {
  private readonly logger = new Logger(SaasBillingService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private facturaProService: FacturaProService
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
        this.logger.log(`Generando factura M2M SaaS para ${client.name}: $${feeToCharge}`);
        
        try {
           const servicesDesc = client.subscriptions.map(s => `${s.tier.app.name} (${s.tier.name})`).join(', ');
           const description = `Suscripción Mensual MAJIA OS: ${servicesDesc}`;
           
           // Esto crea el CFDI y envía el WhatsApp automáticamente
           await this.facturaProService.issueSaasInvoice(client, feeToCharge, description);
           this.logger.log(`Factura SaaS generada y WhatsApp enviado a ${client.name}`);
        } catch (e) {
           this.logger.error(`Error generando factura M2M SaaS para ${client.name}: ${e.message}`);
        }
      }
    }

    this.logger.log('Proceso automático de cobranza SaaS finalizado.');
  }
}
