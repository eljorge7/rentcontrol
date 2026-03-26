export class CreateQuotationDto {
  prospectName: string;
  prospectEmail?: string;
  managementPlanId: string;
  propertyCount: number;
  cfdiUse?: string;
  taxRegime?: string;
}
