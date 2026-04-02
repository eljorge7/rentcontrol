import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('admin')
  @Roles('ADMIN')
  async getAdminMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.metricsService.getAdminMetrics(startDate, endDate);
  }

  @Get('manager')
  @Roles('MANAGER')
  async getManagerMetrics(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const managerId = req.user.userId;
    return this.metricsService.getManagerMetrics(managerId, startDate, endDate);
  }

  @Get('owner')
  @Roles('OWNER')
  async getOwnerMetrics(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const ownerId = req.user.userId;
    return this.metricsService.getOwnerMetrics(ownerId, startDate, endDate);
  }
}
