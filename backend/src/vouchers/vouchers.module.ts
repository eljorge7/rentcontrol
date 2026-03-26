import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MikrotikModule } from '../mikrotik/mikrotik.module';

@Module({
  imports: [PrismaModule, MikrotikModule],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
