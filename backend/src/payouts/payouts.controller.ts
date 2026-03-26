import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get('index')
  @Roles('ADMIN', 'MANAGER')
  getAllPayouts(@Request() req: any) {
    return this.payoutsService.getAllPayouts(req.user.userId, req.user.role);
  }

  @Get('balance/:ownerId')
  @Roles('ADMIN', 'MANAGER')
  getPendingBalance(@Param('ownerId') ownerId: string, @Request() req: any) {
    return this.payoutsService.getPendingBalance(ownerId, req.user.userId, req.user.role);
  }

  @Post('generate/:ownerId')
  @Roles('ADMIN', 'MANAGER')
  generatePayout(
    @Param('ownerId') ownerId: string, 
    @Body('notes') notes: string, 
    @Request() req: any
  ) {
    return this.payoutsService.generatePayout(ownerId, req.user.userId, req.user.role, notes);
  }

  @Get('manager/:ownerId')
  @Roles('ADMIN', 'MANAGER')
  getManagerPayouts(@Param('ownerId') ownerId: string, @Request() req: any) {
    return this.payoutsService.getPayouts(ownerId, req.user.userId);
  }

  @Get('owner/my-payouts')
  @Roles('ADMIN', 'OWNER') // Para que el dueño vea sus propias liquidaciones
  getOwnerPayouts(@Request() req: any) {
    return this.payoutsService.getPayoutsForOwner(req.user.userId);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'OWNER')
  getPayoutDetails(@Param('id') id: string, @Request() req: any) {
    return this.payoutsService.getPayoutDetails(id, req.user.userId, req.user.role);
  }

  @Patch(':id/pay')
  @Roles('ADMIN', 'MANAGER')
  markAsPaid(@Param('id') id: string, @Request() req: any) {
    return this.payoutsService.markAsPaid(id, req.user.userId);
  }
}
