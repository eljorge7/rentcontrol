import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('dashboard')
  getDashboardStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appService.getDashboardStats(startDate, endDate);
  }

  @Get('dashboard/tenant/:id')
  getTenantDashboard(@Param('id') id: string) {
    return this.appService.getTenantDashboard(id);
  }

  @Get('dashboard/owner/:id')
  getOwnerDashboardStats(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appService.getOwnerDashboardStats(id, startDate, endDate);
  }

  @Get('dashboard/owner/:id/billing')
  getOwnerBilling(@Param('id') id: string) {
    return this.appService.getOwnerBilling(id);
  }
}
