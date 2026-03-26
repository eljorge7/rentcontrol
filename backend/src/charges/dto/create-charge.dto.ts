export class CreateChargeDto {
  leaseId: string;
  amount: number;
  description: string;
  dueDate: Date;
  status?: string; // e.g., 'PENDING', 'PAID', 'OVERDUE'
  type: string;   // e.g., 'RENT', 'INTERNET', 'MAINTENANCE'
}
