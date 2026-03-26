import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MikrotikService } from './mikrotik.service';
import { CreateMikrotikDto } from './dto/create-mikrotik.dto';
import { UpdateMikrotikDto } from './dto/update-mikrotik.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mikrotik')
export class MikrotikController {
  constructor(private readonly mikrotikService: MikrotikService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() createMikrotikDto: CreateMikrotikDto) {
    return this.mikrotikService.create(createMikrotikDto);
  }

  @Roles('ADMIN', 'MANAGER')
  @Get()
  findAll() {
    return this.mikrotikService.findAll();
  }

  @Roles('ADMIN', 'MANAGER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mikrotikService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMikrotikDto: UpdateMikrotikDto) {
    return this.mikrotikService.update(id, updateMikrotikDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mikrotikService.remove(id);
  }

  @Roles('ADMIN')
  @Get(':id/install-script')
  generateInstallScript(@Param('id') id: string) {
    return this.mikrotikService.generateInstallScript(id);
  }

  @Roles('ADMIN', 'MANAGER')
  @Get(':id/test')
  testConnection(@Param('id') id: string) {
    return this.mikrotikService.testConnection(id);
  }

  @Roles('ADMIN')
  @Post(':id/suspend')
  suspendIp(@Param('id') id: string, @Body('ipAddress') ipAddress: string) {
    return this.mikrotikService.suspendIp(id, ipAddress);
  }

  @Roles('ADMIN')
  @Post(':id/restore')
  restoreIp(@Param('id') id: string, @Body('ipAddress') ipAddress: string) {
    return this.mikrotikService.restoreIp(id, ipAddress);
  }
}
