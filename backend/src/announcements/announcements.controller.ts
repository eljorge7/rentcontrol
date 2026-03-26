import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private prisma: PrismaService) {}

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Post()
  async createAnnouncement(@Body() body: any, @Request() req: any) {
    const { title, content, targetRole, propertyId } = body;
    return this.prisma.announcement.create({
      data: {
        title,
        content,
        authorId: req.user.userId,
        authorRole: req.user.role,
        targetRole,
        propertyId
      }
    });
  }

  @Get()
  async getAnnouncements(@Request() req: any) {
    const role = req.user.role;
    // Tenants solo ven notificaciones globales o dirigidas a TENANT
    if (role === 'TENANT') {
      return this.prisma.announcement.findMany({
        where: {
          OR: [
            { targetRole: null },
            { targetRole: 'TENANT' }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Admins ven todas
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  async deleteAnnouncement(@Param('id') id: string) {
    return this.prisma.announcement.delete({ where: { id } });
  }
}
