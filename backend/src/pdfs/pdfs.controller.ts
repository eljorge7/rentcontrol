import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { PdfsService } from './pdfs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('pdfs')
export class PdfsController {
  constructor(private readonly pdfsService: PdfsService) {}

  @Get('account-statement/:leaseId')
  async getAccountStatement(@Param('leaseId') leaseId: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=estado-de-cuenta-${leaseId}.pdf`);
    await this.pdfsService.generateAccountStatement(leaseId, res);
  }

  @Get('lease/:leaseId')
  async getLeaseContract(@Param('leaseId') leaseId: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrato-${leaseId}.pdf`);
    await this.pdfsService.generateLeaseContract(leaseId, res);
  }
}
