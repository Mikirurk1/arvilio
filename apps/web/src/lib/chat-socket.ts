'use client';

import { io, type Socket } from 'socket.io-client';
import type { ChatMessageDto } from '@pkg/types';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

let socket: Socket | null = null;

export function getChatSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/chat`, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectChatSocket() {
  const client = getChatSocket();
  if (!client.connected) client.connect();
  return client;
}

export function disconnectChatSocket() {
  if (socket?.connected) socket.disconnect();
}

export type ChatSocketMessagePayload = {
  message: ChatMessageDto;
  conversationId: string;
};
