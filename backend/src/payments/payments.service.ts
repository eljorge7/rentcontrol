import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MikrotikService } from '../mikrotik/mikrotik.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService, private mikrotik: MikrotikService) {}

  async create(createPaymentDto: CreatePaymentDto, user: any) {
    // 1. Verificar que el cargo existe y el usuario tiene permisos
    const charge: any = await this.prisma.charge.findUnique({
      where: { id: createPaymentDto.chargeId },
      include: { lease: { include: { tenant: true, unit: { include: { property: { include: { owner: { include: { managementPlan: true } } } } } } } } }
    });

    if (!charge) throw new NotFoundException('Cargo no encontrado');

    if (user.role === 'OWNER' || user.role === 'MANAGER') {
      if (user.role === 'OWNER' && charge.lease.unit.property.ownerId !== user.userId) {
        throw new UnauthorizedException('No autorizado para registrar este pago.');
      }
      if (user.role === 'MANAGER') {
        if (charge.lease?.unit?.property?.owner) {
          const owner = charge.lease.unit.property.owner;
          if (owner && owner.managerId && owner.managerId !== user.userId) {
            throw new UnauthorizedException('No tienes permiso para registrar pagos de este cliente.');
          }
        }
      }
    }

    // 2. Registrar el pago
    const payment = await this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        date: new Date(createPaymentDto.date)
      }
    });

    // 2.5 Generar comisión para el Gestor si aplica
    const owner = charge.lease?.unit?.property?.owner;
    // Las comisiones del gestor SÓLO aplican a los pagos normales de renta, NO a depósitos iniciales u otros cobros ('OTHER', 'MAINTENANCE', etc.)
    if (owner && owner.managerId && owner.managementPlan && charge.type === 'RENT') {
      const plan = owner.managementPlan;
      const grossCommission = (payment.amount * plan.commission) / 100;
      if (grossCommission > 0) {
        const systemFee = grossCommission * 0.15;
        const netManager = grossCommission - systemFee;

        // Limpiar descripción de cualquier corchete extra
        let safeDesc = charge.description || 'Renta mensual';
        const bracketIndex = safeDesc.indexOf('[');
        if (bracketIndex !== -1) safeDesc = safeDesc.substring(0, bracketIndex).trim();

        const tenantName = charge.lease?.tenant?.name || 'Inquilino Desconocido';

        await this.prisma.commission.create({
          data: {
            amount: netManager,
            systemFee: systemFee,
            description: `Comisión (${plan.commission}%) pago ${safeDesc} de ${tenantName}`,
            status: 'PENDING',
            managerId: owner.managerId,
            paymentId: payment.id,
            platformEarning: {
              create: {
                amount: systemFee,
                description: `Fee 15% sobre Comisión (${plan.commission}%)`,
                managerId: owner.managerId
              }
            }
          }
        });
      }
    }

    // 3. Revisar si con este pago se completa el total del cargo para marcarlo como PAID
    const allPayments = await this.prisma.payment.findMany({
      where: { chargeId: createPaymentDto.chargeId }
    });

    const totalPaid = allPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

    if (totalPaid >= charge.amount) {
      await this.prisma.charge.update({
        where: { id: charge.id },
        data: { status: 'PAID' }
      });

      // ---- RESTAURAR INTERNET AUTOMÁTICAMENTE ----
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
                await this.prisma.leaseService.update({
                  where: { id: service.id },
                  data: { status: 'ACTIVE' }
                });
                console.log(`Internet automatizado y PPPoE ${service.pppoeUser} restaurado por pago completado.`);
              } else if (service.ipAddress) {
                await this.mikrotik.restoreIp(router.id, service.ipAddress);
                await this.prisma.leaseService.update({
                  where: { id: service.id },
                  data: { status: 'ACTIVE' }
                });
                console.log(`Internet automatizado e IP ${service.ipAddress} restaurada por pago completado.`);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error intentando restaurar internet en Mikrotik tras pago:", err);
      }
      // ---------------------------------------------
    } else if (totalPaid > 0) {
      // Si el monto no cubre la totalidad pero hay algo pagado, es un pago parcial
      await this.prisma.charge.update({
        where: { id: charge.id },
        data: { status: 'PARTIAL' }
      });
    }

    return payment;
  }

  findAll(user: any) {
    let whereClause: any = {};
    if (user.role === 'OWNER') {
      whereClause = { charge: { lease: { unit: { property: { ownerId: user.userId } } } } };
    } else if (user.role === 'MANAGER') {
      whereClause = { charge: { lease: { unit: { property: { owner: { managerId: user.userId } } } } } };
    } else if (user.role === 'TENANT') {
      whereClause = { charge: { lease: { tenant: { userId: user.userId } } } };
    }

    return this.prisma.payment.findMany({
      where: whereClause,
      include: {
        charge: { include: { lease: { include: { tenant: true } } } },
        invoice: true
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, user: any) {
    let whereClause: any = { id };
    if (user.role === 'OWNER') {
      whereClause.charge = { lease: { unit: { property: { ownerId: user.userId } } } };
    } else if (user.role === 'MANAGER') {
      whereClause.charge = { lease: { unit: { property: { owner: { managerId: user.userId } } } } };
    } else if (user.role === 'TENANT') {
      whereClause.charge = { lease: { tenant: { userId: user.userId } } };
    }

    const payment = await this.prisma.payment.findFirst({
      where: whereClause,
      include: { charge: true, invoice: true }
    });

    if (!payment) throw new NotFoundException('Pago no encontrado o no autorizado');
    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, user: any) {
    await this.findOne(id, user); // Valida acceso
    return this.prisma.payment.update({
      where: { id },
      data: {
        ...updatePaymentDto,
        date: updatePaymentDto.date ? new Date(updatePaymentDto.date) : undefined
      },
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user); // Valida acceso
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
