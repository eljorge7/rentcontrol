import { Controller, Get, Post, Body, Patch, Param, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PayrollRunsService } from './payroll-runs.service';

@Controller('payroll-runs')
export class PayrollRunsController {
  constructor(private readonly payrollRunsService: PayrollRunsService) {}

  @Post()
  create(@Body() createPayrollRunDto: any, @Req() req: any) {
    const managerId = req.user?.id || 'TODO_OVERRIDE_IN_AUTH'; 
    return this.payrollRunsService.create(createPayrollRunDto, managerId);
  }

  @Post(':id/generate')
  generatePayslips(@Param('id') id: string) {
    return this.payrollRunsService.generatePayslips(id);
  }

  @Get()
  findAll() {
    return this.payrollRunsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollRunsService.findOne(id);
  }
  
  @Patch('payslips/:id')
  updatePayslip(@Param('id') id: string, @Body() updateDto: any) {
    return this.payrollRunsService.updatePayslip(id, updateDto);
  }

  @Post(':id/pay')
  approveAndPay(@Param('id') id: string) {
    return this.payrollRunsService.approveAndPay(id);
  }

  @Get(':id/export')
  async exportLayout(@Param('id') id: string, @Res() res: Response) {
    const data = await this.payrollRunsService.exportBankLayout(id);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="layout_spei_${id.substring(0,8)}.txt"`);
    res.send(data);
  }
}
