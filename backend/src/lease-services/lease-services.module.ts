import { Module } from '@nestjs/common';
import { LeaseServicesService } from './lease-services.service';
import { LeaseServicesController } from './lease-services.controller';

@Module({
  controllers: [LeaseServicesController],
  providers: [LeaseServicesService],
})
export class LeaseServicesModule {}
