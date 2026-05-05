import { Controller, Get, Post, Body, Patch, Param, Req } from '@nestjs/common';
import { TimeOffService } from './time-off.service';

@Controller('time-off')
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Post()
  create(@Body() createTimeOffDto: any) {
    return this.timeOffService.create(createTimeOffDto);
  }

  @Get()
  findAll() {
    return this.timeOffService.findAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    const managerId = req.user?.id || 'TODO_OVERRIDE_IN_AUTH';
    return this.timeOffService.updateStatus(id, status, managerId);
  }
}
