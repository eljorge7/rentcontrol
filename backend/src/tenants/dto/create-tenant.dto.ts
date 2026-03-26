export class CreateTenantDto {
  name: string;
  email: string;
  phone?: string;
  rfc?: string;
  taxRegimen?: string;
  zipCode?: string;
  ownerId?: string;
  password?: string;
  requiresInvoice?: boolean;
  taxDocumentUrl?: string;
}
