import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(createAttendanceDto: any, recordedById: string) {
    const { employeeId, date, type, notes } = createAttendanceDto;
    return this.prisma.attendanceRecord.create({
      data: {
        employeeId,
        date: new Date(date),
        type,
        notes,
        recordedById
      }
    });
  }

  async findAll() {
    return this.prisma.attendanceRecord.findMany({
      include: {
        employee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id },
      include: { employee: true }
    });
    if (!record) throw new NotFoundException('Record not found');
    return record;
  }

  async remove(id: string) {
    return this.prisma.attendanceRecord.delete({ where: { id } });
  }
}
