import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('dashboard')
  getDashboardStats() {
    return this.appService.getDashboardStats();
  }

  @Get('dashboard/tenant/:id')
  getTenantDashboard(@Param('id') id: string) {
    return this.appService.getTenantDashboard(id);
  }

  @Get('dashboard/owner/:id')
  getOwnerDashboardStats(@Param('id') id: string) {
    return this.appService.getOwnerDashboardStats(id);
  }

  @Get('dashboard/owner/:id/billing')
  getOwnerBilling(@Param('id') id: string) {
    return this.appService.getOwnerBilling(id);
  }
}
