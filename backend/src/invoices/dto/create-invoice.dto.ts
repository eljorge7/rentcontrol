export class CreateInvoiceDto {
  paymentId: string;
  uuidSAT?: string;
  xmlUrl?: string;
  pdfUrl?: string;
  status?: string; // PENDING, ISSUED, CANCELLED
}
