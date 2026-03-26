import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Post('leases/:leaseId/checklists')
  async create(
    @Param('leaseId') leaseId: string, 
    @Body() createChecklistDto: any,
    @Request() req: any
  ) {
    const managerId = req.user.userId;
    return this.checklistsService.create(leaseId, managerId, createChecklistDto);
  }

  @Get('leases/:leaseId/checklists')
  async findAll(@Param('leaseId') leaseId: string) {
    return this.checklistsService.findAllByLease(leaseId);
  }

  @Get('checklists/:id')
  async findOne(@Param('id') id: string) {
    const checklist = await this.checklistsService.findOne(id);
    if (!checklist) throw new NotFoundException('Inventory Checklist not found');
    return checklist;
  }

  @Delete('checklists/:id')
  async remove(@Param('id') id: string) {
    return this.checklistsService.remove(id);
  }
}
