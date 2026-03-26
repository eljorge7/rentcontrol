import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post('batch')
  createBatch(@Body() body: { amount: number, duration: number, price: number, routerId: string, propertyId?: string }, @Request() req: any) {
    return this.vouchersService.createBatch(body, req.user);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.vouchersService.findAll(req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.vouchersService.remove(id, req.user);
  }
}
