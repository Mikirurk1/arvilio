# Realtime chat

## Overview

Production chat at `/chat` — ported from `materials/figma_design` ChatView. **Socket.IO** on Nest (`/chat` namespace) + GraphQL for inbox, history, and conversation CRUD.

## Data model

- `ChatConversation` — `DIRECT` (unique `directKey`) or `GROUP` (`title`)
- `ChatParticipant` — `lastReadAt` for unread counts
- `ChatMessage` — `body`, `senderId`, `createdAt`; optional `ChatMessageAttachment`
- `ChatMessageAttachment` — file on disk; **`expiresAt` = createdAt + 24h**, then purged (hourly cron + on download)

Separate from one-way `TeacherMessage` (email/Telegram from student profile).

## Visibility (`ChatVisibilityService`)

| Actor | Can message |
|-------|-------------|
| Admin / Super admin | Everyone |
| Teacher | Assigned students + students from `ScheduledLesson` + admin/super-admin |
| Student | Assigned teacher + lesson teachers + admin/super-admin |

**Super-admin** is shown as **admin** to other users in chat (`displayRole`, `roleLabel`).

## Group chats

- Create: **admin** or **super-admin** only (`createGroupConversation`)
- Members: chosen from `chatContacts` (all users for staff)

## API

| GraphQL | Purpose |
|---------|---------|
| `chatContacts` | Users allowed for new DM / group picker |
| `chatInbox` | Conversation list with preview + unread |
| `chatMessages` | Paginated history |
| `findOrCreateDirectConversation` | Open 1:1 |
| `createGroupConversation` | New group |
| `markConversationRead` | Clear unread |

| Socket event | Direction |
|--------------|-----------|
| `conversation:join` | client → server |
| `message:send` | client → server (ack) |
| `message:new` | server → room `conv:{id}` |
| `conversation:updated` | server → `user:{id}` |

| REST | Purpose |
|------|---------|
| `POST /api/chat/conversations/:id/attachments` | multipart `file`, optional `body` caption; creates message + attachment |
| `GET /api/chat/attachments/:id` | download (410 when expired) |

Auth: httpOnly cookies on handshake (`AuthSessionService`). Upload dir: `CHAT_UPLOAD_DIR` (default `./data/chat-uploads`).

## Web

- `apps/web/src/app/chat/` — UI
- `stores/chat-store.ts`, `lib/chat-socket.ts`
- Sidebar **Chat** link + unread badge (`useChatNavBadge`)
- Env: `NEXT_PUBLIC_SOCKET_URL` (default `http://localhost:3000`)
- Attachments: confirm dialog + thread banner warn **24h retention**; emoji picker in composer

## Code

- `packages/backend/modules/module-chat/`
- `apps/api/src/graphql/chat.resolver.ts`
