import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaseServiceDto } from './create-lease-service.dto';

export class UpdateLeaseServiceDto extends PartialType(CreateLeaseServiceDto) {
  status?: string;
}
