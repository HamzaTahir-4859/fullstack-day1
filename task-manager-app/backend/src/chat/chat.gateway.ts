import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'super-secret-jwt-key-2026',
      });

      client.data.user = payload;

      // Every user joins their personal room: "room_user_<id>"
      // Admins also join "room_admins" to receive all user messages in real time
      if (payload.role === 'admin') {
        client.join('room_admins');
        this.logger.log(`Admin connected to socket: ${payload.email}`);
      } else {
        client.join(`room_user_${payload.sub}`);
        this.logger.log(`User connected to socket: ${payload.email} (room_user_${payload.sub})`);
      }
    } catch (err) {
      this.logger.warn('Socket connection rejected: Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data?.user) {
      this.logger.log(`Disconnected from socket: ${client.data.user.email}`);
    }
  }

  // 1. Load Chat History for a specific User Thread
  @SubscribeMessage('joinThread')
  async handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId?: number },
  ) {
    const user = client.data.user;
    if (!user) return;

    // If admin, load the selected user's thread; if regular user, load their own thread
    const threadUserId = user.role === 'admin' ? data.targetUserId : user.sub;
    if (!threadUserId) return;

    if (user.role === 'admin') {
      client.join(`room_user_${threadUserId}`);
    }

    const history = await (this.prisma as any).chatMessage.findMany({
      where: { userId: Number(threadUserId) },
      orderBy: { createdAt: 'asc' },
    });

    client.emit('chatHistory', {
      userId: threadUserId,
      messages: history,
    });
  }

  // 2. Send Message (Works for both User -> Admin and Admin -> User)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId?: number; content: string },
  ) {
    const user = client.data.user;
    if (!user || !data.content?.trim()) return;

    // Determine which user's support thread this message belongs to
    const threadUserId =
      user.role === 'admin' ? Number(data.targetUserId) : Number(user.sub);

    if (!threadUserId) return;

    // Look up sender display name
    const dbSender: any = await this.prisma.user.findUnique({
      where: { id: Number(user.sub) },
    });

    const senderName =
      dbSender?.name || (user.role === 'admin' ? 'System Admin' : user.email);

    // Save message in SQLite
    const savedMsg = await (this.prisma as any).chatMessage.create({
      data: {
        userId: threadUserId,
        senderId: Number(user.sub),
        senderRole: user.role,
        senderName,
        content: data.content.trim(),
      },
    });

    // Broadcast in real time to the user's room AND to all online admins
    this.server.to(`room_user_${threadUserId}`).emit('newMessage', savedMsg);
    this.server.to('room_admins').emit('newMessage', savedMsg);
  }
}