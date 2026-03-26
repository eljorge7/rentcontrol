import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChecklistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(leaseId: string, managerId: string, data: any) {
    // data.items should be an array of: { name: string, status: string, notes: string, photos: string[] }
    // data.type should be 'MOVE_IN' or 'MOVE_OUT'
    return this.prisma.inventoryChecklist.create({
      data: {
        leaseId,
        managerId,
        type: data.type || 'MOVE_IN',
        notes: data.notes || '',
        items: data.items || [], // Store as JSON natively
      },
    });
  }

  async findAllByLease(leaseId: string) {
    return this.prisma.inventoryChecklist.findMany({
      where: { leaseId },
      orderBy: { date: 'desc' },
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.inventoryChecklist.findUnique({
      where: { id },
      include: {
        manager: {
          select: { id: true, name: true }
        },
        lease: {
          include: {
            tenant: { select: { name: true } },
            unit: { select: { name: true, property: { select: { name: true } } } }
          }
        }
      }
    });
  }

  async remove(id: string) {
    return this.prisma.inventoryChecklist.delete({
      where: { id },
    });
  }
}
