import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class PenaltyService {
  private readonly logger = new Logger(PenaltyService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Iniciando escaneo nocturno de morosidad (Late Fees Auto-Pilot)...');
    
    try {
      // 1. Encontrar todos los recibos de RENTA no pagados, que no hayan sido multados, y cuyo contrato dicte una multa > 0
      const overdueCharges: any[] = await this.prisma.charge.findMany({
        where: {
          type: 'RENT',
          status: { in: ['PENDING', 'PARTIAL'] },
          penaltyApplied: false,
          lease: {
            lateFeeAmount: { gt: 0 }
          }
        },
        include: {
          lease: {
            include: { tenant: true }
          }
        }
      });

      let penaltiesApplied = 0;
      const today = new Date();

      for (const charge of overdueCharges) {
        // 2. Calcular la fecha máxima de tolerancia
        const limitDate = new Date(charge.dueDate);
        limitDate.setDate(limitDate.getDate() + charge.lease.gracePeriodDays);

        // 3. Si hoy ya cruzamos el límite de tolerancia
        if (today > limitDate) {
          await this.prisma.$transaction(async (prisma) => {
            // A. Crear el nuevo cargo por penalización
            await prisma.charge.create({
              data: {
                leaseId: charge.leaseId,
                amount: charge.lease.lateFeeAmount,
                type: 'PENALTY',
                dueDate: today,
                description: `Recargo por Morosidad (Renta Vencida: ${new Date(charge.dueDate).toLocaleDateString('es-ES')})`,
                status: 'PENDING'
              }
            });

            // B. Bloquear el recibo original para que no vuelva a generar multa
            await prisma.charge.update({
              where: { id: charge.id },
              data: { penaltyApplied: true }
            });
          });
          
          penaltiesApplied++;
          this.logger.log(`Multa de $${charge.lease.lateFeeAmount} aplicada al contrato ${charge.leaseId} por recibo de renta vencido.`);

          // Notifications Dispatch
          const loginUrl = process.env.FRONTEND_URL || 'https://rentcontrol.radiotecpro.com';
          const wpMessage = `⚠️ *Aviso de Morosidad | RentControl*\nHola ${charge.lease.tenant?.name || 'Inquilino'},\n\nSe ha agotado el tiempo de gracia de tu Mensualidad. El sistema ha aplicado un cargo automático de *Penalización por Morosidad* por un monto de *$${charge.lease.lateFeeAmount} MXN*.\n\nPor favor, actualiza tu saldo a la brevedad para evitar la suspensión de tu servicio de internet.\n*Paga ahora desde tu portal:* 🔗 ${loginUrl}\n\nAtentamente,\n*Administración de RentControl*`;
          
          if (charge.lease.tenant?.phone) {
            this.notifications.sendWhatsAppMessage(charge.lease.tenant.phone, wpMessage);
          }

          if (charge.lease.tenant?.email) {
            const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #ef4444; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #fef2f2;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #991b1b; margin: 0;">RentControl</h1>
                <p style="color: #dc2626; margin-top: 5px;">Aviso Importante: Recargo Generado</p>
              </div>
              <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <p style="color: #334155; font-size: 16px;">Hola <b>${charge.lease.tenant?.name || 'Inquilino'}</b>,</p>
                <p style="color: #334155; line-height: 1.6;">El tiempo de tolerancia para el pago de tu renta ha expirado. De acuerdo al contrato, se ha generado una penalización por morosidad.</p>
                <div style="background-color: #fee2e2; padding: 15px; border-radius: 6px; margin: 15px 0;">
                  <strong style="display: block; color: #7f1d1d; font-size: 14px;">Monto del Recargo:</strong>
                  <span style="font-size: 24px; color: #b91c1c; font-weight: bold;">$${charge.lease.lateFeeAmount} MXN</span>
                </div>
                <p style="color: #64748b; font-size: 14px; text-align: justify;">Te pedimos regularizar tu saldo lo antes posible para evitar la desconexión de servicios o procesos legales. Si ya realizaste el pago, ignora este mensaje.</p>
              </div>
            </div>`;
            this.notifications.sendEmail(charge.lease.tenant.email, 'Aviso de Recargo por Morosidad', emailHtml);
          }
        }
      }

      this.logger.log(`Escaneo finalizado. Total de nuevas multas emitidas hoy: ${penaltiesApplied}`);
    } catch (error) {
      this.logger.error('Error durante la ejecución del escaneo de morosidad', error);
    }
  }
}
