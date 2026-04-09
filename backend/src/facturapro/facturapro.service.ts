import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacturaProService {
  private readonly logger = new Logger(FacturaProService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene la configuración de FacturaPro desde la base de datos (SystemSetting)
   */
  private async getConfig() {
    let apiUrl = await this.prisma.systemSetting.findUnique({
      where: { key: 'FACTURAPRO_API_URL' }
    });

    // Default if not set in DB
    const baseUrl = apiUrl?.value || process.env.FACTURAPRO_API_URL || 'http://127.0.0.1:3005';
    
    // Aquí podríamos tener un Token:
    const token = await this.prisma.systemSetting.findUnique({
       where: { key: 'FACTURAPRO_API_KEY' }
    });

    return { baseUrl, token: token?.value };
  }

  /**
   * M2M Sync: Crear o buscar un Cliente en FacturaPro
   */
  async syncTenantToCustomer(tenantId: string, issuerFpTenantId: string | null = null) {
    try {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) throw new Error('Tenant not found');

      const config = await this.getConfig();
      const headersFull = {
         'Content-Type': 'application/json',
         ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {}),
         ...(issuerFpTenantId ? { 'x-tenant-id': issuerFpTenantId } : {})
      };

      // Buscar si ya existe por email
      const cRes = await fetch(`${config.baseUrl}/customers`, { headers: headersFull });
      if (cRes.ok) {
         const customers: any[] = await cRes.json();
         console.log("FacturaPro returned first customer:", customers[0]);
         console.log("Comparing with RentControl tenant rfc/name:", tenant.rfc, tenant.name, tenant.email);
         const existing = customers.find((c: any) => 
               c.email === tenant.email || 
               (c.rfc && tenant.rfc && c.rfc.toUpperCase() === tenant.rfc.toUpperCase()) ||
               (c.legalName && tenant.name && c.legalName.toUpperCase() === tenant.name.toUpperCase())
         );
         if (existing) return existing;
      }

      // Si no existe, preparamos datos
      const rfc = tenant.rfc || 'XAXX010101000';
      const legalName = tenant.name;
      const taxRegime = tenant.taxRegimen || '616';
      const zipCode = tenant.zipCode || '00000';

      let fpTenantId = issuerFpTenantId;
      if (!fpTenantId) {
          const tRes = await fetch(`${config.baseUrl}/tenants`, { headers: headersFull });
          console.log("Tenants res status:", tRes.status);
          if (!tRes.ok) {
             console.log("M2M Failed: FacturaPro Backend Inaccesible al buscar empresas. Status:", tRes.status, await tRes.text());
             this.logger.warn("M2M Failed: FacturaPro Backend Inaccesible al buscar empresas");
             return null;
          }
          const facturaproTenants = await tRes.json();
          fpTenantId = facturaproTenants[0]?.id; // Default al primero si no sabemos
          if (!fpTenantId) {
             const newTRes = await fetch(`${config.baseUrl}/tenants`, {
                method: 'POST',
                headers: headersFull,
                body: JSON.stringify({ name: "Empresa Sincronizada Automáticamente" })
             });
             const tData = await newTRes.json();
             fpTenantId = tData.id;
          }
      }

      const payload = {
         tenantId: fpTenantId,
         legalName,
         rfc,
         taxRegime,
         zipCode,
         email: tenant.email
      };

      const res = await fetch(`${config.baseUrl}/customers`, {
         method: 'POST',
         headers: headersFull,
         body: JSON.stringify(payload)
      });

      if (!res.ok) {
         console.log("Failed to create customer:", res.status, await res.text());
         return null;
      }
      return await res.json();
      
    } catch (e) {
       console.log("Exception in syncTenantToCustomer:", e);
       this.logger.error('Failed to sync tenant to FacturaPro', e.stack);
       return null;
    }
  }

  /**
   * Emitir CFDI M2M 
   */
  async issueInvoice(paymentId: string) {
     const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: { charge: { include: { lease: { include: { tenant: true, unit: { include: { property: { include: { owner: true } } } } } } } } }
     });
     if (!payment) throw new Error("Pago no encontrado");

     const tenant = payment.charge.lease.tenant;
     const propertyOwner = payment.charge.lease.unit.property.owner;
     let issuerTenantId = propertyOwner?.facturaproTenantId;
     
     // Fallback: Si el dueño de la propiedad no tiene cuenta de SaaS, usamos la del SuperAdmin (RentControl Root)
     if (!issuerTenantId) {
         const superAdmin = await this.prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
         issuerTenantId = superAdmin?.facturaproTenantId || null;
     }

     // 1. Asegurar receptor
     const customer = await this.syncTenantToCustomer(tenant.id, issuerTenantId);
     if (!customer) throw new Error("FacturaPro Customer Sync Failed");

     // 2. Armar Invoice Payload
     // En FacturaPro definimos que unitPrice * quantity debe ser el subtotal.
     // Si payment.amount es 1000 y el IVA es 0.16, calculamos hacia atrás o simplemente mandamos taxRate 0 y amount=total.
     // Para ser exactos, si el tenant requireInvoice, calcularemos IVA. Asumimos payment.amount ya es TOTAL.
     const total = payment.amount;
     const taxRate = 0.16;
     const subtotal = total / (1 + taxRate);

     const mapPaymentMethod = (m: string) => {
        if (m === 'CASH') return '01'; // Efectivo
        if (m === 'STRIPE' || 'MERCADOPAGO') return '04'; // Tarjeta
        return '03'; // Transferencia
     };

     const payload = {
        customerId: customer.id,
        paymentMethod: 'PUE',
        paymentForm: mapPaymentMethod(payment.method),
        cfdiUse: 'G03',
        items: [
           {
              description: `Pago de ${payment.charge.type} - Recibo #${payment.id.slice(-6).toUpperCase()}`,
              quantity: 1,
              unitPrice: subtotal,
              taxRate: taxRate,
              discount: 0
           }
        ]
     };

     const config = await this.getConfig();
     const m2mHeaders = { 
         'Content-Type': 'application/json',
         ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {}),
         ...(issuerTenantId ? { 'x-tenant-id': issuerTenantId } : {})
     };

     const res = await fetch(`${config.baseUrl}/invoices`, {
         method: 'POST',
         headers: m2mHeaders,
         body: JSON.stringify(payload)
     });

     if (!res.ok) throw new Error('Falló la factura M2M: ' + await res.text());
     
     const invoiceFp = await res.json();
     
     // 2.5 HACK: Registrar el pago automáticamente en FacturaPro
     try {
         await fetch(`${config.baseUrl}/invoices/${invoiceFp.id}/payments`, {
            method: 'POST',
            headers: m2mHeaders,
            body: JSON.stringify({
               amount: total,
               paymentDate: new Date().toISOString().split('T')[0],
               paymentMethod: payload.paymentForm,
               notes: `Pago M2M capturado desde RentControl (Recibo ${payment.id.slice(-6).toUpperCase()})`
            })
         });
     } catch (err) {
         this.logger.error("Error confirmando pago a FacturaPro", err);
     }

     // 2.6 M2M: Timbrado Automático (Mandar a certificar al SAT desde FacturaPro)
     let finalSatUuid = invoiceFp.satUuid;
     try {
         const stampRes = await fetch(`${config.baseUrl}/invoices/${invoiceFp.id}/stamp`, {
            method: 'PATCH',
            headers: m2mHeaders
         });
         if (stampRes.ok) {
            const stamped = await stampRes.json();
            finalSatUuid = stamped.satUuid;
         }
     } catch (err) {
         this.logger.error("Error en timbrado M2M FacturaPro", err);
     }

     // 2.7 M2M: Enviar Comprobante PDF/XML vía WhatsApp Maestro desde FacturaPro
     if (tenant.phone) {
        try {
            await fetch(`${config.baseUrl}/invoices/${invoiceFp.id}/send-whatsapp`, {
                method: 'POST',
                headers: m2mHeaders,
                body: JSON.stringify({ phone: tenant.phone })
            });
        } catch (err) {
            this.logger.error("Error en disparador de WhatsApp M2M", err);
        }
     }
     
     // 3. Guardar en BD local de RentControl para mostrar al inquilino
     const localInvoice = await this.prisma.invoice.create({
        data: {
           paymentId: payment.id,
           uuidSAT: finalSatUuid,
           xmlUrl: invoiceFp.id, // Hack: guardamos el ID interno de FPro aquí para cancelaciones
           status: 'ISSUED'
        }
     });

     return localInvoice;
  }

  async cancelInvoice(paymentId: string) {
     const inv = await this.prisma.invoice.findUnique({ where: { paymentId } });
     if (!inv || !inv.xmlUrl) throw new Error('Referencia M2M Invalida');
     
     const config = await this.getConfig();
     const res = await fetch(`${config.baseUrl}/invoices/${inv.xmlUrl}/cancel`, {
         method: 'PATCH',
         headers: {
            ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {})
         }
     });

     if (!res.ok) throw new Error('Falló cancelación M2M');

     await this.prisma.invoice.update({
        where: { id: inv.id },
        data: { status: 'CANCELLED' }
     });

     return true;
  }

}
