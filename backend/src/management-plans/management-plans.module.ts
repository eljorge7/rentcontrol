import { Module } from '@nestjs/common';
import { ManagementPlansService } from './management-plans.service';
import { ManagementPlansController } from './management-plans.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManagementPlansController],
  providers: [ManagementPlansService],
  exports: [ManagementPlansService]
})
export class ManagementPlansModule {}
