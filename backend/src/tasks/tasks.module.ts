import { Module } from '@nestjs/common';
import { PenaltyService } from './penalty/penalty.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [PenaltyService]
})
export class TasksModule {}
