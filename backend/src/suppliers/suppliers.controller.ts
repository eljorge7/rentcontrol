import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  create(@Body() createSupplierDto: Prisma.SupplierUncheckedCreateInput, @Request() req: any) {
    if (req.user.role === 'MANAGER') {
      // @ts-ignore: Prisma client needs generation
      createSupplierDto.managerId = req.user.userId;
    }
    return this.suppliersService.create(createSupplierDto);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Get()
  findAll(@Request() req: any) {
    return this.suppliersService.findAll();
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSupplierDto: Prisma.SupplierUpdateInput) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
