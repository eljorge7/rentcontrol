import { Module } from '@nestjs/common';
import { SaasOnboardingController } from './saas-onboarding.controller';
import { SaasOnboardingService } from './saas-onboarding.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [SaasOnboardingController],
  providers: [SaasOnboardingService],
})
export class SaasOnboardingModule {}
