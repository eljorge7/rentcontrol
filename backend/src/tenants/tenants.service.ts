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

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1e293b; margin: 0;">RentControl</h1>
            <p style="color: #64748b; margin-top: 5px;">Bienvenido a tu Portal de Inquilino</p>
          </div>
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #334155; font-size: 16px;">Hola <b>${newTenant.name}</b>,</p>
            <p style="color: #334155; line-height: 1.6;">Tu Administrador ha creado tu Portal personalizado. Desde aquí podrás revisar tus recibos, descargar tus facturas y realizar tus pagos en línea de forma segura.</p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <strong style="display: block; color: #0f172a; font-size: 14px;">Usuario (Email):</strong>
              <span style="font-size: 16px; color: #4f46e5; font-weight: bold;">${tenantData.email}</span>
              <br/><br/>
              <strong style="display: block; color: #0f172a; font-size: 14px;">Contraseña Temporal:</strong>
              <span style="font-size: 16px; color: #4f46e5; font-weight: bold;">${plainPassword}</span>
              <br/><br/>
              <a href="${loginUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ingresar al Portal</a>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: justify;">Te recomendamos encarecidamente cambiar esta contraseña temporal una vez que ingreses por primera vez al sistema por motivos de seguridad.</p>
          </div>
        </div>`;
      this.notifications.sendEmail(tenantData.email, 'Bienvenido a RentControl - Acceso a tu Portal', emailHtml);

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
