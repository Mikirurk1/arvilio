'use client';

import { useEffect } from 'react';
import { connectChatSocket, getChatSocket, type ChatSocketMessagePayload } from '../lib/chat-socket';
import { useChatStore } from '../stores/chat-store';

export function useChatSocket(activeConversationId: string | null) {
  const appendMessage = useChatStore((s) => s.appendMessage);
  const fetchInbox = useChatStore((s) => s.fetchInbox);

  useEffect(() => {
    const socket = connectChatSocket();

    const onMessage = (payload: ChatSocketMessagePayload) => {
      appendMessage(payload.message);
    };

    const onInboxUpdate = () => {
      void fetchInbox(true);
    };

    socket.on('message:new', onMessage);
    socket.on('conversation:updated', onInboxUpdate);

    return () => {
      socket.off('message:new', onMessage);
      socket.off('conversation:updated', onInboxUpdate);
    };
  }, [appendMessage, fetchInbox]);

  useEffect(() => {
    const socket = getChatSocket();
    if (!activeConversationId) return;
    socket.emit('conversation:join', { conversationId: activeConversationId });
  }, [activeConversationId]);
}
