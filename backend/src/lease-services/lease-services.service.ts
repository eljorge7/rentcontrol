import { Injectable } from '@nestjs/common';
import { CreateLeaseServiceDto } from './dto/create-lease-service.dto';
import { UpdateLeaseServiceDto } from './dto/update-lease-service.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaseServicesService {
  constructor(private prisma: PrismaService) {}

  create(createLeaseServiceDto: CreateLeaseServiceDto) {
    return this.prisma.leaseService.create({
      data: createLeaseServiceDto,
    });
  }

  findAll() {
    return this.prisma.leaseService.findMany({
      include: {
        profile: true,
        lease: {
          include: {
            tenant: true,
            unit: true,
          }
        }
      }
    });
  }

  findOne(id: string) {
    return this.prisma.leaseService.findUnique({
      where: { id },
      include: {
        profile: true,
        lease: {
          include: {
            tenant: true,
            unit: true,
          }
        }
      }
    });
  }

  update(id: string, updateLeaseServiceDto: UpdateLeaseServiceDto) {
    return this.prisma.leaseService.update({
      where: { id },
      data: updateLeaseServiceDto,
    });
  }

  remove(id: string) {
    return this.prisma.leaseService.delete({
      where: { id }
    });
  }
}
