import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('units')
export class UnitsController {
  constructor(
    private readonly unitsService: UnitsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Request() req: any, @Body() createUnitDto: CreateUnitDto) {
    // Validate that the user owns the property if they are an OWNER
    if (req.user.role === 'OWNER') {
      const property = await this.prisma.property.findUnique({
        where: { id: createUnitDto.propertyId }
      });
      if (!property) throw new NotFoundException('Propiedad no encontrada');
      if (property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para crear locales en esta propiedad');
      }
    }
    return this.unitsService.create(createUnitDto);
  }

  @Get()
  async findAll(@Request() req: any) {
    if (req.user.role === 'OWNER') {
      // Find units associated with properties owned by this user
      const properties = await this.prisma.property.findMany({
        where: { ownerId: req.user.userId },
        select: { id: true }
      });
      const propertyIds = properties.map(p => p.id);
      
      return this.prisma.unit.findMany({
        where: { propertyId: { in: propertyIds } },
        include: { property: true }
      });
    }
    return this.unitsService.findAll();
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const unit = await this.unitsService.findOne(id);
    if (!unit) throw new NotFoundException('Unidad no encontrada');

    if (req.user.role === 'OWNER' && unit.property.ownerId !== req.user.userId) {
      throw new ForbiddenException('No tienes permiso para ver esta unidad');
    }
    
    return unit;
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const unit = await this.prisma.unit.findUnique({ where: { id }, include: { property: { include: { owner: true } } } as any });
      if (!unit) throw new NotFoundException('Unidad no encontrada');
      if (req.user.role === 'OWNER' && (unit as any).property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para editar esta unidad');
      }
      if (req.user.role === 'MANAGER' && (unit as any).property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para editar esta unidad');
      }
    }
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const unit = await this.prisma.unit.findUnique({ where: { id }, include: { property: { include: { owner: true } } } as any });
      if (!unit) throw new NotFoundException('Unidad no encontrada');
      if (req.user.role === 'OWNER' && (unit as any).property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para eliminar esta unidad');
      }
      if (req.user.role === 'MANAGER' && (unit as any).property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para eliminar esta unidad');
      }
    }
    return this.unitsService.remove(id);
  }
}
