import { Controller, Get, Post, Body, Param, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('integrations/omnichat')
export class OmniChatProxyController {
  private readonly logger = new Logger(OmniChatProxyController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  // Validación de seguridad manual para M2M
  private validateToken(token: string) {
     const MAGIC_SECRET = process.env.OMNICHAT_WEBHOOK_SECRET || "SUPER_SECRET_KEY_123";
     if (token !== MAGIC_SECRET) {
        throw new UnauthorizedException("Invalid integration token");
     }
  }

  /**
   * Identifica si un número de WhatsApp pertenece a un Inquilino Activo
   */
  @Get('identify/:phone')
  async identifyTenant(@Param('phone') phone: string, @Headers('x-api-key') token: string) {
    this.validateToken(token);

    // Limpiar el número (ej. "5216421042123@c.us" -> "6421042123")
    const cleanPhone = phone.replace('@c.us', '').slice(-10);

    const tenant = await this.prisma.tenant.findFirst({
       // Usamos contains porque el número guardado en BD podría tener o no Lada (+52)
       where: { phone: { contains: cleanPhone } },
       include: {
         leases: {
           where: { status: 'ACTIVE' },
           include: { unit: { include: { property: true } } }
         }
       }
    });

    if (!tenant) return { found: false };

    // Solo devolver datos si tiene un contrato activo
    if (tenant.leases.length === 0) return { found: true, hasActiveLease: false, name: tenant.name };

    // Extraer datos para el prompt
    const lease = tenant.leases[0];

    // Novedad: Extraer datos financieros reales
    const pendingCharges = await this.prisma.charge.findMany({
       where: { leaseId: lease.id, status: 'PENDING' },
       orderBy: { dueDate: 'asc' }
    });

    const totalDeuda = pendingCharges.reduce((sum, c) => sum + c.amount, 0);
    const nextDueDate = pendingCharges.length > 0 ? pendingCharges[0].dueDate : null;

    let financialContext = "El inquilino ESTÁ AL CORRIENTE, no debe nada.";
    if (totalDeuda > 0) {
       financialContext = `El inquilino TIENE UN SALDO PENDIENTE de $${totalDeuda} MXN. `;
       if (nextDueDate) {
          financialContext += `El cargo más antiguo o próximo a vencer es del ${nextDueDate.toLocaleDateString('es-MX')}. `;
       }
       const desglose = pendingCharges.map(c => `- ${c.type}: $${c.amount}`).join(', ');
       financialContext += `Categorías de deuda: ${desglose}. `;
       financialContext += `Dile amablemente que puede pagar en su portal usando tarjeta o OXXO al link: https://radiotecpro.com/tenant/billing`;
    }

    return {
      found: true,
      hasActiveLease: true,
      tenantId: tenant.id,
      name: tenant.name,
      unitId: lease.unitId,
      unitName: lease.unit.name,
      propertyName: lease.unit.property.name,
      financialContext: financialContext
    };
  }

  /**
   * Crea un Ticket de Mantenimiento usando los argumentos interpretados por la IA de OpenAI
   */
  @Post('tickets/create')
  async createTicket(@Body() body: any, @Headers('x-api-key') token: string) {
    this.validateToken(token);

    const { tenantId, unitId, description, priority } = body;

    const incident = await this.prisma.incident.create({
      data: {
         tenantId,
         unitId,
         description,
         priority: priority || 'HIGH',
         status: 'PENDING'
      },
      include: {
         unit: { include: { property: { include: { owner: true } } } },
         tenant: true
      }
    });

    const shortId = incident.id.substring(0, 8).toUpperCase();

    // Notificar al Owner/Manager si tiene teléfono
    const ownerPhone = incident.unit.property.owner?.phone;
    if (ownerPhone) {
        const msg = `⚠️ *Nuevo Ticket de Mantenimiento #${shortId}*\n\n`
                  + `*Inquilino:* ${incident.tenant.name}\n`
                  + `*Propiedad:* ${incident.unit.property.name} - ${incident.unit.name}\n`
                  + `*Prioridad:* ${incident.priority}\n\n`
                  + `*Descripción:*\n${incident.description}\n\n`
                  + `_Reporte generado automáticamente por OmniChat IA._`;
        
        // Lo enviamos en trasfondo para no retrasar la respuesta a la IA
        this.notifications.sendWhatsAppMessage(ownerPhone, msg).catch(e => {
            this.logger.error("Error enviando notificación al manager: " + e.message);
        });
    }
    
    return { success: true, ticketId: shortId, message: "Ticket creado en RentControl." };
  }
}
