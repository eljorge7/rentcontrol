import { PartialType } from '@nestjs/mapped-types';
import { CreateMikrotikDto } from './create-mikrotik.dto';

export class UpdateMikrotikDto extends PartialType(CreateMikrotikDto) {
  isActive?: boolean;
}
