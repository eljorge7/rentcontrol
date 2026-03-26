import { Module } from '@nestjs/common';
import { NetworkProfilesService } from './network-profiles.service';
import { NetworkProfilesController } from './network-profiles.controller';

@Module({
  controllers: [NetworkProfilesController],
  providers: [NetworkProfilesService],
})
export class NetworkProfilesModule {}
