import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Roles('ADMIN', 'MANAGER')
  @Get('summary')
  getSummary(@Request() req: any) {
    return this.commissionsService.getSummary(req.user);
  }

  @Roles('MANAGER')
  @Get('my-commissions')
  getMyCommissions(@Request() req: any) {
    return this.commissionsService.getManagerCommissions(req.user.userId);
  }

  @Roles('MANAGER')
  @Get('my-payrolls')
  getMyPayrolls(@Request() req: any) {
    return this.commissionsService.getManagerPayrolls(req.user.userId);
  }

  @Roles('ADMIN')
  @Get('pending-balances')
  getPendingBalances() {
    return this.commissionsService.getPendingBalancesByManager();
  }

  @Roles('ADMIN')
  @Get('payrolls')
  getAllPayrolls() {
    return this.commissionsService.getAllPayrolls();
  }

  @Roles('ADMIN')
  @Post('payout')
  processPayout(@Body() payoutDto: { managerId: string }) {
    return this.commissionsService.processPayout(payoutDto.managerId);
  }

  @Roles('ADMIN', 'MANAGER')
  @Post('event')
  createEventCommission(@Body() createDto: { managerId: string; eventTypeId: string }) {
    return this.commissionsService.createEventCommission(createDto);
  }
}
