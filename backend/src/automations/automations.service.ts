import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processWebhook(triggerApp: string, triggerEvent: string, companyId: string, payload: any) {
    this.logger.log(`Received Webhook: [${triggerApp}] -> ${triggerEvent} for Company ${companyId}`);
    
    // Buscar reglas activas que coincidan
    const rules = await this.prisma.automationRule.findMany({
      where: {
        companyId,
        triggerApp,
        triggerEvent,
        isActive: true,
      }
    });

    if (rules.length === 0) {
      this.logger.log(`No active rules found for ${triggerEvent}`);
      return { status: 'ignored', message: 'No rules matched' };
    }

    this.logger.log(`Found ${rules.length} matching rules. Executing...`);

    const results = [];

    for (const rule of rules) {
      try {
        let compiledMessage = rule.actionTemplate;
        
        // Reemplazo simple de variables {{variable}} -> payload.variable
        for (const [key, value] of Object.entries(payload)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            compiledMessage = compiledMessage.replace(regex, String(value));
        }

        if (rule.actionApp === 'OMNICHAT' && rule.actionType === 'SEND_WHATSAPP') {
           const phone = payload.phone;
           if (!phone) {
             this.logger.error(`Cannot send WhatsApp, 'phone' missing in payload for rule ${rule.id}`);
             continue;
           }

           const omniUrl = process.env.OMNICHAT_API_URL || 'https://omnichat.radiotecpro.com/api';
           
           // Format phone
           let formattedPhone = String(phone).replace(/\D/g, '');
           if (formattedPhone.length === 10) formattedPhone = `521${formattedPhone}`;

           // Trigger OmniChat Message
           await axios.post(`${omniUrl}/api/v1/messages/send`, {
             phone: formattedPhone,
             message: compiledMessage,
             companyId: rule.companyId
           });

           this.logger.log(`Successfully triggered WhatsApp message via OmniChat for rule ${rule.name}`);
           results.push({ rule: rule.name, status: 'success' });
        }
        
      } catch (e) {
        this.logger.error(`Error executing rule ${rule.name}:`, e);
        results.push({ rule: rule.name, status: 'error', error: e.message });
      }
    }

    return { status: 'processed', results };
  }

  // CRUD for Automations Dashboard
  async getRules(companyId: string) {
    return this.prisma.automationRule.findMany({ where: { companyId } });
  }

  async createRule(data: any) {
    return this.prisma.automationRule.create({ data });
  }

  async updateRule(id: string, data: any) {
    return this.prisma.automationRule.update({ where: { id }, data });
  }

  async deleteRule(id: string) {
    return this.prisma.automationRule.delete({ where: { id } });
  }
}
