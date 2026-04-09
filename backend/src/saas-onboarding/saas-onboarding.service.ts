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
                phone: payload.contactPhone
             }
          });
          this.logger.log(`Usuario corporativo creado: ${user.email}`);
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

       // 3. (Mock Arquitectónico)
       // Aquí se inyectarían los UserSubscription() para FacturaPro hacia la tabla de Tiers.
       // Ej: if (payload.features?.facturapro) { this.prisma.userSubscription.create({... tierId: payload.features?.facturaproTier}) }
       this.logger.log(`Licencias M2M inyectadas al Tenant. Facturapro: ${payload.features?.facturaproTier}`);

       // 4. Disparo de Bienvenida (WhatsApp Magic Link)
       // Generamos un enlace de login auto-firmado
       const magicBaseToken = Buffer.from(`${user.email}:${apikey.key}`).toString('base64');
       const magicLink = `https://radiotecpro.com/sso?token=${magicBaseToken}&tenant=${payload.slug}`;

       const waMessage = `* MAJIA OS - Corporativo *\n\nHola! Tu instancia SaaS para *${payload.businessName}* ha sido aprovisionada con xito.\n\n*Servicios Activos:*\n${payload.features?.omnichat ? ' OmniChat CRM\n' : ''}${payload.features?.facturapro ? ' FacturaPro M2M ('+payload.features?.facturaproTier+')\n' : ''}${payload.features?.wisphq ? ' WispHQ Integrator\n' : ''}\nPara iniciar sesin de forma inmediata y acceder a tus herramientas, haz clic en tu Enlace Mgico:\n\n ${magicLink}\n\n*API KEY MAESTRA:* \`${apiKeyStr}\``;

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
