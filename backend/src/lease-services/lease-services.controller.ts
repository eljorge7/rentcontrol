import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LeaseServicesService } from './lease-services.service';
import { CreateLeaseServiceDto } from './dto/create-lease-service.dto';
import { UpdateLeaseServiceDto } from './dto/update-lease-service.dto';

@Controller('lease-services')
export class LeaseServicesController {
  constructor(private readonly leaseServicesService: LeaseServicesService) {}

  @Post()
  create(@Body() createLeaseServiceDto: CreateLeaseServiceDto) {
    return this.leaseServicesService.create(createLeaseServiceDto);
  }

  @Get()
  findAll() {
    return this.leaseServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaseServicesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaseServiceDto: UpdateLeaseServiceDto) {
    return this.leaseServicesService.update(id, updateLeaseServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaseServicesService.remove(id);
  }
}
