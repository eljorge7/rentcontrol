import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(user: any) {
    if (user.role === 'MANAGER') {
      const pendingInfo = await this.prisma.commission.aggregate({
        where: { managerId: user.userId, status: 'PENDING' },
        _sum: { amount: true },
        _count: { id: true }
      });
      const paidInfo = await this.prisma.commission.aggregate({
        where: { managerId: user.userId, status: 'PAID' },
        _sum: { amount: true },
        _count: { id: true }
      });

      return {
        pendingAmount: pendingInfo._sum.amount || 0,
        pendingCount: pendingInfo._count.id || 0,
        paidAmount: paidInfo._sum.amount || 0,
        paidCount: paidInfo._count.id || 0,
      };
    } else if (user.role === 'ADMIN') {
      const summary = await this.prisma.commission.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      });
      const earnings = await this.prisma.platformEarning.aggregate({
        _sum: { amount: true },
      });
      return { 
        totalOwed: summary._sum.amount || 0,
        totalEarnings: earnings._sum.amount || 0
      };
    }
    return {};
  }

  async getManagerCommissions(managerId: string) {
    return this.prisma.commission.findMany({
      where: { managerId },
      orderBy: { createdAt: 'desc' },
      include: {
        payment: {
          include: { charge: { include: { lease: { include: { tenant: true, unit: { include: { property: true } } } } } } }
        }
      }
    });
  }

  async getManagerPayrolls(managerId: string) {
    return this.prisma.payroll.findMany({
      where: { managerId },
      orderBy: { date: 'desc' },
      include: {
        commissions: true
      }
    });
  }

  async getPendingBalancesByManager() {
    // Agrupar por manager y sumar comisiones pendientes
    const balances = await this.prisma.commission.groupBy({
      by: ['managerId'],
      where: { status: 'PENDING' },
      _sum: { amount: true },
      _count: { id: true }
    });

    // Obtener los datos del usuario para nombre/email
    const managerIds = balances.map(b => b.managerId);
    const managers = await this.prisma.user.findMany({
      where: { id: { in: managerIds } },
      select: { id: true, name: true, email: true }
    });

    return balances.map(b => {
      const manager = managers.find(m => m.id === b.managerId);
      return {
        managerId: b.managerId,
        managerName: manager?.name || 'Desconocido',
        managerEmail: manager?.email || '',
        totalPendingAmount: b._sum.amount || 0,
        pendingCommissionsCount: b._count.id || 0
      };
    });
  }

  async getAllPayrolls() {
    return this.prisma.payroll.findMany({
      orderBy: { date: 'desc' },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { commissions: true } },
        commissions: true
      }
    });
  }

  async processPayout(managerId: string) {
    if (!managerId) throw new BadRequestException('managerId es requerido');

    try {
      // 1. Obtener todas las comisiones PENDING
      const pendingCommissions = await this.prisma.commission.findMany({
        where: { managerId, status: 'PENDING' }
      });

      if (pendingCommissions.length === 0) {
        throw new BadRequestException('No hay comisiones pendientes para pagar a este gestor.');
      }

      const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);

      // 2. Crear el registro de Payroll y enlazar las comisiones
      const payroll = await this.prisma.payroll.create({
        data: {
          managerId,
          totalAmount,
          status: 'PAID',
          commissions: {
            connect: pendingCommissions.map(c => ({ id: c.id }))
          }
        }
      });

      // 3. Actualizar el estado de las comisiones a PAID
      await this.prisma.commission.updateMany({
        where: { managerId, status: 'PENDING' },
        data: { status: 'PAID', payrollId: payroll.id }
      });

      return payroll;
    } catch (err: any) {
      console.error('PAYOUT FATAL ERROR:', err);
      throw new BadRequestException('Error interno detallado: ' + (err.message || 'Error desconocido'));
    }
  }

  async createEventCommission(createDto: { managerId: string; eventTypeId: string }) {
    const eventType = await this.prisma.eventType.findUnique({
      where: { id: createDto.eventTypeId }
    });

    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }

    let amount = eventType.basePrice;
    let systemFee = 0;

    if (eventType.name.includes('WISP') || eventType.basePrice === 1399) {
      systemFee = 399;
      amount = eventType.basePrice - systemFee; // 1000
    } else {
      systemFee = eventType.basePrice * 0.15;
      amount = eventType.basePrice - systemFee;
    }

    return this.prisma.commission.create({
      data: {
        amount: amount,
        systemFee: systemFee,
        description: `Evento: ${eventType.name}`,
        status: 'PENDING',
        managerId: createDto.managerId,
        eventTypeId: createDto.eventTypeId,
        platformEarning: {
          create: {
            amount: systemFee,
            description: `Margen/Fee sobre Evento: ${eventType.name}`,
            managerId: createDto.managerId
          }
        }
      }
    });
  }
}
