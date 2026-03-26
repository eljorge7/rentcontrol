import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('leases')
export class LeasesController {
  constructor(
    private readonly leasesService: LeasesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Request() req: any, @Body() createLeaseDto: CreateLeaseDto) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const unit: any = await this.prisma.unit.findUnique({
        where: { id: createLeaseDto.unitId },
        include: { property: { include: { owner: true } } } as any
      });
      if (!unit) throw new NotFoundException('Unidad no encontrada');
      if (req.user.role === 'OWNER' && unit.property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para crear un contrato en esta unidad');
      }
      if (req.user.role === 'MANAGER' && unit.property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para crear un contrato en esta unidad');
      }
    }
    return this.leasesService.create(createLeaseDto);
  }

  @Get()
  async findAll(@Request() req: any) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const pWhere: any = {};
      if (req.user.role === 'OWNER') pWhere.ownerId = req.user.userId;
      else if (req.user.role === 'MANAGER') pWhere.owner = { managerId: req.user.userId };

      const properties = await this.prisma.property.findMany({
        where: pWhere,
        select: { id: true }
      });
      const propertyIds = properties.map(p => p.id);
      
      const units = await this.prisma.unit.findMany({
        where: { propertyId: { in: propertyIds } },
        select: { id: true }
      });
      const unitIds = units.map(u => u.id);

      return this.prisma.lease.findMany({
        where: { unitId: { in: unitIds } },
        include: {
          unit: { include: { property: true } },
          tenant: true,
          services: { include: { profile: true } },
        },
        orderBy: { startDate: 'desc' },
      });
    }
    return this.leasesService.findAll();
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const lease: any = await this.leasesService.findOne(id);
    if (!lease) throw new NotFoundException('Contrato no encontrado');

    if (req.user.role === 'OWNER' && lease.unit.property.ownerId !== req.user.userId) {
      throw new ForbiddenException('No tienes permiso para ver este contrato');
    }
    if (req.user.role === 'MANAGER') {
      const owner = await this.prisma.user.findUnique({ where: { id: lease.unit.property.ownerId } });
      if (owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para ver este contrato');
      }
    }

    return lease;
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateLeaseDto: UpdateLeaseDto) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const lease: any = await this.prisma.lease.findUnique({ where: { id }, include: { unit: { include: { property: { include: { owner: true } } } } } as any });
      if (!lease) throw new NotFoundException('Contrato no encontrado');
      
      if (req.user.role === 'OWNER' && lease.unit.property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para editar este contrato');
      }
      if (req.user.role === 'MANAGER' && lease.unit.property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para editar este contrato');
      }
    }
    return this.leasesService.update(id, updateLeaseDto);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const lease: any = await this.prisma.lease.findUnique({ where: { id }, include: { unit: { include: { property: { include: { owner: true } } } } } as any });
      if (!lease) throw new NotFoundException('Contrato no encontrado');

      if (req.user.role === 'OWNER' && lease.unit.property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para eliminar este contrato');
      }
      if (req.user.role === 'MANAGER' && lease.unit.property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para eliminar este contrato');
      }
    }
    return this.leasesService.remove(id);
  }

  @Patch(':id/terminate')
  async terminate(@Request() req: any, @Param('id') id: string) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const lease: any = await this.prisma.lease.findUnique({ where: { id }, include: { unit: { include: { property: { include: { owner: true } } } } } as any });
      if (!lease) throw new NotFoundException('Contrato no encontrado');

      if (req.user.role === 'OWNER' && lease.unit.property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para finalizar este contrato');
      }
      if (req.user.role === 'MANAGER' && lease.unit.property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para finalizar este contrato');
      }
    }
    return this.leasesService.terminate(id);
  }

  @Post(':id/services')
  async addService(@Request() req: any, @Param('id') id: string, @Body() data: { networkProfileId: string, ipAddress?: string, macAddress?: string, pppoeUser?: string, pppoePassword?: string }) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const lease: any = await this.prisma.lease.findUnique({ where: { id }, include: { unit: { include: { property: { include: { owner: true } } } } } as any });
      if (!lease) throw new NotFoundException('Contrato no encontrado');
      if (req.user.role === 'OWNER' && lease.unit.property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para modificar este contrato');
      }
      if (req.user.role === 'MANAGER' && lease.unit.property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para modificar este contrato');
      }
    }
    return this.leasesService.addService(id, data);
  }

  @Patch(':id/services/:serviceId/status')
  async updateServiceStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @Body('status') status: string
  ) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const lease: any = await this.prisma.lease.findUnique({ where: { id }, include: { unit: { include: { property: { include: { owner: true } } } } } as any });
      if (!lease) throw new NotFoundException('Contrato no encontrado');
      if (req.user.role === 'OWNER' && lease.unit.property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para modificar este contrato');
      }
      if (req.user.role === 'MANAGER' && lease.unit.property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para modificar este contrato');
      }
    }
    return this.leasesService.updateServiceStatus(serviceId, status);
  }

  @Patch(':id/services/:serviceId/profile')
  async updateServiceProfile(
    @Request() req: any,
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @Body('networkProfileId') networkProfileId: string
  ) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const lease: any = await this.prisma.lease.findUnique({ where: { id }, include: { unit: { include: { property: { include: { owner: true } } } } } as any });
      if (!lease) throw new NotFoundException('Contrato no encontrado');
      if (req.user.role === 'OWNER' && lease.unit.property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para modificar este contrato');
      }
      if (req.user.role === 'MANAGER' && lease.unit.property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para modificar este contrato');
      }
    }
    return this.leasesService.updateServiceProfile(serviceId, networkProfileId);
  }

  @Delete(':id/services/:serviceId')
  async removeService(
    @Request() req: any, 
    @Param('id') id: string, 
    @Param('serviceId') serviceId: string
  ) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const lease: any = await this.prisma.lease.findUnique({ where: { id }, include: { unit: { include: { property: { include: { owner: true } } } } } as any });
      if (!lease) throw new NotFoundException('Contrato no encontrado');
      if (req.user.role === 'OWNER' && lease.unit.property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para modificar este contrato');
      }
      if (req.user.role === 'MANAGER' && lease.unit.property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para modificar este contrato');
      }
    }
    return this.leasesService.removeService(serviceId);
  }

  @Patch(':id/signatures')
  async updateSignatures(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const lease: any = await this.prisma.lease.findUnique({ where: { id }, include: { unit: { include: { property: { include: { owner: true } } } } } as any });
      if (!lease) throw new NotFoundException('Contrato no encontrado');
      if (req.user.role === 'OWNER' && lease.unit.property.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para modificar este contrato');
      }
      if (req.user.role === 'MANAGER' && lease.unit.property.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para modificar este contrato');
      }
    }
    return this.leasesService.updateSignatures(id, body.tenantSignature, body.managerSignature);
  }
}
