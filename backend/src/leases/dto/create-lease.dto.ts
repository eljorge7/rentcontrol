export class CreateLeaseDto {
  unitId: string;
  tenantId: string;
  startDate: Date;
  endDate?: Date;
  rentAmount: number;
  depositAmount?: number;
  paymentDay: number;
  lateFeeAmount?: number;
  gracePeriodDays?: number;
}
