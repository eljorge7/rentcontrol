import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private prisma: PrismaService) {}

  @Get('contacts')
  async getContacts(@Request() req: any) {
    const userId = req.user.userId;
    const role = req.user.role;
    let contacts = [];

    if (role === 'MANAGER') {
      // Get Owners managed by this manager
      const owners = await this.prisma.user.findMany({
        where: { role: 'OWNER', managerId: userId },
        select: { id: true, name: true, role: true, email: true }
      });
      
      // Get Tenants in properties managed by this manager
      const leases = await this.prisma.lease.findMany({
        where: { status: 'ACTIVE', unit: { property: { owner: { managerId: userId } } } },
        include: { tenant: { include: { user: true } } }
      });
      const tenants = leases
        .filter(l => l.tenant && l.tenant.user)
        .map(l => ({
          id: l.tenant.user!.id,
          name: l.tenant.name,
          role: 'TENANT',
          email: l.tenant.email
        }));

      // Remove duplicates
      const uniqueTenantsMap = new Map();
      tenants.forEach(t => uniqueTenantsMap.set(t.id, t));
      const uniqueTenants = Array.from(uniqueTenantsMap.values());

      contacts = [...owners, ...uniqueTenants];
    } 
    else if (role === 'TENANT') {
      // Get the manager(s) of the properties this tenant is renting
      const leases = await this.prisma.lease.findMany({
        where: { status: 'ACTIVE', tenant: { userId } },
        include: { unit: { include: { property: { include: { owner: { include: { manager: true } } } } } } }
      });
      const managers = leases
        .filter(l => l.unit?.property?.owner?.manager)
        .map(l => ({
          id: l.unit!.property!.owner!.manager!.id,
          name: l.unit!.property!.owner!.manager!.name,
          role: 'MANAGER',
          email: l.unit!.property!.owner!.manager!.email
        }));
      
      const uniqueManagersMap = new Map();
      managers.forEach(m => uniqueManagersMap.set(m.id, m));
      contacts = Array.from(uniqueManagersMap.values());
    }

    // Attach last message for sorting
    const contactsWithLastMessage = await Promise.all(contacts.map(async (contact) => {
      const lastMessage = await this.prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: contact.id },
            { senderId: contact.id, receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'desc' },
      });
      return { ...contact, lastMessage };
    }));

    // Sort by last message date
    return contactsWithLastMessage.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });
  }

  @Get('conversation/:contactId') 
  async getConversation(@Param('contactId') contactId: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}
