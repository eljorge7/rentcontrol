import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  // Módulo de Gestor (Protegido por JWT y Rol)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  @Post()
  create(@Request() req: any, @Body() createQuotationDto: CreateQuotationDto) {
    const managerId = req.user.userId;
    return this.quotationsService.create(managerId, createQuotationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  @Get()
  findAll(@Request() req: any) {
    const managerId = req.user.userId;
    return this.quotationsService.findAll(managerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  findAllForAdmin() {
    return this.quotationsService.findAllForAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  @Get('detail/:id')
  findOne(@Request() req: any, @Param('id') id: string) {
    const managerId = req.user.userId;
    return this.quotationsService.findOne(id, managerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateQuotationDto: any) {
    const managerId = req.user.userId;
    return this.quotationsService.update(id, managerId, updateQuotationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  @Patch(':id/request-billing')
  requestBilling(@Request() req: any, @Param('id') id: string) {
    const managerId = req.user.userId;
    return this.quotationsService.requestBilling(id, managerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    const managerId = req.user.userId;
    return this.quotationsService.remove(id, managerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/invoice')
  markAsInvoiced(@Param('id') id: string) {
    return this.quotationsService.markAsInvoiced(id);
  }

  // Endpoints Públicos (Para el Prospecto)
  @Get(':id/public')
  getPublicQuotation(@Param('id') id: string) {
    return this.quotationsService.getPublicQuotation(id);
  }

  @Post(':id/accept')
  acceptQuotation(@Param('id') id: string) {
    return this.quotationsService.acceptQuotation(id);
  }
}
