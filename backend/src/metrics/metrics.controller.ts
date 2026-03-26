import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
  async getAdminMetrics() {
    return this.metricsService.getAdminMetrics();
  }

  @Get('manager')
  @Roles('MANAGER')
  async getManagerMetrics(@Request() req: any) {
    const managerId = req.user.userId;
    return this.metricsService.getManagerMetrics(managerId);
  }

  @Get('owner')
  @Roles('OWNER')
  async getOwnerMetrics(@Request() req: any) {
    const ownerId = req.user.userId;
    return this.metricsService.getOwnerMetrics(ownerId);
  }
}
