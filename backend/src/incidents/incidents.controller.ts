import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentsService } from './incidents.service';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('incidents')
export class IncidentsController {
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly prisma: PrismaService
  ) {}

  @Get('public/:id')
  findPublic(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch('public/:id/resolve')
  async resolvePublic(
    @Param('id') id: string,
    @Body() data: { cost?: number, supplierNotes?: string, evidenceUrl?: string }
  ) {
    return this.incidentsService.resolvePublic(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)

  @Roles(Role.ADMIN, Role.MANAGER, Role.TENANT)
  @Post()
  async create(@Body() createIncidentDto: Prisma.IncidentUncheckedCreateInput, @Request() req: any) {
    try {
      let finalData: Prisma.IncidentUncheckedCreateInput = {
        description: createIncidentDto.description,
        priority: createIncidentDto.priority,
        status: createIncidentDto.status || 'PENDING',
        unitId: createIncidentDto.unitId,
        tenantId: createIncidentDto.tenantId,
      };

      // If a tenant creates the incident, force their own tenantId and infer unitId for security
      if (req.user.role === 'TENANT') {
        const tenant = await this.prisma.tenant.findUnique({
          where: { userId: req.user.userId },
          include: { leases: { where: { status: 'ACTIVE' }, select: { unitId: true } } }
        });
        
        if (!tenant || tenant.leases.length === 0) {
          throw new Error('No active lease found for this tenant to attach the incident to.');
        }
        
        finalData.tenantId = tenant.id;
        finalData.unitId = tenant.leases[0].unitId; // Attach to the primary active lease unit
      }
      
      // Safety check to ensure we don't try to create a record without mandatory fields
      if (!finalData.unitId || !finalData.tenantId) {
         throw new Error('Mandatory fields missing: unitId or tenantId could not be inferred.');
      }

      return await this.incidentsService.create(finalData);
    } catch (error: any) {
      console.error("Error creating incident:", error);
      throw new Error(error.message || 'Error occurred while creating the incident');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER, Role.TENANT)
  @Get()
  findAll(@Request() req: any) {
    const role = req.user.role;
    const userId = req.user.userId;

    if (role === 'TENANT') {
      return this.incidentsService.findAll(userId);
    }
    
    if (role === 'OWNER') {
      return this.incidentsService.findAll(undefined, userId);
    }
    
    if (role === 'MANAGER') {
      return this.incidentsService.findAll(undefined, undefined, userId);
    }

    return this.incidentsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER, Role.TENANT)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.incidentsService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncidentDto: Prisma.IncidentUpdateInput, @Request() req: any) {
    return this.incidentsService.update(id, updateIncidentDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
    @Body('supplierId') supplierId?: string
  ) {
    return this.incidentsService.updateStatus(id, status, req.user, supplierId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id/propose-cost')
  proposeCost(
    @Param('id') id: string,
    @Body() body: { supplierCost: number; rcMarkup: number },
    @Request() req: any
  ) {
    return this.incidentsService.proposeCost(id, body.supplierCost, body.rcMarkup, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @Patch(':id/approve-cost')
  approveCost(
    @Param('id') id: string,
    @Body('billedTo') billedTo: string,
    @Request() req: any
  ) {
    return this.incidentsService.approveCost(id, billedTo, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post(':id/notify-supplier')
  notifySupplier(@Param('id') id: string, @Request() req: any) {
    return this.incidentsService.notifySupplier(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.incidentsService.remove(id, req.user);
  }
}
