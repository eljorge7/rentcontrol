import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: { name: string; description?: string; basePrice: number }) {
    return this.prisma.eventType.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.eventType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, updateDto: { name?: string; description?: string; basePrice?: number }) {
    const eventType = await this.prisma.eventType.findUnique({ where: { id } });
    if (!eventType) throw new NotFoundException('Event type not found');

    return this.prisma.eventType.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    const eventType = await this.prisma.eventType.findUnique({ where: { id } });
    if (!eventType) throw new NotFoundException('Event type not found');

    return this.prisma.eventType.delete({ where: { id } });
  }
}
