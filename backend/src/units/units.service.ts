import { Injectable } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  create(createUnitDto: CreateUnitDto) {
    return this.prisma.unit.create({
      data: createUnitDto,
    });
  }

  findAll() {
    return this.prisma.unit.findMany({
      include: { property: true },
    });
  }

  findOne(id: string) {
    return this.prisma.unit.findUnique({
      where: { id },
      include: { property: true, leases: { include: { tenant: true } } },
    });
  }

  update(id: string, updateUnitDto: UpdateUnitDto) {
    return this.prisma.unit.update({
      where: { id },
      data: updateUnitDto,
    });
  }

  remove(id: string) {
    return this.prisma.unit.delete({
      where: { id },
    });
  }
}
