import { Injectable } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    // Generar contraseña genérica por defecto si no es provista
    const plainPassword = createTenantDto.password || 'RentControl2026';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const { password, ...tenantData } = createTenantDto;

    return this.prisma.$transaction(async (tx) => {
      // Crear la cuenta de Usuario subyacente primero
      const user = await tx.user.create({
        data: {
          email: tenantData.email,
          name: tenantData.name,
          password: hashedPassword,
          role: 'TENANT',
        }
      });

      // Crear el Inquilino (Tenant) vinculado al User generado
      const newTenant = await tx.tenant.create({
        data: {
          ...tenantData,
          userId: user.id, // Enlazar el perfil al log de acceso
        },
      });

      // Dispatch Onboarding WhatsApp Message
      const loginUrl = process.env.FRONTEND_URL || 'https://rentcontrol.radiotecpro.com';
      const wpMessage = `👋 *¡Bienvenido a RentControl, ${newTenant.name}!* 🎉\n\nTu Administrador ha creado tu Portal Inmobiliario personalizado.\n\nDesde aquí podrás revisar tus recibos, descargar tus facturas y realizar tus pagos en línea de forma segura.\n\n🔗 *Accede aquí:* ${loginUrl}\n👤 *Usuario:* ${tenantData.email}\n🔑 *Contraseña Temporal:* ${plainPassword}\n\n⚠️ _Te recomendamos cambiar tu contraseña al ingresar por primera vez._\n\nAtentamente,\n*Equipo de Administración*`;
      
      if (newTenant.phone) {
        this.notifications.sendWhatsAppMessage(newTenant.phone, wpMessage);
      }

      return newTenant;
    });
  }

  findAll() {
    return this.prisma.tenant.findMany({
      include: {
        leases: {
          include: { unit: { include: { property: true } } }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        leases: {
          include: { unit: { include: { property: true } } }
        }
      },
    });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const { password, ...tenantData } = updateTenantDto as any;

    if (password) {
      const tenant = await this.prisma.tenant.findUnique({ where: { id } });
      if (tenant?.userId) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.prisma.user.update({
          where: { id: tenant.userId },
          data: { password: hashedPassword },
        });
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: tenantData,
    });
  }

  async remove(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return null;

    const deletedTenant = await this.prisma.tenant.delete({
      where: { id },
    });

    if (tenant.userId) {
      await this.prisma.user.delete({
        where: { id: tenant.userId }
      }).catch(() => null); // Ignorar si ya fue eliminado
    }

    return deletedTenant;
  }
}
