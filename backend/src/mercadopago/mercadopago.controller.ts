import { Controller, Post, Body, Req, Query, UseGuards, UnauthorizedException } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('mercadopago')
export class MercadopagoController {
  constructor(private readonly mpService: MercadopagoService) {}

  @Post('create-preference')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TENANT', 'ADMIN', 'OWNER')
  async createPreference(@Body('chargeId') chargeId: string, @Req() req: any) {
    if (!chargeId) {
      throw new UnauthorizedException('chargeId is required');
    }
    return this.mpService.createPreference(chargeId, req.user);
  }

  // Webhook is public so Mercado Pago can reach it
  @Post('webhook')
  async handleWebhook(@Query() query: any, @Body() body: any) {
    return this.mpService.handleWebhook(query, body);
  }
}
