export class CreatePaymentDto {
  chargeId: string;
  amount: number;
  date: Date;
  reference?: string;
  method: string; // 'CASH', 'TRANSFER', 'STRIPE', 'MERCADOPAGO'
}
