import { Module } from '@nestjs/common';
import { FacturaProService } from './facturapro.service';

@Module({
  providers: [FacturaProService],
  exports: [FacturaProService],
})
export class FacturaproModule {}
