import { Module } from '@nestjs/common';
import { OmniChatProxyController } from './omnichat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [OmniChatProxyController],
})
export class OmniChatModule {}
