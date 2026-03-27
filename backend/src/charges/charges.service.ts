import { Injectable, UnauthorizedException, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MikrotikService } from '../mikrotik/mikrotik.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChargesService {
  private readonly logger = new Logger(ChargesService.name);

  constructor(
    private prisma: PrismaService, 
    private mikrotik: MikrotikService,
    private notifications: NotificationsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateMonthlyCharges() {
    this.logger.log('Iniciando generador de cargos automáticos mensuales...');
    
    // Obtener la fecha actual para buscar su día
    const today = new Date();
    const currentDay = today.getDate();

    // Obtener los contratos activos donde el día de pago coincide con hoy
    const leases = await this.prisma.lease.findMany({
      where: {
        status: 'ACTIVE',
        paymentDay: currentDay,
      },
      include: { tenant: true }
    });

    if (leases.length === 0) {
      this.logger.log(`No hay cargos de rentas que generar para el día ${currentDay}.`);
      return;
    }

    let createdCount = 0;
    
    // Generar un cargo (Charge) para cada contrato coincidente
    for (const lease of leases) {
      // Opcional: Validar que no hayamos creado ya el cargo para este mismo mes/año para evitar duplicados en caso de reinicios
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const existingCharge = await this.prisma.charge.findFirst({
        where: {
          leaseId: lease.id,
          type: 'RENT',
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      });

      if (!existingCharge) {
        // Establecer fecha de vencimiento (ej. 5 días después)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5);

        await this.prisma.charge.create({
          data: {
            leaseId: lease.id,
            amount: lease.rentAmount,
            type: 'RENT',
            dueDate: dueDate,
            description: `Renta Mensual - ${today.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}`,
            status: 'PENDING'
          }
        });
        createdCount++;
        this.logger.log(`Cargo generado exitosamente para Contrato ID: ${lease.id} por $${lease.rentAmount}`);

        // Dispatch Notifications asynchronously
        const mesText = today.toLocaleString('es-MX', { month: 'long' });
        const loginUrl = process.env.FRONTEND_URL || 'https://radiotecpro.com';
        const wpMessage = `🔔 *RentControl - Renta de ${mesText}*\nHola ${lease.tenant.name}, este es un mensaje automático para notificarte que se ha generado exitosamente tu recibo de renta por *$${lease.rentAmount} MXN*.\n\n📅 *Vencimiento:* ${dueDate.toLocaleDateString('es-MX')}\n\nCon esto evitamos sorpresas. *Puedes realizar tu pago directamente en tu portal personalizado:* 🔗 ${loginUrl}\n\nRecuerda pagar a tiempo para evitar la suspensión automática de servicios. Tu pago nos ayuda a brindarte mejor servicio.\n\nAtentamente,\n*Administración de RentControl*`;
        
        if (lease.tenant.phone) {
          this.notifications.sendWhatsAppMessage(lease.tenant.phone, wpMessage);
        }
        
        if (lease.tenant.email) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #1e293b; margin: 0;">RentControl</h1>
                <p style="color: #64748b; margin-top: 5px;">Aviso de Cobro Mensual</p>
              </div>
              <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <p style="color: #334155; font-size: 16px;">Hola <b>${lease.tenant.name}</b>,</p>
                <p style="color: #334155; line-height: 1.6;">Se ha generado tu nuevo cargo de arrendamiento correspondiente a este ciclo.</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                  <strong style="display: block; color: #0f172a; font-size: 14px;">Monto de Renta:</strong>
                  <span style="font-size: 24px; color: #4f46e5; font-weight: bold;">$${lease.rentAmount} MXN</span>
                  <br/><br/>
                  <strong style="display: block; color: #0f172a; font-size: 14px;">Fecha límite de pago:</strong>
                  <span style="font-size: 16px; color: #ef4444; font-weight: bold;">${dueDate.toLocaleDateString('es-MX')}</span>
                </div>
                <p style="color: #64748b; font-size: 14px; text-align: justify;">Agradecemos tu puntualidad. Recuerda que realizar tu pago a tiempo evitará penalizaciones o suspensión de servicios adheridos a tu cuenta.</p>
              </div>
            </div>`;
          this.notifications.sendEmail(lease.tenant.email, 'Aviso de Cobro de Renta', emailHtml);
        }
      }
    }

    this.logger.log(`Generación terminada. Se crearon ${createdCount} cargos en total.`);
  }

  @Cron('0 1 * * *') // Every day at 1:00 AM
  async suspendOverdueInternetServices() {
    this.logger.log('Iniciando suspensión automática de IPs para inquilinos morosos...');
    const today = new Date();

    const overdueCharges = await this.prisma.charge.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: today }
      }
    });

    if (overdueCharges.length === 0) {
      this.logger.log('No se encontraron inquilinos morosos para suspensión.');
      return;
    }

    const leaseIds = overdueCharges.map((c: any) => c.leaseId);

    const activeServicesToSuspend = await this.prisma.leaseService.findMany({
      where: {
        leaseId: { in: leaseIds },
        status: 'ACTIVE'
      }
    });

    if (activeServicesToSuspend.length === 0) {
      this.logger.log('Los inquilinos morosos no tienen servicios de internet activos que suspender.');
      return;
    }

    const router = await this.prisma.mikrotikRouter.findFirst({ where: { isActive: true } });
    if (!router) {
      this.logger.error('No se encontró ningún router Mikrotik activo para ejecutar las suspensiones.');
      return;
    }

    let suspendedCount = 0;
    for (const service of activeServicesToSuspend) {
      try {
        if (service.pppoeUser) {
          await this.mikrotik.suspendPppSecret(router.id, service.pppoeUser);
        } else if (service.ipAddress) {
          await this.mikrotik.suspendIp(router.id, service.ipAddress);
        } else {
          continue; // No IP or PPPoE to suspend
        }
        await this.prisma.leaseService.update({
          where: { id: service.id },
          data: { status: 'SUSPENDED' }
        });
        suspendedCount++;
        this.logger.log(`IP ${service.ipAddress} suspendida por morosidad (Lease ID: ${service.leaseId}).`);
      } catch (err) {
        this.logger.error(`Error suspendiendo IP ${service.ipAddress}: ${err.message}`);
      }
    }

    this.logger.log(`Suspensión terminada. Se suspendieron ${suspendedCount} servicios.`);
  }

  async create(createChargeDto: CreateChargeDto, user: any) {
    if (user.role === 'OWNER' || user.role === 'MANAGER') {
      const lease: any = await this.prisma.lease.findUnique({
        where: { id: createChargeDto.leaseId },
        include: { unit: { include: { property: { include: { owner: true } } } } } as any
      });
      if (!lease) throw new UnauthorizedException('Contrato no encontrado.');
      if (user.role === 'OWNER' && lease.unit.property.ownerId !== user.userId) {
        throw new UnauthorizedException('No autorizado para añadir cargos a este contrato.');
      }
      if (user.role === 'MANAGER' && lease.unit.property.owner?.managerId !== user.userId) {
        throw new UnauthorizedException('No autorizado para añadir cargos a este contrato.');
      }
    }

    const newCharge = await this.prisma.charge.create({
      data: {
        ...createChargeDto,
        dueDate: new Date(createChargeDto.dueDate)
      },
      include: {
        lease: {
          include: { tenant: true }
        }
      }
    });

    // Dispatch Manual Trigger 
    if (newCharge.type === 'RENT' || newCharge.type === 'DEPOSIT') {
      const typeStr = newCharge.type === 'RENT' ? 'Renta' : 'Depósito';
      const loginUrl = process.env.FRONTEND_URL || 'https://radiotecpro.com';
      const wpMessage = `🔔 *RentControl - Cargo de ${typeStr}*\nHola ${newCharge.lease.tenant.name}, este es un mensaje automático para notificarte que se ha generado un nuevo cargo en tu estado de cuenta por *$${newCharge.amount} MXN* bajo el concepto de: ${newCharge.description || 'Arrendamiento'}.\n\n📅 *Vencimiento:* ${newCharge.dueDate.toLocaleDateString('es-MX')}\n\n*Puedes realizar tu pago directamente en tu portal personalizado:* 🔗 ${loginUrl}\n\nAtentamente,\n*Administración de RentControl*`;
      
      if (newCharge.lease.tenant.phone) {
        this.notifications.sendWhatsAppMessage(newCharge.lease.tenant.phone, wpMessage);
      }
      
      if (newCharge.lease.tenant.email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #1e293b; margin: 0;">RentControl</h1>
              <p style="color: #64748b; margin-top: 5px;">Aviso de Nuevo Cargo</p>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <p style="color: #334155; font-size: 16px;">Hola <b>${newCharge.lease.tenant.name}</b>,</p>
              <p style="color: #334155; line-height: 1.6;">Se ha generado o adelantado un recibo en tu estado de cuenta bajo el concepto de: ${newCharge.description || 'Cargo Administrativo'}</p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <strong style="display: block; color: #0f172a; font-size: 14px;">Monto a Pagar:</strong>
                <span style="font-size: 24px; color: #4f46e5; font-weight: bold;">$${newCharge.amount} MXN</span>
                <br/><br/>
                <strong style="display: block; color: #0f172a; font-size: 14px;">Fecha límite de pago:</strong>
                <span style="font-size: 16px; color: #ef4444; font-weight: bold;">${newCharge.dueDate.toLocaleDateString('es-MX')}</span>
              </div>
            </div>
          </div>`;
        this.notifications.sendEmail(newCharge.lease.tenant.email, 'Notificación de Nuevo Cargo - RentControl', emailHtml);
      }
    }

    return newCharge;
  }

  findAll(user: any, leaseId?: string) {
    let whereClause: any = {};
    if (leaseId) {
      whereClause.leaseId = leaseId;
    }

    if (user.role === 'OWNER') {
      whereClause.lease = { unit: { property: { ownerId: user.userId } } };
    } else if (user.role === 'MANAGER') {
      whereClause.lease = { unit: { property: { owner: { managerId: user.userId } } } };
    } else if (user.role === 'TENANT') {
      whereClause.lease = { tenant: { userId: user.userId } };
    }

    return this.prisma.charge.findMany({
      where: whereClause,
      include: {
        lease: {
          include: { tenant: true, unit: { include: { property: true } } }
        },
        payments: true
      },
      orderBy: { dueDate: 'desc' }
    });
  }

  async findOne(id: string, user: any) {
    let whereClause: any = { id };
    if (user.role === 'OWNER') {
      whereClause.lease = { unit: { property: { ownerId: user.userId } } };
    } else if (user.role === 'MANAGER') {
      whereClause.lease = { unit: { property: { owner: { managerId: user.userId } } } };
    } else if (user.role === 'TENANT') {
      whereClause.lease = { tenant: { userId: user.userId } };
    }

    const charge = await this.prisma.charge.findFirst({
      where: whereClause,
      include: {
        lease: {
          include: { tenant: true, unit: { include: { property: true } } }
        },
        payments: true
      }
    });

    if (!charge) throw new NotFoundException('Cargo no encontrado o no tienes permiso.');
    return charge;
  }

  async reportPayment(id: string, data: any, user: any) {
    const charge = await this.findOne(id, user);

    if (charge.status === 'PAID') {
      throw new BadRequestException('El cargo ya está pagado totalmente.');
    }

    const { reference, paymentDate, notes, receiptUrl } = data;
    const additionalDesc = ` [Reportado el ${paymentDate} | Ref: ${reference} | Notas: ${notes || 'N/A'}${receiptUrl ? ` | Archivo: ${receiptUrl}` : ''}]`;

    return this.prisma.charge.update({
      where: { id },
      data: {
        status: 'REPORTED',
        description: charge.description ? `${charge.description}${additionalDesc}` : additionalDesc,
      }
    });
  }

  async update(id: string, updateChargeDto: UpdateChargeDto, user: any) {
    await this.findOne(id, user); // Valida acceso
    return this.prisma.charge.update({
      where: { id },
      data: {
        ...updateChargeDto,
        dueDate: updateChargeDto.dueDate ? new Date(updateChargeDto.dueDate) : undefined
      },
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user); // Valida acceso
    return this.prisma.charge.delete({
      where: { id },
    });
  }
}
