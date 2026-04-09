import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ExpenseUncheckedCreateInput, user: any) {
    if ((user.role === 'OWNER' || user.role === 'MANAGER') && data.propertyId) {
      const property: any = await this.prisma.property.findUnique({ where: { id: data.propertyId }, include: { owner: true } as any });
      if (!property) throw new UnauthorizedException('Propiedad no encontrada.');
      if (user.role === 'OWNER' && property.ownerId !== user.userId) {
        throw new UnauthorizedException('No autorizado para añadir gastos a esta propiedad.');
      }
      if (user.role === 'MANAGER' && property.owner?.managerId !== user.userId) {
        throw new UnauthorizedException('No autorizado para añadir gastos a esta propiedad.');
      }
    }
    return this.prisma.expense.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date as string | Date) : undefined
      },
    });
  }

  async parseXmlAndCreateExpense(xmlContent: string, propertyId: string | undefined, user: any) {
    try {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
      const jsonObj = parser.parse(xmlContent);

      const comprobante = jsonObj["cfdi:Comprobante"];
      if (!comprobante) throw new BadRequestException("El XML no es un CFDI válido");

      const emisor = comprobante["cfdi:Emisor"];
      const total = parseFloat(comprobante.Total);
      const uuidNode = comprobante["cfdi:Complemento"]?.["tfd:TimbreFiscalDigital"];
      const uuidSAT = uuidNode ? uuidNode.UUID : null;

      if (!emisor || !emisor.Rfc) throw new BadRequestException("No se encontró el emisor en el XML");

      const rfc = emisor.Rfc;
      const name = emisor.Nombre || rfc;
      const taxRegime = emisor.RegimenFiscal;
      
      const managerId = user.role === 'MANAGER' ? user.userId : (user.role === 'OWNER' ? user.managerId : undefined);

      // Ver si el Proveedor (Supplier) existe
      let supplier = await this.prisma.supplier.findFirst({
        where: { rfc, managerId }
      });

      if (!supplier) {
        supplier = await this.prisma.supplier.create({
          data: {
            name,
            rfc,
            taxRegime,
            category: 'GENERAL', // Default
            managerId
          }
        });
      }

      // Evitar duplicados por UUID
      if (uuidSAT) {
        const existing = await this.prisma.expense.findFirst({ where: { uuidSAT } });
        if (existing) throw new BadRequestException(`El CFDI ${uuidSAT} ya fue registrado.`);
      }

      const expense = await this.prisma.expense.create({
        data: {
          propertyId,
          amount: total,
          category: 'MAINTENANCE',
          description: `Gasto amparado por CFDI de ${name}`,
          supplierId: supplier.id,
          uuidSAT,
          xmlUrl: xmlContent.substring(0, 500) // Solo guardamos una parte o el contenido como "url" text por ahora
        }
      });

      return { expense, supplier };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException("Fallo procesando el XML CFDI: " + e.message);
    }
  }

  async findAll(user: any, propertyId?: string) {
    let whereClause: any = {};
    if (propertyId) {
      whereClause.propertyId = propertyId;
    }

    if (user.role === 'OWNER') {
      whereClause.property = { ownerId: user.userId };
    } else if (user.role === 'MANAGER') {
      whereClause.property = { owner: { managerId: user.userId } };
    }

    return this.prisma.expense.findMany({
      where: whereClause,
      include: { property: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, user: any) {
    let whereClause: any = { id };
    if (user.role === 'OWNER') {
      whereClause.property = { ownerId: user.userId };
    } else if (user.role === 'MANAGER') {
      whereClause.property = { owner: { managerId: user.userId } };
    }

    const expense = await this.prisma.expense.findFirst({
      where: whereClause,
      include: { property: true },
    });
    if (!expense) throw new NotFoundException(`Gasto no encontrado o no tienes permiso`);
    return expense;
  }

  async update(id: string, data: Prisma.ExpenseUpdateInput, user: any) {
    await this.findOne(id, user); // Valida permisos
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date as string | Date) : undefined
      },
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.expense.delete({
      where: { id },
    });
  }

  // Gets the profitability for a property: Total Payments - Total Expenses
  async getProfitability(propertyId: string, user: any) {
    if (user.role === 'OWNER' || user.role === 'MANAGER') {
      const property: any = await this.prisma.property.findUnique({ where: { id: propertyId }, include: { owner: true } as any });
      if (!property) throw new UnauthorizedException('Propiedad no encontrada.');
      if (user.role === 'OWNER' && property.ownerId !== user.userId) {
        throw new UnauthorizedException('No autorizado para ver la rentabilidad de esta propiedad.');
      }
      if (user.role === 'MANAGER' && property.owner?.managerId !== user.userId) {
        throw new UnauthorizedException('No autorizado para ver la rentabilidad de esta propiedad.');
      }
    }

    const expenses = await this.prisma.expense.aggregate({
      where: { propertyId },
      _sum: { amount: true },
    });

    const payments = await this.prisma.payment.aggregate({
      where: {
        charge: { lease: { unit: { propertyId } } }
      },
      _sum: { amount: true },
    });

    const totalIncome = payments._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;

    return {
      propertyId,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
    };
  }
}
