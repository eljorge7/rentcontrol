import { Injectable, Logger } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    // Aquí iría la lógica de integración con un PAC (Facturama, SW Sapien)
    // 1. Obtener datos del pago y del inquilino asociado
    const payment = await this.prisma.payment.findUnique({
        where: { id: createInvoiceDto.paymentId },
        include: { charge: { include: { lease: { include: { tenant: true } } } } }
    });

    if(!payment) throw new Error("Payment not found");

    this.logger.log(`Simulando timbrado CFDI 4.0 para pago ${createInvoiceDto.paymentId}`);
    
    // Simulamos respuesta del PAC
    const simulatedResponse = {
        uuidSAT: `SIM-${Math.random().toString(36).substring(2, 15)}`,
        xmlUrl: `https://mock-pac.com/xml/${createInvoiceDto.paymentId}`,
        pdfUrl: `https://mock-pac.com/pdf/${createInvoiceDto.paymentId}`,
        status: 'ISSUED'
    };

    return this.prisma.invoice.create({
      data: {
        paymentId: createInvoiceDto.paymentId,
        ...simulatedResponse
      },
    });
  }

  findAll() {
    return this.prisma.invoice.findMany({
        include: { payment: { include: { charge: { include: { lease: { include: { tenant: true } } } } } } }
    });
  }

  findOne(id: string) {
    return this.prisma.invoice.findUnique({
        where: { id },
        include: { payment: true }
    });
  }

  update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    return this.prisma.invoice.update({
      where: { id },
      data: updateInvoiceDto,
    });
  }

  remove(id: string) {
    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}
