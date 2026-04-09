import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AppsService {
  constructor(private prisma: PrismaService, private notifications: NotificationsService) {}

  async getAllApps() {
    return this.prisma.softwareApp.findMany({
      where: { isActive: true },
      include: {
        tiers: {
          where: { isActive: true },
          orderBy: { monthlyPrice: 'asc' }
        }
      }
    });
  }

  async subscribe(userId: string, tierId: string, billingCycle: string) {
    const tier = await this.prisma.appTier.findUnique({
      where: { id: tierId },
      include: { app: true }
    });

    if (!tier) {
      throw new NotFoundException('Tier no encontrado');
    }

    // Periodo de Gracia: 14 Días
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 14);

    // Damos 5 timbres "regalo"
    const initialStamps = 5;

    // Cambiado a ACTIVE para activar Prueba Gratuita
    const sub = await this.prisma.userSubscription.create({
      data: {
        userId,
        tierId,
        billingCycle,
        status: 'ACTIVE',
        availableStamps: initialStamps,
        nextBillingDate
      }
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
        const total = billingCycle === 'ANNUAL' ? tier.annualPrice * 0.8 : tier.monthlyPrice * 0.8;
        const msg = `¡Hola ${user.name}! 🚀\n\nTe hemos regalado *14 Días de Prueba y 5 Timbres* para que pruebes ${tier.app.name} sin compromiso.\nTu portal M2M acaba de ser aprovisionado y ya puedes facturar.\n\nPara desbloquear el plan permanente de *$${total} MXN*: 👉 https://pagos.radiotecpro.com/checkout/${sub.id}`;
        
        if (user.phone) {
           this.notifications.sendWhatsAppMessage(user.phone, msg).catch(e => console.error('Error WA:', e));
        }
    }

    // Force M2M Webhook Provisioning
    return this.updateSubscription(sub.id, { status: 'ACTIVE' });
  }

  async getMySubscriptions(userId: string) {
    return this.prisma.userSubscription.findMany({
      where: { userId },
      include: {
        tier: {
          include: { app: true }
        }
      }
    });
  }

  // Admin solo
  async getAllSubscriptions() {
    return this.prisma.userSubscription.findMany({
      include: {
        user: true,
        tier: { include: { app: true }}
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateSubscription(id: string, updates: any) {
    const sub = await this.prisma.userSubscription.update({
      where: { id },
      data: updates,
      include: {
         user: true,
         tier: { include: { app: true } }
      }
    });

    // Disparar Webhook M2M a FacturaPro si la suscripción es de esa App
    if (sub.tier.app.name === 'FacturaPro') {
       try {
         // Import dinamico o global fetch
         await fetch('http://localhost:3005/internal/sync-tenant', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'x-api-key': 'FACTURAPRO_MASTER_KEY_2026'
           },
           body: JSON.stringify({
             tenantId: sub.userId, // El userId aquí funge como tenantId central
             subscriptionTier: sub.tier.name.toUpperCase(),
             stamps: sub.availableStamps,
             hasExpenseControl: Boolean(sub.tier.featuresJson?.toString().includes('Buzón Fiscal')),
             hasApiAccess: Boolean(sub.tier.featuresJson?.toString().includes('API'))
           })
         });
       } catch(e) {
         console.error('Error sincronizando con FacturaPro:', e);
         // Podríamos alertar en slack o admin si falla
       }
    }

    return sub;
  }
}
