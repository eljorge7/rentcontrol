import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async getPendingBalance(ownerId: string, userId: string, role: string) {
    // 1. Validar que el dueño existe. Si no es admin, validar que le pertenezca a este gestor.
    const whereClause: any = { id: ownerId, role: 'OWNER' };
    if (role !== 'ADMIN') {
      whereClause.managerId = userId;
    }
    const owner = await this.prisma.user.findFirst({
      where: whereClause
    });
    if (!owner) throw new NotFoundException('Propietario no encontrado o no tienes permisos.');

    // We keep track of the actual assigned manager to stamp the payout correctly
    const effectiveManagerId = owner.managerId || userId;

    // 2. Traer todos los pagos huérfanos (sin ownerPayoutId) que le pertenecen a este dueño
    // Consideramos RENT y cualquier otro cargo que el dueño perciba
    // Para simplificar, buscamos los Payments donde el Charge.Lease.Unit.Property.ownerId === ownerId
    const pendingPayments = await this.prisma.payment.findMany({
      where: {
        ownerPayoutId: null,
        charge: {
          lease: {
            unit: {
              property: { ownerId }
            }
          }
        }
      },
      include: {
        commission: true,
        charge: {
          include: {
            lease: {
              include: { unit: { include: { property: true } } }
            }
          }
        }
      }
    });

    // 3. Traer todos los gastos huérfanos (Mantenimiento, etc) de las propiedades de este dueño
    const pendingExpenses = await this.prisma.expense.findMany({
      where: {
        ownerPayoutId: null,
        property: { ownerId }
      },
      include: {
        property: true
      }
    });

    // 4. Calcular consolidados
    let totalRents = 0;
    let totalCommissions = 0;
    
    pendingPayments.forEach(p => {
      totalRents += p.amount;
      // Protección absoluta: Sólo sumar comisiones si el cargo original fue una RENTA.
      // Esto ignora comisiones fantasmas generadas sobre Depósitos o recargos "OTHER" en fases previas del sistema.
      if (p.commission && p.charge.type === 'RENT') {
        totalCommissions += p.commission.amount;
        totalCommissions += p.commission.systemFee; // System fee is deducted from Owner's grass
      }
    });

    let totalExpenses = 0;
    pendingExpenses.forEach(e => {
      totalExpenses += e.amount;
    });

    const netAmount = totalRents - totalCommissions - totalExpenses;

    return {
      owner,
      period: {
        start: pendingPayments.length > 0 ? pendingPayments.reduce((min, p) => p.date < min ? p.date : min, pendingPayments[0].date) : new Date(),
        end: new Date()
      },
      financials: {
        totalRents,
        totalCommissions,
        totalExpenses,
        netAmount,
        paymentsCount: pendingPayments.length,
        expensesCount: pendingExpenses.length
      },
      details: {
        payments: pendingPayments.map(p => ({
          id: p.id,
          amount: p.amount,
          date: p.date,
          chargeType: p.charge.type,
          property: p.charge.lease.unit.property.name,
          unit: p.charge.lease.unit.name,
          commission: p.commission ? p.commission.amount + p.commission.systemFee : 0
        })),
        expenses: pendingExpenses.map(e => ({
          id: e.id,
          amount: e.amount,
          date: e.date,
          category: e.category,
          property: e.property?.name || 'General',
          description: e.description
        }))
      }
    };
  }

  async generatePayout(ownerId: string, userId: string, role: string, notes?: string) {
    const balance = await this.getPendingBalance(ownerId, userId, role);
    
    if (balance.financials.paymentsCount === 0 && balance.financials.expensesCount === 0) {
      throw new BadRequestException('No hay ingresos ni gastos pendientes para liquidar.');
    }

    // El ID del gestor que estamparemos será el asignado al dueño, o el userId del token
    const effectiveManagerId = balance.owner.managerId || userId;

    // Usar una transacción robusta para asegurar que los registros se amarren al Payout
    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.ownerPayout.create({
        data: {
          ownerId,
          managerId: effectiveManagerId,
          startDate: balance.period.start,
          endDate: balance.period.end,
          totalRents: balance.financials.totalRents,
          totalCommissions: balance.financials.totalCommissions,
          totalExpenses: balance.financials.totalExpenses,
          netAmount: balance.financials.netAmount,
          status: 'PENDING',
          notes: notes
        }
      });

      // Amarar pagos
      if (balance.details.payments.length > 0) {
        await tx.payment.updateMany({
          where: { id: { in: balance.details.payments.map(p => p.id) } },
          data: { ownerPayoutId: payout.id }
        });
      }

      // Amarrar gastos
      if (balance.details.expenses.length > 0) {
        await tx.expense.updateMany({
          where: { id: { in: balance.details.expenses.map(e => e.id) } },
          data: { ownerPayoutId: payout.id }
        });
      }

      return payout;
    });
  }

  async getPayouts(ownerId: string, managerId: string) {
    return this.prisma.ownerPayout.findMany({
      where: { ownerId, managerId },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { name: true, email: true } }
      }
    });
  }

  async getAllPayouts(managerId: string, role: string) {
    // Si es ADMIN, idealmente ve todos. Si es MANAGER ve los suyos.
    const whereClause = role === 'ADMIN' ? {} : { managerId };
    return this.prisma.ownerPayout.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { name: true, email: true } },
        manager: { select: { name: true } }
      }
    });
  }

  async getPayoutsForOwner(ownerId: string) {
    return this.prisma.ownerPayout.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        manager: { select: { name: true, email: true } }
      }
    });
  }

  async getPayoutDetails(id: string, userId: string, role: string) {
    const payout = await this.prisma.ownerPayout.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true, email: true, ownerProfile: true } },
        manager: { select: { name: true, email: true } },
        payments: {
          include: { charge: { include: { lease: { include: { unit: { include: { property: true } } } } } } }
        },
        expenses: {
          include: { property: true }
        }
      }
    });

    if (!payout) throw new NotFoundException('Liquidación no encontrada.');

    // Validar visibilidad
    if (role === 'MANAGER' && payout.managerId !== userId) {
      throw new BadRequestException('No tienes permiso para ver esta liquidación.');
    }
    if (role === 'OWNER' && payout.ownerId !== userId) {
      throw new BadRequestException('No tienes permiso para ver esta liquidación.');
    }

    return payout;
  }

  async markAsPaid(id: string, managerId: string) {
    const payout = await this.prisma.ownerPayout.findUnique({ where: { id } });
    if (!payout) throw new NotFoundException('Liquidación no encontrada.');
    if (payout.managerId !== managerId) throw new BadRequestException('Privilegios insuficientes.');

    return this.prisma.ownerPayout.update({
      where: { id },
      data: { status: 'PAID' }
    });
  }
}
