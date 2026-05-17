import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { AuthSessionService } from '@soenglish/module-auth';
import type { Server, Socket } from 'socket.io';
import type { ChatMessageDto } from '@soenglish/shared-types';
import { ChatService } from './chat.service';
import { ChatVisibilityService } from './chat-visibility.service';

type AuthedSocket = Socket & { data: { userId?: string } };

function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:4200',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly sessionAuth: AuthSessionService,
    private readonly chat: ChatService,
    private readonly visibility: ChatVisibilityService,
  ) {}

  async handleConnection(client: AuthedSocket) {
    const cookies = parseCookieHeader(client.handshake.headers.cookie);
    const req = { cookies, headers: client.handshake.headers } as Parameters<
      AuthSessionService['resolveAuthenticatedUserId']
    >[0];
    const userId = await this.sessionAuth.resolveAuthenticatedUserId(req);
    if (!userId) {
      this.logger.warn('Chat socket rejected: unauthenticated');
      client.disconnect(true);
      return;
    }
    client.data.userId = userId;
    await client.join(`user:${userId}`);
  }

  handleDisconnect(client: AuthedSocket) {
    void client.rooms;
  }

  @SubscribeMessage('conversation:join')
  async onJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: { conversationId?: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload?.conversationId) return { ok: false };
    try {
      await this.visibility.assertParticipant(userId, payload.conversationId);
      await client.join(`conv:${payload.conversationId}`);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

  @SubscribeMessage('message:send')
  async onSend(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: { conversationId?: string; body?: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !payload?.conversationId || !payload.body) {
      return { ok: false, error: 'Invalid payload' };
    }
    try {
      const message = await this.chat.sendMessage(userId, payload.conversationId, payload.body);
      this.broadcastNewMessage(message, payload.conversationId);
      return { ok: true, message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Send failed';
      return { ok: false, error: message };
    }
  }

  broadcastNewMessage(message: ChatMessageDto, conversationId: string): void {
    const envelope = { message, conversationId };
    void this.chat.getParticipantUserIds(conversationId).then((participantIds) => {
      this.server.to(`conv:${conversationId}`).emit('message:new', envelope);
      for (const participantId of participantIds) {
        this.server.to(`user:${participantId}`).emit('conversation:updated', { conversationId });
      }
    });
  }
}

export type ChatSocketEvents = {
  'message:new': { message: ChatMessageDto; conversationId: string };
  'conversation:updated': { conversationId: string };
};
