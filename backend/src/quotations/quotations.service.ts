import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async create(managerId: string, data: CreateQuotationDto) {
    const plan = await this.prisma.managementPlan.findUnique({
      where: { id: data.managementPlanId },
    });

    if (!plan) {
      throw new NotFoundException('Management plan not found');
    }

    // Default total amount logic: base fixed fee per property + optional rules
    // Can be adjusted based on specific business rules.
    const baseTotalAmount = plan.fixedFee * data.propertyCount;

    return this.prisma.quotation.create({
      data: {
        prospectName: data.prospectName,
        prospectEmail: data.prospectEmail,
        managementPlanId: data.managementPlanId,
        managerId,
        propertyCount: data.propertyCount,
        cfdiUse: data.cfdiUse,
        taxRegime: data.taxRegime,
        totalAmount: baseTotalAmount,
        status: 'SENT',
      },
      include: {
        managementPlan: true,
      },
    });
  }

  async findAll(managerId: string) {
    return this.prisma.quotation.findMany({
      where: { managerId },
      include: {
        managementPlan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForAdmin() {
    return this.prisma.quotation.findMany({
      include: {
        managementPlan: true,
        manager: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, managerId: string) {
    const quote = await this.prisma.quotation.findFirst({
      where: { id, managerId },
      include: {
        managementPlan: true,
      },
    });
    if (!quote) throw new NotFoundException('Quotation not found');
    return quote;
  }

  async update(id: string, managerId: string, data: any) {
    const quote = await this.prisma.quotation.findFirst({ where: { id, managerId } });
    if (!quote) throw new NotFoundException('Quotation not found');

    // recalculate if necessary
    let baseTotalAmount = quote.totalAmount;
    if (data.managementPlanId || data.propertyCount !== undefined) {
      const plan = await this.prisma.managementPlan.findUnique({
        where: { id: data.managementPlanId || quote.managementPlanId },
      });
      if (plan) {
        baseTotalAmount = plan.fixedFee * (data.propertyCount ?? quote.propertyCount);
      }
    }

    return this.prisma.quotation.update({
      where: { id },
      data: {
        prospectName: data.prospectName,
        prospectEmail: data.prospectEmail,
        managementPlanId: data.managementPlanId,
        propertyCount: data.propertyCount,
        taxRegime: data.taxRegime,
        totalAmount: baseTotalAmount,
      },
    });
  }

  async remove(id: string, managerId: string) {
    const quote = await this.prisma.quotation.findFirst({ where: { id, managerId } });
    if (!quote) throw new NotFoundException('Quotation not found');

    if (quote.status === 'ACCEPTED') {
      throw new BadRequestException('Cannot delete an accepted quotation');
    }

    return this.prisma.quotation.delete({
      where: { id },
    });
  }

  async requestBilling(id: string, managerId: string) {
    const quote = await this.prisma.quotation.findFirst({
      where: { id, managerId },
    });

    if (!quote) throw new NotFoundException('Quotation not found');
    if (quote.status !== 'ACCEPTED') {
      throw new BadRequestException('Quotation must be ACCEPTED before requesting billing');
    }

    return this.prisma.quotation.update({
      where: { id },
      data: { status: 'PENDING_INVOICE' },
    });
  }

  async markAsInvoiced(id: string) {
    const quote = await this.prisma.quotation.findUnique({
      where: { id },
      include: { manager: true }
    });

    if (!quote) throw new NotFoundException('Quotation not found');
    if (quote.status !== 'PENDING_INVOICE') {
      throw new BadRequestException('Quotation must be PENDING_INVOICE before marking as invoiced');
    }

    return this.prisma.$transaction(async (prisma) => {
      // 1. Mark as invoiced
      const updatedQuote = await prisma.quotation.update({
        where: { id },
        data: { status: 'INVOICED' },
      });

      // 2. Record this as platform earning internally for reporting
      await prisma.platformEarning.create({
        data: {
          amount: quote.totalAmount,
          description: `Ingreso por Gestión: ${quote.prospectName}`,
          managerId: quote.managerId,
        }
      });

      return updatedQuote;
    });
  }

  // Public endpoint to view a quotation
  async getPublicQuotation(id: string) {
    const quote = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        managementPlan: true,
        manager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    if (!quote) throw new NotFoundException('Quotation not found');
    return quote;
  }

  // Public endpoint to accept
  async acceptQuotation(id: string) {
    const quote = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!quote) throw new NotFoundException('Quotation not found');
    if (quote.status === 'ACCEPTED') throw new BadRequestException('Quotation already accepted');

    // Create the new owner user in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // 1. Mark as accepted
      const updatedQuote = await prisma.quotation.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });

      // 2. Create the Owner user 
      // Password generation logic or temporal password
      const tempPassword = 'Temporal123!';
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      const userEmail = quote.prospectEmail || `prospect_${quote.id}@rentcontrol.com`;
      
      let user = await prisma.user.findUnique({ where: { email: userEmail } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name: quote.prospectName,
            password: hashedPassword,
            role: 'OWNER',
            managerId: quote.managerId,
            managementPlanId: quote.managementPlanId,
            maxProperties: quote.propertyCount,
            planType: 'FULL_MANAGEMENT',
          },
        });
        
        // Ensure owner profile is created
        await prisma.ownerProfile.create({
          data: {
            userId: user.id,
            legalName: quote.prospectName,
            taxRegime: quote.taxRegime,
          }
        });
      }

      // We could generate an initial setup Charge for the owner here if the system tracks owner-level charges.
      // Since Charges are linked to Leases currently, we skip for now or we create an Invoice.
      
      return { quotation: updatedQuote, assignedUserId: user.id };
    });
  }
}
