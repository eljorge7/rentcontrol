import { Module } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { MercadopagoController } from './mercadopago.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MikrotikModule } from '../mikrotik/mikrotik.module';

import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, MikrotikModule, SettingsModule],
  controllers: [MercadopagoController],
  providers: [MercadopagoService],
})
export class MercadopagoModule {}
