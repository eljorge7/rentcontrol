import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MikrotikModule } from '../mikrotik/mikrotik.module';
import { FacturaproModule } from '../facturapro/facturapro.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MikrotikModule, FacturaproModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
