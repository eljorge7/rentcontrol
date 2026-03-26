import { Controller, Post, Body, Req, Headers, UseGuards, UnauthorizedException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TENANT', 'ADMIN', 'OWNER')
  async createCheckoutSession(@Body('chargeId') chargeId: string, @Req() req: any) {
    if (!chargeId) {
      throw new UnauthorizedException('chargeId is required');
    }
    return this.stripeService.createCheckoutSession(chargeId, req.user);
  }

  @Post('webhook')
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() req: any) {
    if (!req.rawBody) {
       return { error: 'rawBody is empty' };
    }
    return this.stripeService.handleWebhook(signature, req.rawBody);
  }
}
