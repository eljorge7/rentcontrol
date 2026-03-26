import { Module } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { MikrotikModule } from '../mikrotik/mikrotik.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MikrotikModule, NotificationsModule],
  controllers: [ChargesController],
  providers: [ChargesService],
  exports: [ChargesService],
})
export class ChargesModule {}
