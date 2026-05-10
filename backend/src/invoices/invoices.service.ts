import { Injectable, Logger } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FacturaProService } from '../facturapro/facturapro.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private prisma: PrismaService,
    private facturaProService: FacturaProService
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    this.logger.log(`Ejecutando timbrado CFDI M2M para pago ${createInvoiceDto.paymentId}`);
    return this.facturaProService.issueInvoice(createInvoiceDto.paymentId);
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
