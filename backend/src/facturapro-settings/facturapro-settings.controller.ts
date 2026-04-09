import { Controller, Get, Put, Body, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FacturaproSettingsService } from './facturapro-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('facturapro-settings')
@UseGuards(JwtAuthGuard)
export class FacturaproSettingsController {
  constructor(private readonly facturaproSettingsService: FacturaproSettingsService) {}

  // ----------------------------------------------------
  // Settings (Prefix and Folio)
  // ----------------------------------------------------

  @Get()
  getSettings(@Request() req: any) {
    // Para simplificar, asumimos que el user ID del JWT es el "tenant/manager"
    return this.facturaproSettingsService.getSettings(req.user.userId);
  }

  @Put()
  updateSettings(@Request() req: any, @Body() body: any) {
    return this.facturaproSettingsService.updateSettings(req.user.userId, body);
  }

  // ----------------------------------------------------
  // API Keys (Developers Integration)
  // ----------------------------------------------------

  @Get('api-keys')
  getApiKeys(@Request() req: any) {
    return this.facturaproSettingsService.getApiKeys(req.user.userId);
  }

  @Post('api-keys')
  generateApiKey(@Request() req: any, @Body('name') name: string) {
    return this.facturaproSettingsService.generateApiKey(req.user.userId, name);
  }

  @Delete('api-keys/:id')
  revokeApiKey(@Request() req: any, @Param('id') id: string) {
    return this.facturaproSettingsService.revokeApiKey(req.user.userId, id);
  }

  @Get('sso-link')
  getSsoLink(@Request() req: any) {
    return this.facturaproSettingsService.getSsoLink(req.user.userId);
  }
}
