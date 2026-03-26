import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SupplierCreateInput) {
    return this.prisma.supplier.create({ data });
  }

  async findAll(managerId?: string) {
    // @ts-ignore: Prisma client needs generation
    const whereClause = managerId ? { managerId } : {};
    return this.prisma.supplier.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        incidents: true,
      }
    });
    if (!supplier) throw new NotFoundException(`Supplier with ID ${id} not found`);
    return supplier;
  }

  async update(id: string, data: Prisma.SupplierUpdateInput) {
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}
