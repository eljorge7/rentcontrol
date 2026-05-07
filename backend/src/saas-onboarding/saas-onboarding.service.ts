import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';

@Injectable()
export class SaasOnboardingService {
  private readonly logger = new Logger(SaasOnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async getClients() {
    const clients = await this.prisma.user.findMany({
      where: { facturaproTenantId: { not: null } },
      include: {
        subscriptions: {
          include: { tier: { include: { app: true } } }
        }
      }
    });

    return clients.map(client => {
      return {
        id: client.id,
        name: client.name,
        slug: client.facturaproTenantId,
        email: client.email,
        phone: client.phone,
        status: client.isActive ? 'ACTIVO' : 'SUSPENDIDO',
        subscriptions: client.subscriptions.map(sub => ({
          appSlug: sub.tier.app.slug,
          appName: sub.tier.app.name,
          tierName: sub.tier.name,
          monthlyPrice: sub.tier.monthlyPrice
        })),
        monthlyFee: client.subscriptions.reduce((acc, sub) => acc + sub.tier.monthlyPrice, 0)
      };
    });
  }

  async provisionSaaSClient(payload: any) {
    this.logger.log(`Iniciando aprovisionamiento M2M para Tenant: ${payload.slug}`);

    try {
       // 1. Encontrar o crear al Cliente en la base de usuarios
       let user = await this.prisma.user.findUnique({
          where: { email: payload.contactEmail }
       });

       if (!user) {
          // Password genérico falso, ya que usarán Magic Link / SSO
          user = await this.prisma.user.create({
             data: {
                name: payload.businessName,
                email: payload.contactEmail,
                password: crypto.randomBytes(16).toString('hex'), 
                role: 'ADMIN',
                phone: payload.contactPhone,
                facturaproTenantId: payload.slug
             }
          });
          this.logger.log(`Usuario corporativo creado: ${user.email}`);
       } else {
          // Actualizar si ya existe para upsert
          user = await this.prisma.user.update({
             where: { id: user.id },
             data: {
                name: payload.businessName,
                phone: payload.contactPhone,
                facturaproTenantId: payload.slug
             }
          });
       }

       // 2. Generar el API KEY para FacturaPro / OmniChat
       const apiKeyStr = `rt_sk_${crypto.randomBytes(24).toString('hex')}`;
       
       const apikey = await this.prisma.apiKey.create({
          data: {
             key: apiKeyStr,
             name: `Master Key - ${payload.slug}`,
             userId: user.id,
             isActive: true
          }
       });

       // 3. Limpiar suscripciones anteriores y crear las nuevas
       await this.prisma.userSubscription.deleteMany({ where: { userId: user.id } });

       // Buscar las apps en la base de datos por nombre en lugar de slug para evitar discrepancias
       const facturaproApp = await this.prisma.softwareApp.findFirst({ where: { name: { contains: 'Factura' } }, include: { tiers: true } });
       const omnichatApp = await this.prisma.softwareApp.findFirst({ where: { name: { contains: 'Omni' } }, include: { tiers: true } });

       const newSubscriptions = [];
       this.logger.log(`Aprovisionando... facturapro: ${payload.features?.facturapro}, facturaproAppEncontrado: ${!!facturaproApp}`);

       if (payload.features?.facturapro && facturaproApp) {
          // Mapear el tier del payload al id real de la BD
          let tierName = payload.features.facturaproTier === 'trial_5' ? 'Base / ERP Only' : 
                         payload.features.facturaproTier === 'emprendedor_250' ? 'Emprendedor' : 
                         payload.features.facturaproTier === 'pyme_1000' ? 'PyME' : 'Corporativo';
          
          let tier = facturaproApp.tiers.find(t => t.name === tierName);
          if (!tier && facturaproApp.tiers.length > 0) tier = facturaproApp.tiers[0]; // fallback
          
          if (tier) {
             await this.prisma.userSubscription.create({
                data: {
                   userId: user.id,
                   tierId: tier.id,
                   nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
             });
          }
       }

       if (payload.features?.omnichat && omnichatApp) {
          let tier = omnichatApp.tiers.find(t => t.name === 'Agencia');
          if (!tier && omnichatApp.tiers.length > 0) tier = omnichatApp.tiers[0];
          
          if (tier) {
             await this.prisma.userSubscription.create({
                data: {
                   userId: user.id,
                   tierId: tier.id,
                   nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
             });
          }
       }

       this.logger.log(`Licencias M2M inyectadas al Tenant. Facturapro: ${payload.features?.facturaproTier}`);

       // 4. Disparo de Bienvenida (WhatsApp Magic Link)
       const magicBaseToken = Buffer.from(`${user.email}:${apikey.key}`).toString('base64');
       const magicLink = `https://radiotecpro.com/sso?token=${magicBaseToken}&tenant=${payload.slug}`;

       const waMessage = `* MAJIA OS - Corporativo *\n\nHola! Tu instancia SaaS para *${payload.businessName}* ha sido aprovisionada con éxito.\n\n*Servicios Activos:*\n${payload.features?.omnichat ? ' OmniChat CRM\n' : ''}${payload.features?.facturapro ? ' FacturaPro M2M ('+payload.features?.facturaproTier+')\n' : ''}${payload.features?.wisphq ? ' WispHQ Integrator\n' : ''}\nPara iniciar sesión de forma inmediata y acceder a tus herramientas, haz clic en tu Enlace Mágico:\n\n ${magicLink}\n\n*API KEY MAESTRA:* \`${apiKeyStr}\``;

       await this.notificationsService.sendWhatsAppMessage(payload.contactPhone, waMessage);

       const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: #fff; margin: 0;">MAJIA OS</h2>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <h3 style="color: #4f46e5;">¡Bienvenido, ${payload.businessName}!</h3>
              <p>Tu infraestructura SaaS ha sido aprovisionada exitosamente en la nube de MAJIA OS.</p>
              <p>Has recibido las licencias corporativas (M2M) y tu acceso seguro está listo.</p>
              
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e293b;">Tu Llave Maestra (API KEY):</p>
                <code style="background: #e2e8f0; padding: 5px 10px; border-radius: 4px; color: #ef4444;">${apiKeyStr}</code>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">Guárdala en un lugar seguro. Con ella conectarás tus sistemas a OmniChat y FacturaPro.</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${magicLink}" style="background-color: #4f46e5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Acceder a mi Panel de Control</a>
              </div>
              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">Este enlace es mágico y auto-firma tu sesión. No lo compartas con nadie.</p>
            </div>
          </div>
       `;

       try {
         await this.notificationsService.sendEmail(
           payload.contactEmail,
           `Bienvenido a MAJIA OS - Accesos de Corporativo`,
           emailHtml
         );
       } catch (err: any) {
         this.logger.error('No se pudo enviar el correo de bienvenida: ' + err.message);
       }

       return {
          success: true,
          message: 'Tenant aprovisionado. API Key y WhatsApp enviados.',
          tenantId: payload.slug,
          apiKey: apiKeyStr
       };

    } catch (error: any) {
       this.logger.error(`Error en aprovisionamiento: ${error.message}`);
       throw new Error('Fallo al desplegar el Tenant corporativo: ' + error.message);
    }
  }
}
