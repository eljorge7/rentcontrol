import { Module } from '@nestjs/common';
import { PayrollRunsService } from './payroll-runs.service';
import { PayrollRunsController } from './payroll-runs.controller';
import { FacturaproModule } from '../facturapro/facturapro.module';
import { TaxCalculatorService } from './tax-calculator.service';

@Module({
  imports: [FacturaproModule],
  controllers: [PayrollRunsController],
  providers: [PayrollRunsService, TaxCalculatorService],
})
export class PayrollRunsModule {}
