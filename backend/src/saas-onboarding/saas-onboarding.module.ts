import { Module } from '@nestjs/common';
import { SaasOnboardingController } from './saas-onboarding.controller';
import { SaasOnboardingService } from './saas-onboarding.service';
import { SaasBillingService } from './saas-billing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [SaasOnboardingController],
  providers: [SaasOnboardingService, SaasBillingService],
})
export class SaasOnboardingModule {}
