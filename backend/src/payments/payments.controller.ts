import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  create(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto, req.user);
  }

  @Get()
  @Roles('ADMIN', 'OWNER', 'MANAGER', 'TENANT')
  findAll(@Request() req: any) {
    return this.paymentsService.findAll(req.user);
  }

  @Get(':id')
  @Roles('ADMIN', 'OWNER', 'MANAGER', 'TENANT')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  update(@Request() req: any, @Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.remove(id, req.user);
  }

  @Post(':id/invoice')
  @Roles('ADMIN', 'MANAGER', 'TENANT')
  async requestInvoice(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.requestManualInvoice(id, req.user);
  }
}
