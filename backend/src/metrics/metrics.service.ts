import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getAdminMetrics(startDateStr?: string, endDateStr?: string) {
    const totalProperties = await this.prisma.property.count();
    const totalTenants = await this.prisma.tenant.count();
    const totalUnits = await this.prisma.unit.count();
    
    // MRR: Sum of rent amounts for active leases
    const activeLeases = await this.prisma.lease.findMany({
      where: { status: 'ACTIVE' },
      select: { rentAmount: true },
    });
    const expectedMRR = activeLeases.reduce((acc, curr) => acc + curr.rentAmount, 0);

    const activeUnitsCount = await this.prisma.unit.count({ where: { isOccupied: true } });
    const occupancyRate = totalUnits > 0 ? (activeUnitsCount / totalUnits) * 100 : 0;

    // Unpaid rent charges (in period)
    const today = new Date();
    const firstDay = startDateStr ? new Date(startDateStr + 'T00:00:00') : new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = endDateStr ? new Date(endDateStr + 'T23:59:59.999Z') : today;
    
    const unpaidRentCharges = await this.prisma.charge.findMany({
      where: {
        type: 'RENT',
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { gte: firstDay, lte: lastDay }
      },
      select: { amount: true, payments: { select: { amount: true } } }
    });

    let currentDeuda = 0;
    unpaidRentCharges.forEach(ch => {
      const paid = ch.payments.reduce((a, b) => a + b.amount, 0);
      currentDeuda += (ch.amount - paid);
    });

    return {
      totalProperties,
      totalTenants,
      totalUnits,
      activeUnits: activeUnitsCount,
      occupancyRate,
      expectedMRR,
      currentUnpaidDebt: currentDeuda,
    };
  }

  async getManagerMetrics(managerId: string, startDateStr?: string, endDateStr?: string) {
    // Owners assigned to this manager
    const managedOwners = await this.prisma.user.findMany({
      where: { managerId },
      select: { id: true }
    });
    const ownerIds = managedOwners.map(o => o.id);

    const totalProperties = await this.prisma.property.count({
      where: { ownerId: { in: ownerIds } }
    });

    const activeLeases = await this.prisma.lease.findMany({
      where: { unit: { property: { ownerId: { in: ownerIds } } }, status: 'ACTIVE' },
      select: { rentAmount: true, endDate: true }
    });
    
    const mrrManaged = activeLeases.reduce((acc, curr) => acc + curr.rentAmount, 0);

    // Leases expiring in the next 30 days
    const nextThirtyDays = new Date();
    nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);
    const expiringLeasesCount = activeLeases.filter(L => L.endDate && L.endDate <= nextThirtyDays).length;

    // Unpaid tickets/incidents?
    const pendingIncidents = await this.prisma.incident.count({
      where: { 
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        unit: { property: { ownerId: { in: ownerIds } } }
      }
    });

    return {
      totalProperties,
      totalManagedOwners: managedOwners.length,
      mrrManaged,
      expiringLeasesCount,
      pendingIncidents
    };
  }

  async getOwnerMetrics(ownerId: string, startDateStr?: string, endDateStr?: string) {
    const today = new Date();
    const firstDay = startDateStr ? new Date(startDateStr + 'T00:00:00') : new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = endDateStr ? new Date(endDateStr + 'T23:59:59.999Z') : today;

    const totalProperties = await this.prisma.property.count({
      where: { ownerId }
    });

    const totalUnits = await this.prisma.unit.count({
      where: { property: { ownerId } }
    });

    const activeUnitsCount = await this.prisma.unit.count({
      where: { property: { ownerId }, isOccupied: true }
    });

    const occupancyRate = totalUnits > 0 ? (activeUnitsCount / totalUnits) * 100 : 0;

    const activeLeases = await this.prisma.lease.findMany({
      where: { unit: { property: { ownerId } }, status: 'ACTIVE' },
      select: { rentAmount: true },
    });
    const expectedMRR = activeLeases.reduce((acc, curr) => acc + curr.rentAmount, 0);

    // Get current month's revenue (Paid charges)
    
    // Payments made this month for this owner's charges
    const recentPayments = await this.prisma.payment.findMany({
      where: {
        date: { gte: firstDay, lte: lastDay },
        charge: { lease: { unit: { property: { ownerId } } } }
      },
      select: { amount: true }
    });
    
    const monthlyRevenue = recentPayments.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalProperties,
      totalUnits,
      activeUnitsCount,
      occupancyRate,
      expectedMRR,
      monthlyRevenue
    };
  }
}
