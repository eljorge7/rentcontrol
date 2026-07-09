import { Controller, Post, Body, Get, Param, Put, Delete, Query, Headers } from '@nestjs/common';
import { AutomationsService } from './automations.service';

@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  // Central Webhook Endpoint
  @Post('webhook')
  async handleWebhook(
    @Body('triggerApp') triggerApp: string,
    @Body('triggerEvent') triggerEvent: string,
    @Body('companyId') companyId: string,
    @Body('payload') payload: any
  ) {
    return this.automationsService.processWebhook(triggerApp, triggerEvent, companyId, payload);
  }

  // CRUD para el Frontend (Magia OS Dashboard)
  @Get()
  async getRules(@Query('companyId') companyId: string) {
    if (!companyId) return [];
    return this.automationsService.getRules(companyId);
  }

  @Post()
  async createRule(@Body() body: any) {
    return this.automationsService.createRule(body);
  }

  @Put(':id')
  async updateRule(@Param('id') id: string, @Body() body: any) {
    return this.automationsService.updateRule(id, body);
  }

  @Delete(':id')
  async deleteRule(@Param('id') id: string) {
    return this.automationsService.deleteRule(id);
  }
}
