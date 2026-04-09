import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SaasOnboardingService } from './saas-onboarding.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Protegido por JWT

@Controller('saas-onboarding')
export class SaasOnboardingController {
  constructor(private readonly onboardingService: SaasOnboardingService) {}

  @UseGuards(JwtAuthGuard) // Solo superadmins logueados pueden inscribir empresas
  @Post('provision')
  async provisionTenant(@Body() payload: any) {
    return await this.onboardingService.provisionSaaSClient(payload);
  }

  // Túnel Público para el Autocobro (Stripe/MP)
  @Post('checkout')
  async publicCheckout(@Body() payload: any) {
    // Aquí implementaremos posteriormente validación de firmas de Stripe
    // Por ahora detona el aprovisionamiento directo
    return await this.onboardingService.provisionSaaSClient(payload);
  }
}
