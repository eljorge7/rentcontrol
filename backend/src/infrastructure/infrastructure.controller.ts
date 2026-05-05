import { Controller, Get, UseGuards } from '@nestjs/common';
import { InfrastructureService } from './infrastructure.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('infrastructure')
export class InfrastructureController {
  constructor(private readonly infService: InfrastructureService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('health')
  async getHealth() {
    return this.infService.getSystemHealth();
  }
}
