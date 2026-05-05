import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FacturaProService } from '../facturapro/facturapro.service';
import { TaxCalculatorService } from './tax-calculator.service';

@Injectable()
export class PayrollRunsService {
  constructor(
    private prisma: PrismaService, 
    private facturaproService: FacturaProService,
    private taxService: TaxCalculatorService
  ) {}

  async create(createPayrollRunDto: any, managerId: string) {
    const { name, startDate, endDate, paymentDate, status } = createPayrollRunDto;
    
    // Fallback find any manager if not provided via auth yet
    if (managerId === 'TODO_OVERRIDE_IN_AUTH') {
        const anyManager = await this.prisma.user.findFirst({ where: { role: 'MANAGER' } });
        if (anyManager) managerId = anyManager.id;
        else {
           // Create a dummy manager if none exists for testing
           const created = await this.prisma.user.create({ data: { name: 'Admin', email: 'admin@payroll.com', password: '123', role: 'MANAGER' }});
           managerId = created.id;
        }
    }

    return this.prisma.payrollRun.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        managerId,
        status: status || 'DRAFT'
      }
    });
  }

  async generatePayslips(payrollRunId: string) {
    const run = await this.prisma.payrollRun.findUnique({ where: { id: payrollRunId } });
    if (!run) throw new NotFoundException('PayrollRun not found');

    const employees = await this.prisma.user.findMany({
      where: { role: 'EMPLOYEE', isActive: true },
      include: { employeeProfile: true }
    });

    const payslips = [];
    for (const emp of employees) {
      if (emp.employeeProfile) {
        let baseSalary = emp.employeeProfile.baseSalary || 0;
        let dailySalary = baseSalary / 30; // Sueldo diario estandar

        // Castigo por Faltas en el periodo
        const absences = await this.prisma.attendanceRecord.count({
          where: {
            employeeId: emp.id,
            type: 'ABSENCE',
            date: { gte: new Date(run.startDate), lte: new Date(run.endDate) }
          }
        });

        // Calculamos la base gravable real restando las faltas * sueldo diario
        const unpaidAmount = absences * dailySalary;
        const taxableBase = Math.max(0, baseSalary - unpaidAmount);

        let isrDeduction = this.taxService.calculateMonthlyTax(taxableBase);
        let imssDeduction = this.taxService.calculateIMSSDeduction(taxableBase);
        let totalDeductions = isrDeduction + imssDeduction + unpaidAmount;

        let p = await this.prisma.payslip.create({
          data: {
            payrollRunId: run.id,
            employeeId: emp.id,
            baseSalary: baseSalary,
            deductions: totalDeductions,
            netAmount: baseSalary - totalDeductions,
            modifiers: { isr: isrDeduction, imss: imssDeduction, unpaidAbsences: unpaidAmount, absenceDays: absences, isAutoCalculated: true },
            status: 'DRAFT',
          }
        });
        payslips.push(p);
      }
    }

    return payslips;
  }

  async findAll() {
    return this.prisma.payrollRun.findMany({
      include: {
        manager: { select: { name: true, email: true } },
        payslips: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id },
      include: { payslips: { include: { employee: true } } }
    });

    if (!run) throw new NotFoundException('Payroll Run not found');
    return run;
  }
  
  async updatePayslip(payslipId: string, data: any) {
    const { bonus = 0, deductions = 0, modifiers } = data;
    const payslip = await this.prisma.payslip.findUnique({ where: { id: payslipId } });
    if (!payslip) throw new NotFoundException('Payslip not found');
    
    const netAmount = payslip.baseSalary + bonus - deductions;
    return this.prisma.payslip.update({
      where: { id: payslipId },
      data: { bonus, deductions, netAmount, modifiers }
    });
  }

  async approveAndPay(id: string) {
    await this.prisma.payslip.updateMany({
      where: { payrollRunId: id },
      data: { status: 'PAID' }
    });

    const run = await this.prisma.payrollRun.update({
      where: { id },
      data: { status: 'PAID', paymentDate: new Date() },
      include: { payslips: true }
    });
    
    // M2M Sync: Timbrar SAT Nomina para cada recibo emitido
    // Para no bloquear completamente, iteramos sobre ellos
    for (const slip of run.payslips) {
        await this.facturaproService.issuePayrollSlip(slip.id).catch(console.error);
    }

    return run;
  }

  async exportBankLayout(id: string) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id },
      include: { payslips: { include: { employee: { include: { employeeProfile: true } } } } }
    });

    if (!run) throw new NotFoundException('Payroll Run not found');

    let layout = `HBBVA${new Date().toISOString().slice(0,10).replace(/-/g,'')}NOMINA${run.name}\n`;
    let total = 0;
    
    for(const slip of run.payslips) {
       const bankClabe = slip.employee.employeeProfile?.bankClabe || '000000000000000000';
       const name = slip.employee.name.padEnd(40, ' ').substring(0, 40);
       const amountStr = slip.netAmount.toFixed(2).replace('.', '').padStart(15, '0');
       total += slip.netAmount;
       
       // Forma basica de Layout SPEI (Detalle)
       layout += `D${bankClabe}${amountStr}${name}PAGO NOMINA\n`;
    }
    
    const totalStr = total.toFixed(2).replace('.', '').padStart(18, '0');
    layout += `T${run.payslips.length.toString().padStart(6, '0')}${totalStr}\n`;
    
    return layout;
  }
}
