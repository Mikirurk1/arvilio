'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  ChatConversationDto,
  ChatMessageDto,
  ChatUserDto,
} from '@pkg/types';
import {
  CHAT_CONTACTS,
  CHAT_INBOX,
  CHAT_MESSAGES,
  CREATE_GROUP_CONVERSATION,
  FIND_OR_CREATE_DIRECT,
  MARK_CONVERSATION_READ,
} from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import { chatMessagePreview } from '../lib/chat-upload';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

/** Must match `MESSAGE_PAGE` in `packages/backend/modules/chat`. */
export const CHAT_MESSAGE_PAGE_SIZE = 50;

type ChatState = {
  inbox: AsyncSlice<ChatConversationDto[]>;
  contacts: AsyncSlice<ChatUserDto[]>;
  messages: AsyncSlice<ChatMessageDto[]>;
  activeConversationId: string | null;
  hasMoreOlder: boolean;
  loadingOlder: boolean;
  fetchInbox: (force?: boolean) => Promise<void>;
  fetchContacts: (force?: boolean) => Promise<void>;
  fetchMessages: (conversationId: string, force?: boolean) => Promise<void>;
  fetchOlderMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  openDirect: (peerUserId: string) => Promise<ChatConversationDto>;
  createGroup: (title: string, memberIds: string[]) => Promise<ChatConversationDto>;
  markRead: (conversationId: string) => Promise<void>;
  appendMessage: (message: ChatMessageDto) => void;
  patchInboxConversation: (conversation: ChatConversationDto) => void;
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      inbox: createIdleSlice<ChatConversationDto[]>(),
      contacts: createIdleSlice<ChatUserDto[]>(),
      messages: createIdleSlice<ChatMessageDto[]>(),
      activeConversationId: null,
      hasMoreOlder: false,
      loadingOlder: false,

      fetchInbox: async (force = false) => {
        const prev = get().inbox;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ inbox: sliceLoading(prev) }, false, 'chat/inbox:start');
        try {
          const data = await graphqlRequest<{ chatInbox: ChatConversationDto[] }>(CHAT_INBOX);
          set({ inbox: sliceSuccess(prev, data.chatInbox) }, false, 'chat/inbox:success');
        } catch (error) {
          set({ inbox: sliceError(prev, error) }, false, 'chat/inbox:error');
        }
      },

      fetchContacts: async (force = false) => {
        const prev = get().contacts;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ contacts: sliceLoading(prev) }, false, 'chat/contacts:start');
        try {
          const data = await graphqlRequest<{ chatContacts: ChatUserDto[] }>(CHAT_CONTACTS);
          set({ contacts: sliceSuccess(prev, data.chatContacts) }, false, 'chat/contacts:success');
        } catch (error) {
          set({ contacts: sliceError(prev, error) }, false, 'chat/contacts:error');
        }
      },

      fetchMessages: async (conversationId, force = false) => {
        const prev = get().messages;
        if (!force && get().activeConversationId === conversationId && prev.status === 'success') {
          return;
        }
        set(
          {
            messages: sliceLoading(prev),
            activeConversationId: conversationId,
            hasMoreOlder: false,
            loadingOlder: false,
          },
          false,
          'chat/messages:start',
        );
        try {
          const data = await graphqlRequest<{ chatMessages: ChatMessageDto[] }>(CHAT_MESSAGES, {
            conversationId,
          });
          const batch = data.chatMessages;
          set(
            {
              messages: sliceSuccess(prev, batch),
              hasMoreOlder: batch.length === CHAT_MESSAGE_PAGE_SIZE,
              loadingOlder: false,
            },
            false,
            'chat/messages:success',
          );
        } catch (error) {
          set({ messages: sliceError(prev, error), loadingOlder: false }, false, 'chat/messages:error');
        }
      },

      fetchOlderMessages: async (conversationId) => {
        const state = get();
        if (
          conversationId !== state.activeConversationId ||
          !state.hasMoreOlder ||
          state.loadingOlder ||
          state.messages.status !== 'success'
        ) {
          return;
        }
        const existing = state.messages.data ?? [];
        if (existing.length === 0) return;

        const cursor = existing[0].createdAt;
        set({ loadingOlder: true }, false, 'chat/messages:older:start');
        try {
          const data = await graphqlRequest<{ chatMessages: ChatMessageDto[] }>(CHAT_MESSAGES, {
            conversationId,
            cursor,
          });
          const batch = data.chatMessages;
          const seen = new Set(existing.map((row) => row.id));
          const older = batch.filter((row) => !seen.has(row.id));
          const merged = [...older, ...existing];
          set(
            {
              messages: sliceSuccess(state.messages, merged),
              hasMoreOlder: batch.length === CHAT_MESSAGE_PAGE_SIZE,
              loadingOlder: false,
            },
            false,
            'chat/messages:older:success',
          );
        } catch {
          set({ loadingOlder: false }, false, 'chat/messages:older:error');
        }
      },

      setActiveConversation: (conversationId) => {
        set({
          activeConversationId: conversationId,
          ...(conversationId === null
            ? { hasMoreOlder: false, loadingOlder: false }
            : {}),
        });
      },

      openDirect: async (peerUserId) => {
        const data = await graphqlRequest<{ findOrCreateDirectConversation: ChatConversationDto }>(
          FIND_OR_CREATE_DIRECT,
          { peerUserId },
        );
        const conversation = data.findOrCreateDirectConversation;
        get().patchInboxConversation(conversation);
        return conversation;
      },

      createGroup: async (title, memberIds) => {
        const data = await graphqlRequest<{ createGroupConversation: ChatConversationDto }>(
          CREATE_GROUP_CONVERSATION,
          { input: { title, memberIds } },
        );
        const conversation = data.createGroupConversation;
        get().patchInboxConversation(conversation);
        return conversation;
      },

      markRead: async (conversationId) => {
        await graphqlRequest(MARK_CONVERSATION_READ, { conversationId });
        const prev = get().inbox;
        if (prev.data) {
          set({
            inbox: sliceSuccess(
              prev,
              prev.data.map((row) =>
                row.id === conversationId ? { ...row, unreadCount: 0 } : row,
              ),
            ),
          });
        }
      },

      appendMessage: (message) => {
        const activeId = get().activeConversationId;
        if (activeId === message.conversationId) {
          const prev = get().messages;
          const existing = prev.data ?? [];
          if (existing.some((row) => row.id === message.id)) return;
          set({ messages: sliceSuccess(prev, [...existing, message]) });
        }
        const inbox = get().inbox;
        if (inbox.data) {
          const updated = inbox.data.map((row) =>
            row.id === message.conversationId
              ? {
                  ...row,
                  lastMessage: chatMessagePreview(message) || message.body,
                  lastMessageAt: message.createdAt,
                  unreadCount: message.isMine ? row.unreadCount : row.unreadCount + 1,
                }
              : row,
          );
          updated.sort(
            (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
          );
          set({ inbox: sliceSuccess(inbox, updated) });
        }
      },

      patchInboxConversation: (conversation) => {
        const prev = get().inbox;
        const rows = prev.data ?? [];
        const without = rows.filter((row) => row.id !== conversation.id);
        const next = [conversation, ...without].sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
        );
        set({ inbox: sliceSuccess(prev, next) });
      },
    }),
    { name: 'soenglish/chat' },
  ),
);

export function chatUnreadTotal(inbox: ChatConversationDto[] | undefined): number {
  return (inbox ?? []).reduce((sum, row) => sum + row.unreadCount, 0);
}
