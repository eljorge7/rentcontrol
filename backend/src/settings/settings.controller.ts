import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('ADMIN')
  async findAll() {
    // Return all settings, including secrets (Only Admin can do this)
    const settings = await this.settingsService.findAllPublic();
    const result: Record<string, string> = {};
    settings.forEach((s: any) => { result[s.key] = s.value; });
    return result;
  }

  @Post('bulk')
  @Roles('ADMIN')
  async updateBulk(@Body() updateData: Record<string, string>) {
    return this.settingsService.upsertBulk(updateData);
  }
}
