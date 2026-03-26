import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfsService {
  constructor(private prisma: PrismaService) {}

  async generateAccountStatement(leaseId: string, outputStream: NodeJS.WritableStream) {
    const lease = await this.prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        tenant: true,
        unit: { include: { property: { include: { owner: true } } } },
        charges: { include: { payments: true }, orderBy: { dueDate: 'desc' } }
      }
    });

    if (!lease) throw new NotFoundException('Lease not found');

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(outputStream);

    // Header
    doc.fontSize(20).text('Estado de Cuenta', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Propiedad: ${lease.unit?.property?.name || 'N/A'} - ${lease.unit?.name || 'N/A'}`);
    doc.text(`Inquilino: ${lease.tenant?.name || 'N/A'}`);
    doc.text(`Fecha de Emision: ${new Date().toLocaleDateString()}`);
    doc.moveDown(2);

    // Balance
    let totalDebt = 0;
    lease.charges.forEach((charge: any) => {
      const paid = charge.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (charge.status !== 'CANCELLED') {
        totalDebt += (charge.amount - paid);
      }
    });

    doc.fontSize(14).text(`Saldo Pendiente: $${totalDebt.toFixed(2)} MXN`, { align: 'right' });
    doc.moveDown(2);

    // Table Header
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Concepto', 50, doc.y, { continued: true, width: 250 });
    doc.text('Fecha', 300, doc.y, { continued: true, width: 100 });
    doc.text('Adeudo', 400, doc.y, { continued: true, width: 100 });
    doc.text('Estatus', 500, doc.y);
    doc.moveDown(0.5);
    
    // Draw a line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Items
    doc.font('Helvetica');
    lease.charges.forEach((charge: any) => {
      if (charge.status === 'CANCELLED') return;
      const paid = charge.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const remaining = charge.amount - paid;
      const statusTxt = charge.status === 'PAID' ? 'Pagado' : remaining < charge.amount ? 'Parcial' : 'Pendiente';

      const prevY = doc.y;
      doc.text(charge.description || charge.type, 50, prevY, { width: 230 });
      doc.text(new Date(charge.dueDate).toLocaleDateString(), 300, prevY, { width: 90 });
      doc.text(`$${remaining.toFixed(2)}`, 400, prevY, { width: 90 });
      doc.text(statusTxt, 500, prevY);
      doc.moveDown(0.5);
    });

    doc.end();
  }

  async generateLeaseContract(leaseId: string, outputStream: NodeJS.WritableStream) {
    const lease = await this.prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        tenant: true,
        unit: { include: { property: { include: { owner: true } } } },
      }
    });

    if (!lease) throw new NotFoundException('Lease not found');

    const doc = new PDFDocument({ margin: 60, size: 'LETTER' });
    doc.pipe(outputStream);

    doc.fontSize(16).font('Helvetica-Bold').text('CONTRATO DE ARRENDAMIENTO', { align: 'center' });
    doc.moveDown(1.5);

    const ownerName = lease.unit?.property?.owner?.name || 'EL PROPIETARIO';
    const tenantName = lease.tenant?.name || 'EL ARRENDATARIO';
    const address = lease.unit?.property?.address || 'LA DIRECCIÓN DE LA PROPIEDAD';
    const unitName = lease.unit?.name || 'LA UNIDAD';
    const tenantEmail = lease.tenant?.email || 'N/A';
    const endStr = lease.endDate ? new Date(lease.endDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'tiempo indefinido';
    const startStr = new Date(lease.startDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const lateFeeAmount = lease.lateFeeAmount || 0;
    const gracePeriodDays = lease.gracePeriodDays || 3;
    const maintenanceLimit = lease.unit?.property?.maintenanceLimit || 1500;

    doc.fontSize(10).font('Helvetica-Bold').text('DECLARACIONES', { align: 'center' });
    doc.moveDown(0.5);

    doc.font('Helvetica')
       .text(`Contrato de arrendamiento que celebran por una parte ${ownerName.toUpperCase()}, a quien en lo sucesivo se le denominará "EL ARRENDADOR"; y por la otra parte ${tenantName.toUpperCase()}, a quien en lo sucesivo se le denominará "EL ARRENDATARIO", quienes se sujetan al tenor de las siguientes Declaraciones y Cláusulas.`, { align: 'justify' });
    
    doc.moveDown(1);
    doc.font('Helvetica-Bold').text('I. DEL ARRENDADOR:');
    doc.font('Helvetica').moveDown(0.3);
    doc.text(`1. Que es legal propietario y tiene las facultades para dar en arrendamiento el inmueble ubicado en: ${address}, el cual cuenta con el local/departamento identificado como ${unitName}, materia de este contrato.`, { align: 'justify' });
    doc.moveDown(0.3);
    doc.text(`2. Que el Inmueble se encuentra en condiciones óptimas para la renta.`, { align: 'justify' });
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold').text('II. DEL ARRENDATARIO:');
    doc.font('Helvetica').moveDown(0.3);
    doc.text(`1. Poseer plena capacidad legal y económica.`);
    doc.moveDown(0.3);
    doc.text(`2. Señala como vía de notificación legal oficial el correo: ${tenantEmail}.`);
    doc.moveDown(1.5);

    doc.font('Helvetica-Bold').text('CLÁUSULAS', { align: 'center' });
    doc.moveDown(1);
    
    doc.font('Helvetica-Bold').text('PRIMERA. (OBJETO): ', { continued: true }).font('Helvetica').text('EL ARRENDADOR otorga en arrendamiento y EL ARRENDATARIO recibe conforme a derecho el uso temporal del inmueble descrito en las Declaraciones.', { align: 'justify' });
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold').text('SEGUNDA. (RENTA Y FORMA DE PAGO): ', { continued: true }).font('Helvetica').text(`EL ARRENDATARIO pagará por concepto de renta mensual la cantidad de $${lease.rentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN. La renta deberá cubrirse los días ${lease.paymentDay} de cada mes natural.`, { align: 'justify' });
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold').text('TERCERA. (PENALIZACIONES Y MOROSIDAD): ', { continued: true }).font('Helvetica').text(`Las partes aprueban explícitamente y sin necesidad de resolución judicial que, de no efectuarse el pago de la renta en tiempo y forma, existirá un periodo de gracia de ${gracePeriodDays} días. A partir de superado este límite, un sistema informático autónomo de administración causará sin excepción un recargo solidario mensual de $${lateFeeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN.`, { align: 'justify' });
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold').text('CUARTA. (VIGENCIA): ', { continued: true }).font('Helvetica').text(`La duración será a partir del ${startStr} y terminará el ${endStr}. En caso de no existir fecha, será por tiempo indefinido sujeto a aviso previo.`, { align: 'justify' });
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold').text('QUINTA. (MANTENIMIENTO Y AGENCIA ADMINISTRADORA): ', { continued: true }).font('Helvetica').text(`El ARRENDADOR delega la administración operativa a la Agencia Inmobiliaria y de Servicios Tecnológicos contratada (Gestor). Toda reparación en favor de preservar la sanidad del inmueble igual o inferior al tope financiero de $${maintenanceLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN será pre-autorizada matemáticamente para su ejecución inmediata por el Gestor sin necesidad de notificar al ARRENDADOR, salvaguardando la experiencia de vivienda del ARRENDATARIO.`, { align: 'justify' });
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold').text('SEXTA. (INCUMPLIMIENTO): ', { continued: true }).font('Helvetica').text('La falta de pago o violación de estas cláusulas dará derecho a rescindir el contrato y exigir la desocupación inmediata.', { align: 'justify' });
    doc.moveDown(3);

    doc.text('Leído y enteradas las partes de su alcance y fuerza legal, manifiestan su conformidad de manera presencial o electrónica.', { align: 'center' });
    doc.moveDown(1);
    const signatureY = doc.y;

    if (lease.managerSignatureUrl) {
      try {
        const p = require('path').join(process.cwd(), lease.managerSignatureUrl);
        if (require('fs').existsSync(p)) {
          doc.image(p, 80, signatureY, { width: 120, fit: [120, 60] });
        }
      } catch (e) {
        console.error("Error loading manager signature", e);
      }
    }

    if (lease.tenantSignatureUrl) {
      try {
        const p = require('path').join(process.cwd(), lease.tenantSignatureUrl);
        if (require('fs').existsSync(p)) {
          doc.image(p, 310, signatureY, { width: 120, fit: [120, 60] });
        }
      } catch (e) {
        console.error("Error loading tenant signature", e);
      }
    }

    doc.moveDown(4);

    doc.text('_____________________________', 60, doc.y, { continued: true });
    doc.text('_____________________________', 290, doc.y);
    doc.moveDown(0.5);
    const endY = doc.y;
    doc.font('Helvetica-Bold').text('EL ARRENDADOR', 80, endY, { width: 150, align: 'center' });
    doc.text('EL ARRENDATARIO', 310, endY, { width: 150, align: 'center' });

    doc.end();
  }
}
