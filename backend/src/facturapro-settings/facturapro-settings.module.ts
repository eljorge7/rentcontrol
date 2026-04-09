import { Module } from '@nestjs/common';
import { FacturaproSettingsService } from './facturapro-settings.service';
import { FacturaproSettingsController } from './facturapro-settings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FacturaproSettingsService],
  controllers: [FacturaproSettingsController]
})
export class FacturaproSettingsModule {}
