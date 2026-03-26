import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MikrotikModule } from '../mikrotik/mikrotik.module';

import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, MikrotikModule, SettingsModule],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
