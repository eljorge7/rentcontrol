import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private whatsappClient: Client;
  public qrCodeString: string | null = null;
  public isWhatsappReady: boolean = false;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.initWhatsApp();
  }

  private initWhatsApp() {
    this.logger.log('Desactivando Motor WA Local: Delegando tareas de mensajería al Gateway central de OmniChat...');
    this.isWhatsappReady = true; // Forzamos a true para que el sistema pase las validaciones de envío
  }

  async getWhatsAppStatus() {
    return {
      isReady: true,
      qrCode: null,
      message: "Delegado a OmniChat Gateway"
    };
  }

  async sendWhatsAppMessage(phone: string, message: string) {
    if (!phone) return false;
    try {
      let formattedNumber = phone.replace(/\D/g, ''); 
      if (formattedNumber.length === 10) {
        formattedNumber = `521${formattedNumber}`; // Estándar México
      }
      
      const payload = {
        phone: formattedNumber,
        text: message
      };
      
      const baseUrl = process.env.OMNICHAT_API_URL || 'http://127.0.0.1:3002';
      const response = await fetch(`${baseUrl}/api/v1/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk_24af03088b47aac20bae7b1df07f8399',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
         const data = await response.json();
         this.logger.error(`[OmniChat API Error]: ${JSON.stringify(data)}`);
         return false;
      }

      this.logger.log(`[RentControl -> OmniChat] WhatsApp B2B delegado exitosamente a ${formattedNumber}`);
      return true;
    } catch (e: any) {
      this.logger.error(`Error delegando WhatsApp a OmniChat para ${phone}: ${e.message}`);
      return false;
    }
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    if (!to) return false;
    try {
      const passSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'SMTP_PASS' } });
      const apiToken = passSetting?.value || 're_DzSzoqao_JVS9TdHYHGtLVbJbRpizsDm9'; // Custom HTTP key reading

      // Usamos HTTPS puro (puerto 443) para esquivar permanentemente el bloqueo TCP 465/587 del VPS
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Ecosistema Agency OS <notificaciones@radiotecpro.com>', 
          reply_to: 'jorge.hurtado@radiotecpro.com',
          to: [to],
          subject: subject,
          html: htmlContent,
        })
      });

      const data = await response.json();
      if (!response.ok) {
         this.logger.error(`[Resend API Error]: ${JSON.stringify(data)}`);
         return false;
      }

      this.logger.log(`[RentControl Resend HTTP] Email exitosamente inyectado a la bandeja de ${to} (ID: ${data.id})`);
      return true;
    } catch (e: any) {
      this.logger.error(`Error HTTP Crítico disparando email a ${to}: ${e.message}`);
      return false;
    }
  }
}
