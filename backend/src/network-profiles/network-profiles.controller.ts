import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NetworkProfilesService } from './network-profiles.service';
import { CreateNetworkProfileDto } from './dto/create-network-profile.dto';
import { UpdateNetworkProfileDto } from './dto/update-network-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('network-profiles')
export class NetworkProfilesController {
  constructor(private readonly networkProfilesService: NetworkProfilesService) {}

  @Get('public')
  findPublic() {
    return this.networkProfilesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createNetworkProfileDto: CreateNetworkProfileDto) {
    return this.networkProfilesService.create(createNetworkProfileDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get()
  findAll() {
    return this.networkProfilesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.networkProfilesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNetworkProfileDto: UpdateNetworkProfileDto) {
    return this.networkProfilesService.update(id, updateNetworkProfileDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.networkProfilesService.remove(id);
  }
}
