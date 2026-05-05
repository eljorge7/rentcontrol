import { Injectable } from '@nestjs/common';

@Injectable()
export class TaxCalculatorService {
  // Approximate ISR 2024 Monthly Table limits (LowerLimit, BaseTax, Percentage over LowerLimit)
  private readonly isrTableMonthly = [
    { limit: 0,         base: 0,          rate: 0.0192 },
    { limit: 746.05,    base: 14.32,      rate: 0.0640 },
    { limit: 6332.06,   base: 371.83,     rate: 0.1088 },
    { limit: 11128.02,  base: 893.63,     rate: 0.1600 },
    { limit: 12935.83,  base: 1182.88,    rate: 0.1792 },
    { limit: 15487.72,  base: 1640.18,    rate: 0.2136 },
    { limit: 31236.50,  base: 5004.12,    rate: 0.2352 },
    { limit: 49233.01,  base: 9236.89,    rate: 0.3000 },
    { limit: 93993.91,  base: 22665.17,   rate: 0.3200 },
    { limit: 125325.21, base: 32691.18,   rate: 0.3400 },
    { limit: 375975.62, base: 117912.32,  rate: 0.3500 }
  ];

  /**
   * Calcula el ISR a retener de un sueldo mensual.
   */
  public calculateMonthlyTax(monthlyBaseSalary: number): number {
    let lowerLimit = 0;
    let baseTax = 0;
    let rate = 0;

    for (let i = this.isrTableMonthly.length - 1; i >= 0; i--) {
      if (monthlyBaseSalary >= this.isrTableMonthly[i].limit) {
        lowerLimit = this.isrTableMonthly[i].limit;
        baseTax = this.isrTableMonthly[i].base;
        rate = this.isrTableMonthly[i].rate;
        break;
      }
    }

    const excess = monthlyBaseSalary - lowerLimit;
    const marginalTax = excess * rate;
    return baseTax + marginalTax;
  }

  /**
   * Estimación de Cuota Obrero IMSS 
   * Se retiene aprox. 2.775% del Salario Base.
   */
  public calculateIMSSDeduction(monthlyBaseSalary: number): number {
     return monthlyBaseSalary * 0.02775;
  }
}
