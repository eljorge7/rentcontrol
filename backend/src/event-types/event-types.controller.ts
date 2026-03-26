import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('event-types')
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() createDto: any) {
    return this.eventTypesService.create(createDto);
  }

  @Roles('ADMIN', 'MANAGER')
  @Get()
  findAll() {
    return this.eventTypesService.findAll();
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.eventTypesService.update(id, updateDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventTypesService.remove(id);
  }
}
