import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeOffService {
  constructor(private prisma: PrismaService) {}

  async create(createTimeOffDto: any) {
    const { employeeId, type, startDate, endDate, reason } = createTimeOffDto;
    return this.prisma.timeOffRequest.create({
      data: {
        employeeId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING'
      }
    });
  }

  async findAll() {
    return this.prisma.timeOffRequest.findMany({
      include: {
        employee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string, managerId: string) {
    const record = await this.prisma.timeOffRequest.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Request not found');

    return this.prisma.timeOffRequest.update({
      where: { id },
      data: { status, managerId }
    });
  }
}
