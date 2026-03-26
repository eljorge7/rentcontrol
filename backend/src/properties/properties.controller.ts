import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(@Request() req: any, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto, req.user);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.propertiesService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.propertiesService.findOne(id, req.user);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updatePropertyDto, req.user);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.propertiesService.remove(id, req.user);
  }
}
