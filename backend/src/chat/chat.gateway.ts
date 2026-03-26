import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<string, string>(); // clientId -> role (tenant/admin)

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected to Chat: ${client.id}`);
    
    // In a real app, you would extract JWT here to identify the user
    // For now, we listen for a "join" event to register them
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from Chat: ${client.id}`);
    this.activeUsers.delete(client.id);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() payload: { role: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.activeUsers.set(client.id, payload.role);
    
    if (payload.role === 'admin') client.join('admins');
    else if (payload.role === 'tenant') client.join(`tenant_${payload.userId}`);
    else if (payload.role === 'owner') client.join(`owner_${payload.userId}`);
    else if (payload.role === 'manager') client.join(`manager_${payload.userId}`);
    
    return { event: 'joined', data: `Welcome ${payload.role}` };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: { senderId: string; senderRole: string; senderName: string; text: string; receiverId?: string; receiverRole?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const savedMessage = await this.prisma.message.create({
      data: {
        text: payload.text,
        senderId: payload.senderId,
        senderRole: payload.senderRole,
        senderName: payload.senderName,
        receiverId: payload.receiverId || null,
        receiverRole: payload.receiverRole || null
      }
    });

    const messageData = {
      ...payload,
      id: savedMessage.id,
      timestamp: savedMessage.createdAt,
    };

    if (payload.senderRole === 'tenant') {
      // Tenants can send messages to their manager or admin
      if (payload.receiverId) {
        if (payload.receiverRole === 'manager') {
          this.server.to(`manager_${payload.receiverId}`).emit('newMessage', messageData);
        } else {
          this.server.to(`admin_${payload.receiverId}`).emit('newMessage', messageData);
        }
      } else {
        // Fallback backward compatibility
        this.server.to('admins').emit('newMessage', messageData);
      }
      client.emit('newMessage', messageData);
    } else if (payload.senderRole === 'admin') {
      // Admins send to specific tenant
      if (payload.receiverId) {
         this.server.to(`tenant_${payload.receiverId}`).emit('newMessage', messageData);
         client.emit('newMessage', messageData);
      }
    } else if (payload.senderRole === 'owner') {
      // Owner sends to their Manager
      if (payload.receiverId) {
        this.server.to(`manager_${payload.receiverId}`).emit('newMessage', messageData);
        client.emit('newMessage', messageData);
      }
    } else if (payload.senderRole === 'manager') {
      // Manager sends to a specific Owner or Tenant
      if (payload.receiverId) {
        if (payload.receiverRole === 'tenant') {
          this.server.to(`tenant_${payload.receiverId}`).emit('newMessage', messageData);
        } else {
          this.server.to(`owner_${payload.receiverId}`).emit('newMessage', messageData);
        }
        client.emit('newMessage', messageData);
      }
    }
  }
}
