import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ManagementPlansService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ManagementPlanCreateInput) {
    return this.prisma.managementPlan.create({ data });
  }

  async findAll() {
    return this.prisma.managementPlan.findMany({
      orderBy: { commission: 'asc' },
      include: {
        _count: {
          select: { owners: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.managementPlan.findUnique({
      where: { id },
      include: { owners: true }
    });
    if (!plan) throw new NotFoundException(`Plan ${id} not found`);
    return plan;
  }

  async update(id: string, data: Prisma.ManagementPlanUpdateInput) {
    return this.prisma.managementPlan.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    // Verificamos si hay dueños atados a este plan
    const plan = await this.findOne(id);
    if (plan.owners && plan.owners.length > 0) {
      throw new Error("No puedes eliminar un plan que tiene Propietarios suscritos. Primero cambiales el plan.");
    }
    return this.prisma.managementPlan.delete({
      where: { id },
    });
  }
}
