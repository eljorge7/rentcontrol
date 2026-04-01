import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class IncidentsService {
  constructor(
     private prisma: PrismaService,
     private notificationsExt: NotificationsService
  ) {}

  async create(data: Prisma.IncidentUncheckedCreateInput) {
    return this.prisma.incident.create({ data });
  }

  async findAll(tenantUserId?: string, ownerId?: string, managerId?: string) {
    const whereClause: any = {};
    if (tenantUserId) whereClause.tenant = { userId: tenantUserId };
    if (ownerId) whereClause.unit = { property: { ownerId } };
    if (managerId) whereClause.unit = { property: { owner: { managerId } } };

    return this.prisma.incident.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        unit: { include: { property: { include: { owner: { include: { managementPlan: true } } } } } },
        tenant: true,
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user?: any) {
    const incident: any = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        unit: { include: { property: { include: { owner: true } } } } as any,
        tenant: true,
        supplier: true,
      }
    });

    if (!incident) throw new NotFoundException(`Incident with ID ${id} not found`);

    if (user) {
      if (user.role === 'OWNER' && incident.unit?.property?.ownerId !== user.userId) {
         throw new UnauthorizedException('No autorizado para ver este ticket.');
      }
      if (user.role === 'MANAGER' && incident.unit?.property?.owner?.managerId !== user.userId) {
         throw new UnauthorizedException('No autorizado para ver este ticket.');
      }
      if (user.role === 'TENANT' && incident.tenant?.userId !== user.userId) {
         throw new UnauthorizedException('No autorizado para ver este ticket.');
      }
    }

    return incident;
  }

  async update(id: string, data: Prisma.IncidentUpdateInput, user?: any) {
    await this.findOne(id, user); // Valida acceso
    return this.prisma.incident.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: string, user?: any, supplierId?: string) {
    await this.findOne(id, user); // Valida acceso
    return this.prisma.incident.update({
      where: { id },
      data: {
        status,
        ...(supplierId && { supplier: { connect: { id: supplierId } } })
      },
    });
  }

  async notifySupplier(id: string, user?: any) {
    const incident = await this.findOne(id, user);
    if (!incident.supplier || !incident.supplier.phone) {
       throw new Error('No hay proveedor con teléfono asignado a este ticket.');
    }

    const tenantName = incident.tenant?.name || 'Inquilino';
    const unitName = incident.unit?.name || 'la propiedad';
    const description = incident.description;
    
    // Asumiendo que radiotecpro.com o localhost apuntan a frontend
    // Aquí podrías usar una env var para host real, por ej process.env.FRONTEND_URL.
    // Usaremos un URL genérico (el técnico tiene panel /ticket/:id).
    const domain = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${domain}/ticket/${incident.id}`;

    const msg = `¡Hola ${incident.supplier.contactName || incident.supplier.name}! 🛠️
Tienes una nueva Orden de Trabajo asignada.\n
📍 *Ubicación:* ${unitName}
🗣️ *Inquilino:* ${tenantName}
📋 *Problema Reportado:* "${description}"\n
Por favor da clic en tu Panel Técnico Mágico para ver detalles completos, subir fotos o cotizar el costo de reparación:\n🔗 *${link}*`;

    const success = await this.notificationsExt.sendWhatsAppMessage(incident.supplier.phone, msg);
    if (!success) {
       throw new Error('Fallo al enviar WhatsApp al proveedor vía la pasarela.');
    }
    return { success: true, message: "Notificación despachada al Técnico." };
  }

  async proposeCost(id: string, supplierCost: number, rcMarkup: number, user?: any) {
    const incident = await this.findOne(id, user); // Validate access
    const finalCharge = supplierCost + (supplierCost * rcMarkup);
    
    // Auto-approve logic if under maintenance limit
    const propertyLimit = incident.unit?.property?.maintenanceLimit ?? 1500;
    const isAutoApproved = finalCharge <= propertyLimit;
    
    if (isAutoApproved) {
      // Create auto-expense directly to owner
      await this.prisma.expense.create({
        data: {
          propertyId: incident.unit.propertyId,
          amount: finalCharge,
          category: 'MAINTENANCE',
          description: `Reparación Técnica Auto-Aprobada: Ticket ${incident.description.substring(0, 20)}...`
        }
      });
    }
    
    return this.prisma.incident.update({
      where: { id },
      data: {
        supplierCost,
        rcMarkup,
        finalCharge,
        status: isAutoApproved ? 'IN_PROGRESS' : 'AWAITING_APPROVAL',
        billedTo: isAutoApproved ? 'OWNER' : null
      }
    });
  }

  async approveCost(id: string, billedTo: string, user?: any) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        unit: { include: { property: true } },
        tenant: { include: { leases: { where: { status: 'ACTIVE' } } } }
      }
    });

    if (!incident) throw new NotFoundException('Incident not found');
    if (incident.status !== 'AWAITING_APPROVAL') throw new Error('Incident is not awaiting cost approval');

    if (user && user.role === 'OWNER' && incident.unit?.property?.ownerId !== user.userId) {
      throw new UnauthorizedException('Not authorized to approve this incident.');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Create corresponding financial record
      if (billedTo === 'OWNER') {
        await prisma.expense.create({
          data: {
            propertyId: incident.unit.propertyId,
            amount: incident.finalCharge || 0,
            category: 'MAINTENANCE',
            description: `Reparación Técnica: Ticket ${incident.description.substring(0, 20)}...`
          }
        });
      } else if (billedTo === 'TENANT') {
        // Charge the tenant
        const activeLease = incident.tenant?.leases?.[0];
        if (activeLease) {
          await prisma.charge.create({
            data: {
              leaseId: activeLease.id,
              amount: incident.finalCharge || 0,
              type: 'MAINTENANCE',
              dueDate: new Date(),
              description: `Cargo Extra por Reparación: ${incident.description.substring(0, 20)}...`
            }
          });
        }
      }

      // Mark as approved (In Progress) and record liability
      return prisma.incident.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          billedTo
        }
      });
    });
  }

  async resolvePublic(id: string, data: { cost?: number, supplierNotes?: string, evidenceUrl?: string }) {
    await this.findOne(id); // Valida que exista (sin user = no checa permisos)
    return this.prisma.incident.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        cost: data.cost ? parseFloat(data.cost.toString()) : undefined,
        supplierNotes: data.supplierNotes,
        evidenceUrl: data.evidenceUrl
      }
    });
  }

  async remove(id: string, user?: any) {
    await this.findOne(id, user); // Valida acceso
    return this.prisma.incident.delete({
      where: { id },
    });
  }
}
