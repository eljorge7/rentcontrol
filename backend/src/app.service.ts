import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDashboardStats() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Financials
    const [
      collectedRevenueAggr,
      expensesAggr,
      uncollectedDebtAggr,
      pendingPayrollAggr
    ] = await Promise.all([
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { date: { gte: firstDay } } }),
      this.prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: firstDay } } }),
      this.prisma.charge.aggregate({ _sum: { amount: true }, where: { status: { in: ['PENDING', 'PARTIAL'] } } }),
      this.prisma.commission.aggregate({ _sum: { amount: true }, where: { status: 'PENDING' } }),
    ]);

    const collectedRevenue = collectedRevenueAggr._sum.amount || 0;
    const expenses = expensesAggr._sum.amount || 0;
    const netIncome = collectedRevenue - expenses;
    const uncollectedDebt = uncollectedDebtAggr._sum.amount || 0;
    const pendingPayroll = pendingPayrollAggr._sum.amount || 0;

    // 2. Infrastructure & Mikrotik
    const [
      onlineRouters,
      offlineRouters,
      activeServices,
      suspendedServices
    ] = await Promise.all([
      this.prisma.mikrotikRouter.count({ where: { isActive: true } }),
      this.prisma.mikrotikRouter.count({ where: { isActive: false } }),
      this.prisma.leaseService.count({ where: { status: 'ACTIVE' } }),
      this.prisma.leaseService.count({ where: { status: 'SUSPENDED' } }),
    ]);

    // 3. Operations
    const [totalUnits, occupiedUnits, openIncidents] = await Promise.all([
      this.prisma.unit.count(),
      this.prisma.unit.count({ where: { isOccupied: true } }),
      this.prisma.incident.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } })
    ]);
    const vacancyRate = totalUnits > 0 ? ((totalUnits - occupiedUnits) / totalUnits) * 100 : 0;

    // 4. Managers Performance (Leaderboard)
    const managers = await this.prisma.user.findMany({
      where: { role: 'MANAGER', isActive: true },
      select: {
        id: true,
        name: true,
        managedOwners: {
          select: { properties: { select: { id: true } } }
        },
        commissions: {
          where: { createdAt: { gte: firstDay }, status: 'PAID' },
          select: { amount: true }
        }
      }
    });

    const managerLeaderboard = managers.map(m => {
      const propertiesCount = m.managedOwners.reduce((acc, owner) => acc + owner.properties.length, 0);
      const earnedCommissions = m.commissions.reduce((acc, c) => acc + c.amount, 0);
      return {
        id: m.id,
        name: m.name,
        propertiesCount,
        earnedCommissions
      };
    }).sort((a, b) => b.earnedCommissions - a.earnedCommissions);

    // 5. Chart Data (Last 6 Months Income vs Expenses)
    const chartPromises = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - (5 - i) + 1, 1);
      
      return Promise.all([
        this.prisma.payment.aggregate({ _sum: { amount: true }, where: { date: { gte: d, lt: nextMonth } } }),
        this.prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: d, lt: nextMonth } } }),
        d.toLocaleString('es-ES', { month: 'short' }).toUpperCase()
      ]);
    });

    const chartResults = await Promise.all(chartPromises);
    const chartData = chartResults.map(([inc, exp, monthName]) => ({
      name: monthName,
      income: inc._sum.amount || 0,
      expenses: exp._sum.amount || 0
    }));

    return {
      financials: {
        collectedRevenue,
        netIncome,
        expenses,
        uncollectedDebt,
        pendingPayroll
      },
      infrastructure: {
        onlineRouters,
        offlineRouters,
        activeServices,
        suspendedServices
      },
      operations: {
        totalUnits,
        occupiedUnits,
        vacancyRate: Math.round(vacancyRate),
        openIncidents
      },
      managers: managerLeaderboard.slice(0, 5),
      chartData
    };
  }

  async getOwnerDashboardStats(ownerId: string) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      include: { manager: true, managementPlan: true }
    });

    if (!owner) return null;

    const properties = await this.prisma.property.findMany({
      where: { ownerId }
    });
    const propertyIds = properties.map(p => p.id);

    // 1. Financials
    const [
      collectedRevenueAggr,
      expensesAggr,
      uncollectedDebtAggr
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { date: { gte: firstDay }, charge: { lease: { unit: { propertyId: { in: propertyIds } } } } }
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: firstDay }, propertyId: { in: propertyIds } }
      }),
      this.prisma.charge.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['PENDING', 'PARTIAL'] }, lease: { unit: { propertyId: { in: propertyIds } } } }
      })
    ]);

    const collectedRevenue = collectedRevenueAggr._sum.amount || 0;
    const expenses = expensesAggr._sum.amount || 0;
    const netIncome = collectedRevenue - expenses;
    const uncollectedDebt = uncollectedDebtAggr._sum.amount || 0;

    // 2. Operations
    const [totalUnits, occupiedUnits, openIncidents] = await Promise.all([
      this.prisma.unit.count({ where: { propertyId: { in: propertyIds } } }),
      this.prisma.unit.count({ where: { isOccupied: true, propertyId: { in: propertyIds } } }),
      this.prisma.incident.count({ 
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] }, unit: { propertyId: { in: propertyIds } } } 
      })
    ]);
    const vacancyRate = totalUnits > 0 ? ((totalUnits - occupiedUnits) / totalUnits) * 100 : 0;

    // 3. Chart Data (Last 6 Months)
    const chartPromises = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - (5 - i) + 1, 1);
      
      return Promise.all([
        this.prisma.payment.aggregate({ 
          _sum: { amount: true }, 
          where: { date: { gte: d, lt: nextMonth }, charge: { lease: { unit: { propertyId: { in: propertyIds } } } } } 
        }),
        this.prisma.expense.aggregate({ 
          _sum: { amount: true }, 
          where: { date: { gte: d, lt: nextMonth }, propertyId: { in: propertyIds } } 
        }),
        d.toLocaleString('es-ES', { month: 'short' }).toUpperCase()
      ]);
    });

    const chartResults = await Promise.all(chartPromises);
    const chartData = chartResults.map(([inc, exp, monthName]) => ({
      name: monthName,
      income: inc._sum.amount || 0,
      expenses: exp._sum.amount || 0
    }));

    // 4. Per Property Breakdowns
    const propertiesDataPromises = properties.map(async (p) => {
      const pInc = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { date: { gte: firstDay }, charge: { lease: { unit: { propertyId: p.id } } } }
      });
      const pExp = await this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: firstDay }, propertyId: p.id }
      });
      const rev = pInc._sum.amount || 0;
      const exp = pExp._sum.amount || 0;
      return {
        id: p.id,
        name: p.name,
        revenue: rev,
        netProfit: rev - exp
      };
    });
    const propertiesData = await Promise.all(propertiesDataPromises);

    return {
      financials: {
        collectedRevenue,
        netIncome,
        expenses,
        uncollectedDebt
      },
      operations: {
        totalUnits,
        occupiedUnits,
        vacancyRate: Math.round(vacancyRate),
        openIncidents
      },
      manager: owner.manager ? {
        id: owner.manager.id,
        name: owner.manager.name,
        email: owner.manager.email
      } : null,
      managementPlan: owner.managementPlan ? {
        name: owner.managementPlan.name,
        commissionPct: owner.managementPlan.commission,
        maxProperties: owner.managementPlan.maxProperties,
        fixedFee: owner.managementPlan.fixedFee
      } : null,
      chartData,
      propertiesData
    };
  }

  async getOwnerBilling(ownerId: string) {
    const properties = await this.prisma.property.findMany({
      where: { ownerId },
      select: { id: true, name: true }
    });
    const propertyIds = properties.map(p => p.id);

    const incomes = await this.prisma.payment.findMany({
      where: { charge: { lease: { unit: { propertyId: { in: propertyIds } } } } },
      include: {
        charge: {
          include: { lease: { include: { unit: { include: { property: true } }, tenant: true } } }
        }
      },
      orderBy: { date: 'desc' }
    });

    const expenses = await this.prisma.expense.findMany({
      where: { propertyId: { in: propertyIds } },
      include: { property: true },
      orderBy: { date: 'desc' }
    });

    return {
      properties,
      incomes: incomes.map(p => ({
        id: p.id,
        date: p.date,
        amount: p.amount,
        method: p.method,
        property: p.charge.lease.unit.property.name,
        unit: p.charge.lease.unit.name,
        tenant: p.charge.lease.tenant.name,
        description: p.charge.description || p.charge.type
      })),
      expenses: expenses.map(e => ({
        id: e.id,
        date: e.date,
        amount: e.amount,
        category: e.category,
        description: e.description,
        property: e.property?.name || 'General'
      }))
    };
  }

  async getTenantDashboard(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        leases: {
          where: { status: 'ACTIVE' },
          include: { 
            unit: { include: { property: true } },
            charges: {
              where: { status: { in: ['PENDING', 'PARTIAL'] } },
              orderBy: { dueDate: 'asc' }
            },
            services: { include: { profile: true } }
          }
        }
      }
    });

    if (!tenant) return null;

    const activeLease = tenant.leases[0] || null;
    let recentMovements: any[] = [];

    if (activeLease) {
      // Fetch recent paid charges or payments
      recentMovements = await this.prisma.charge.findMany({
        where: { leaseId: activeLease.id, status: 'PAID' },
        orderBy: { dueDate: 'desc' },
        take: 5
      });
    }

    return {
      tenant: { 
        id: tenant.id, 
        name: tenant.name, 
        email: tenant.email, 
        phone: tenant.phone,
        requiresInvoice: tenant.requiresInvoice,
        rfc: tenant.rfc,
        taxRegimen: tenant.taxRegimen,
        zipCode: tenant.zipCode,
        taxDocumentUrl: tenant.taxDocumentUrl
      },
      activeLease,
      recentMovements
    };
  }
}
