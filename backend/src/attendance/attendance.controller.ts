import { Controller, Get, Post, Body, Param, Delete, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: any, @Req() req: any) {
    const recordedById = req.user?.id || 'TODO_OVERRIDE_IN_AUTH';
    return this.attendanceService.create(createAttendanceDto, recordedById);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
