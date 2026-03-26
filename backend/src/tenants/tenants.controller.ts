import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Request() req: any, @Body() createTenantDto: CreateTenantDto) {
    const data: any = { ...createTenantDto };
    if (req.user.role === 'OWNER') {
      data.ownerId = req.user.userId;
    } else if (req.user.role === 'MANAGER') {
      if (!data.ownerId) throw new ForbiddenException('Debes especificar a qué propietario pertenece este inquilino.');
      const owner = await this.prisma.user.findUnique({ where: { id: data.ownerId } });
      if (!owner || owner.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para agregar inquilinos a este propietario.');
      }
    }
    return this.tenantsService.create(data);
  }

  @Get()
  async findAll(@Request() req: any) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const whereClause: any = {};
      
      if (req.user.role === 'OWNER') {
        whereClause.ownerId = req.user.userId;
      } else if (req.user.role === 'MANAGER') {
        whereClause.owner = { managerId: req.user.userId };
      }

      return this.prisma.tenant.findMany({
        where: whereClause,
        include: {
          leases: {
            include: { unit: { include: { property: true } } }
          }
        },
        orderBy: { name: 'asc' },
      });
    }

    // If tenant, only return their own profile
    if (req.user.role === 'TENANT') {
      const tenant = await this.prisma.tenant.findUnique({
        where: { userId: req.user.userId },
        include: {
          leases: {
            include: { unit: { include: { property: true } } }
          }
        }
      });
      return tenant ? [tenant] : [];
    }

    return this.tenantsService.findAll();
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const tenant: any = await this.tenantsService.findOne(id);
    if (!tenant) throw new NotFoundException('Inquilino no encontrado');

    if (req.user.role === 'OWNER' && tenant.ownerId !== req.user.userId) {
      throw new ForbiddenException('No tienes permiso para ver a este inquilino');
    }
    if (req.user.role === 'MANAGER') {
       const owner = await this.prisma.user.findUnique({ where: { id: tenant.ownerId } });
       if (owner?.managerId !== req.user.userId) {
          throw new ForbiddenException('No tienes permiso para ver a este inquilino');
       }
    }

    return tenant;
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const tenant: any = await this.prisma.tenant.findUnique({ where: { id }, include: { owner: true } as any });
      if (!tenant) throw new NotFoundException('Inquilino no encontrado');
      
      if (req.user.role === 'OWNER' && tenant.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para editar este inquilino');
      }
      if (req.user.role === 'MANAGER' && tenant.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para editar este inquilino');
      }
    }
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role === 'OWNER' || req.user.role === 'MANAGER') {
      const tenant: any = await this.prisma.tenant.findUnique({ where: { id }, include: { owner: true } as any });
      if (!tenant) throw new NotFoundException('Inquilino no encontrado');
      
      if (req.user.role === 'OWNER' && tenant.ownerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para eliminar este inquilino');
      }
      if (req.user.role === 'MANAGER' && tenant.owner?.managerId !== req.user.userId) {
        throw new ForbiddenException('No tienes permiso para eliminar este inquilino');
      }
    }
    return this.tenantsService.remove(id);
  }
}
