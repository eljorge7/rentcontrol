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
    this.logger.log('Inicializando WhatsApp Web Client...');
    try {
      this.whatsappClient = new Client({
        authStrategy: new LocalAuth({ dataPath: './whatsapp-session' }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          timeout: 60000
        }
      });

      this.whatsappClient.on('qr', (qr) => {
        this.logger.log('WhatsApp QR Code generado. Esperando escaneo desde la App de RentControl...');
        this.qrCodeString = qr; 
        this.isWhatsappReady = false;
      });

      this.whatsappClient.on('ready', () => {
        this.logger.log('WhatsApp Client is Ready! Servidor Conectado Exitosamente.');
        this.isWhatsappReady = true;
        this.qrCodeString = null;
      });

      this.whatsappClient.on('authenticated', () => {
        this.logger.log('WhatsApp Web Autenticado con éxito.');
      });

      this.whatsappClient.on('auth_failure', msg => {
        this.logger.error('WhatsApp Authentication failure', msg);
        this.isWhatsappReady = false;
      });

      this.whatsappClient.on('disconnected', (reason) => {
        this.logger.warn('WhatsApp Client was disconnected', reason);
        this.isWhatsappReady = false;
      });

      this.whatsappClient.initialize().catch(err => {
        this.logger.error('Fallo iniciando whatsapp-web.js', err);
      });
    } catch(e) {
      this.logger.error('Error catastrófico iniciando WhatsApp', e);
    }
  }

  async getWhatsAppStatus() {
    return {
      isReady: this.isWhatsappReady,
      qrCode: this.qrCodeString
    };
  }

  async sendWhatsAppMessage(phone: string, message: string) {
    if (!this.isWhatsappReady) {
      this.logger.warn('Intento de envío de WhatsApp abortado: El dispositivo celular no está vinculado al servidor.');
      return false;
    }
    if (!phone) return false;
    try {
      let formattedNumber = phone.replace(/\D/g, ''); 
      if (formattedNumber.length === 10) {
        formattedNumber = `521${formattedNumber}`; // Mexican standard
      }
      const chatId = `${formattedNumber}@c.us`;
      
      await this.whatsappClient.sendMessage(chatId, message);
      this.logger.log(`[RentControl Bot] WhatsApp disparado exitosamente a ${formattedNumber}`);
      return true;
    } catch (e: any) {
      this.logger.error(`Error de red disparando WhatsApp a ${phone}: ${e.message}`);
      return false;
    }
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    if (!to) return false;
    try {
      const userSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'SMTP_USER' } });
      const passSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'SMTP_PASS' } });
      const hostSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'SMTP_HOST' } });
      const portSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'SMTP_PORT' } });

      if (!userSetting || !passSetting) {
        this.logger.warn('Transmisión de Email abortada: Parámetros SMTP no configurados en el Dashboard.');
        return false;
      }

      const transporter = nodemailer.createTransport({
        host: hostSetting?.value || 'smtp.gmail.com',
        port: parseInt(portSetting?.value || '587'),
        secure: parseInt(portSetting?.value || '587') === 465,
        auth: {
          user: userSetting.value,
          pass: passSetting.value,
        },
      });

      const info = await transporter.sendMail({
        from: `"RentControl Cloud" <${userSetting.value}>`,
        to,
        subject,
        html: htmlContent,
      });

      this.logger.log(`[RentControl NodeMailer] Email despachado a la bandeja de ${to}: ${info.messageId}`);
      return true;
    } catch (e: any) {
      this.logger.error(`Error de red disparando email a ${to}: ${e.message}`);
      return false;
    }
  }
}
