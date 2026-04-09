import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { AppsService } from './apps.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/apps')
@UseGuards(JwtAuthGuard)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get()
  async getCatalog() {
    return this.appsService.getAllApps();
  }

  @Post('subscribe')
  async subscribe(@Req() req: any, @Body() body: { tierId: string, billingCycle: string }) {
    return this.appsService.subscribe(req.user.userId || req.user.id, body.tierId, body.billingCycle || 'MONTHLY');
  }

  @Get('my-subscriptions')
  async getMySubscriptions(@Req() req: any) {
    return this.appsService.getMySubscriptions(req.user.userId || req.user.id);
  }

  @Get('admin/subscriptions')
  async getAllSubscriptions(@Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      return { msg: 'Forbidden' };
    }
    return this.appsService.getAllSubscriptions();
  }

  @Post('admin/subscriptions/:id')
  async updateSubscription(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'ADMIN') {
      return { msg: 'Forbidden' };
    }
    return this.appsService.updateSubscription(id, body);
  }
}
