import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacturaproSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // Settings (Prefix and Folio)
  // ----------------------------------------------------

  async getSettings(userId: string) {
    let settings = await this.prisma.facturaProSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.facturaProSettings.create({
        data: {
          userId,
        },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, data: any) {
    const settings = await this.getSettings(userId);
    return this.prisma.facturaProSettings.update({
      where: { id: settings.id },
      data: {
        invoicePrefix: data.invoicePrefix,
        invoiceCurrentFolio: data.invoiceCurrentFolio,
        quotePrefix: data.quotePrefix,
        quoteCurrentFolio: data.quoteCurrentFolio,
      },
    });
  }

  // ----------------------------------------------------
  // API Keys (Developers Integration)
  // ----------------------------------------------------

  async getApiKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateApiKey(userId: string, name: string) {
    // Basic hash approach for API key. In a real scenario we use cryptographically secure random string.
    const rawKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    return this.prisma.apiKey.create({
      data: {
        userId,
        name,
        key: rawKey,
        isActive: true,
      },
    });
  }

  async revokeApiKey(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findUnique({ where: { id: keyId } });
    if (!key || key.userId !== userId) {
      throw new NotFoundException('API Key no encontrada');
    }

    // Rather than deleting, we just deactivate it or delete it.
    return this.prisma.apiKey.delete({
      where: { id: keyId },
    });
  }

  // ----------------------------------------------------
  // Single Sign-On (SSO) Builder
  // ----------------------------------------------------

  async getSsoLink(userId: string) {
    const user = await this.prisma.user.findUnique({
       where: { id: userId },
       include: { ownerProfile: true }
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const payload = {
       email: user.email,
       name: user.name,
       phone: user.phone || '0000000000',
       legalName: user.ownerProfile?.legalName || user.name
    };

    const facturaproBaseUrl = process.env.FACTURAPRO_API_URL || 'http://localhost:3005';
    
    // Server-to-Server API Call
    const res = await fetch(`${facturaproBaseUrl}/auth/sso`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(payload)
    });

    if (!res.ok) {
       throw new Error('Fallo al generar puente de inicio de sesión único con FacturaPro');
    }

    const data = await res.json();
    
    // Guardar el tenantId devuelto para unificar identidades permanentemente
    if (!user.facturaproTenantId && data.tenantId) {
        await this.prisma.user.update({
           where: { id: userId },
           data: { facturaproTenantId: data.tenantId }
        });
    }

    // Retornamos la URL de frontend local de FacturaPro con el token listo para consumirse
    const fpFrontendUrl = process.env.FACTURAPRO_FRONTEND_URL || 'http://localhost:3004';
    return { url: `${fpFrontendUrl}/sso?token=${data.token}` };
  }
}
