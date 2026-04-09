import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Post()
  create(@Request() req: any, @Body() createExpenseDto: Prisma.ExpenseUncheckedCreateInput) {
    return this.expensesService.create(createExpenseDto, req.user);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Post('upload-xml')
  uploadXml(@Request() req: any, @Body('xmlContent') xmlContent: string, @Body('propertyId') propertyId?: string) {
    if (!xmlContent) return { error: "xmlContent es requerido" };
    return this.expensesService.parseXmlAndCreateExpense(xmlContent, propertyId, req.user);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Get()
  findAll(@Request() req: any, @Query('propertyId') propertyId?: string) {
    return this.expensesService.findAll(req.user, propertyId);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Get('profitability/:propertyId')
  getProfitability(@Request() req: any, @Param('propertyId') propertyId: string) {
    return this.expensesService.getProfitability(propertyId, req.user);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.expensesService.findOne(id, req.user);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateExpenseDto: Prisma.ExpenseUpdateInput) {
    return this.expensesService.update(id, updateExpenseDto, req.user);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.expensesService.remove(id, req.user);
  }
}
