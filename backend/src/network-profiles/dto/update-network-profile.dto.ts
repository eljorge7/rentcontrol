import { PartialType } from '@nestjs/mapped-types';
import { CreateNetworkProfileDto } from './create-network-profile.dto';

export class UpdateNetworkProfileDto extends PartialType(CreateNetworkProfileDto) {}
