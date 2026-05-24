import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatConversationType, type UserRole } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import type {
  ChatAttachmentDto,
  ChatConversationDto,
  ChatMessageDto,
  ChatUserDto,
} from '@pkg/types';
import { assertChatFileAllowed, messagePreview } from '../shared/chat-attachment.util';
import { ChatAttachmentService } from './chat-attachment.service';
import { ChatVisibilityService } from './chat-visibility.service';
import { decodeInboxCursor, encodeInboxCursor } from '../shared/chat-inbox-cursor.util';
import { directKeyFor, toChatUserDto } from '../shared/chat-user.util';

const STAFF_ROLES = new Set<UserRole>(['ADMIN', 'SUPER_ADMIN']);
const MESSAGE_PAGE = 50;

const conversationInclude = {
  participants: {
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
    },
  },
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: { attachment: true },
  },
};

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visibility: ChatVisibilityService,
    private readonly attachments: ChatAttachmentService,
  ) {}

  async inbox(actorId: string): Promise<ChatConversationDto[]> {
    const page = await this.inboxPage(actorId, 500);
    return page.items;
  }

  async inboxPage(
    actorId: string,
    limit = 25,
    cursor?: string,
  ): Promise<{ items: ChatConversationDto[]; hasMore: boolean; nextCursor: string | null }> {
    const take = Math.min(Math.max(limit, 1), 100);
    const cursorRow = cursor ? decodeInboxCursor(cursor) : null;
    const cursorWhere = cursorRow
      ? {
          conversation: {
            OR: [
              { updatedAt: { lt: cursorRow.updatedAt } },
              {
                AND: [{ updatedAt: cursorRow.updatedAt }, { id: { lt: cursorRow.id } }],
              },
            ],
          },
        }
      : {};

    const rows = await this.prisma.chatParticipant.findMany({
      where: { userId: actorId, ...cursorWhere },
      include: {
        conversation: { include: conversationInclude },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
      take: take + 1,
    });

    const hasMore = rows.length > take;
    const pageRows = hasMore ? rows.slice(0, take) : rows;
    const items = await Promise.all(
      pageRows.map(async (row) => this.toConversationDto(actorId, row.conversation)),
    );
    const last = pageRows[pageRows.length - 1]?.conversation;
    const nextCursor =
      hasMore && last ? encodeInboxCursor({ updatedAt: last.updatedAt, id: last.id }) : null;
    return { items, hasMore, nextCursor };
  }

  async messages(
    actorId: string,
    conversationId: string,
    cursor?: string,
  ): Promise<ChatMessageDto[]> {
    await this.visibility.assertParticipant(actorId, conversationId);
    const rows = await this.prisma.chatMessage.findMany({
      where: {
        conversationId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: MESSAGE_PAGE,
      include: {
        sender: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
        attachment: true,
      },
    });
    return rows
      .reverse()
      .map((row) => this.toMessageDto(actorId, row));
  }

  async findOrCreateDirect(actorId: string, peerUserId: string): Promise<ChatConversationDto> {
    await this.visibility.assertCanMessage(actorId, peerUserId);
    const key = directKeyFor(actorId, peerUserId);
    const existing = await this.prisma.chatConversation.findUnique({
      where: { directKey: key },
      include: this.conversationInclude(),
    });
    if (existing) {
      await this.ensureParticipant(existing.id, actorId);
      await this.ensureParticipant(existing.id, peerUserId);
      return this.toConversationDto(actorId, existing);
    }

    const created = await this.prisma.chatConversation.create({
      data: {
        type: ChatConversationType.DIRECT,
        directKey: key,
        createdById: actorId,
        participants: {
          create: [{ userId: actorId }, { userId: peerUserId }],
        },
      },
      include: this.conversationInclude(),
    });
    return this.toConversationDto(actorId, created);
  }

  async createGroup(
    actorId: string,
    title: string,
    memberIds: string[],
  ): Promise<ChatConversationDto> {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { role: true },
    });
    if (!actor || !STAFF_ROLES.has(actor.role)) {
      throw new ForbiddenException('Only admins can create group chats');
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new BadRequestException('Group title is required');

    const uniqueMembers = Array.from(new Set([actorId, ...memberIds]));
    if (uniqueMembers.length < 2) {
      throw new BadRequestException('A group needs at least two members');
    }

    for (const memberId of uniqueMembers) {
      if (memberId === actorId) continue;
      const allowed = await this.visibility.listContacts(actorId);
      if (!allowed.some((contact) => contact.id === memberId)) {
        throw new ForbiddenException(`Cannot add user ${memberId} to this group`);
      }
    }

    const created = await this.prisma.chatConversation.create({
      data: {
        type: ChatConversationType.GROUP,
        title: trimmedTitle,
        createdById: actorId,
        participants: {
          create: uniqueMembers.map((userId) => ({ userId })),
        },
      },
      include: this.conversationInclude(),
    });
    return this.toConversationDto(actorId, created);
  }

  async sendMessage(
    actorId: string,
    conversationId: string,
    body: string,
  ): Promise<ChatMessageDto> {
    await this.visibility.assertParticipant(actorId, conversationId);
    const trimmed = body.trim();
    if (!trimmed) throw new BadRequestException('Message cannot be empty');

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.chatMessage.create({
        data: { conversationId, senderId: actorId, body: trimmed },
        include: {
          sender: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
          attachment: true,
        },
      });
      await tx.chatConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
      return created;
    });

    return this.toMessageDto(actorId, message);
  }

  async sendMessageWithAttachment(
    actorId: string,
    conversationId: string,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
    body: string,
  ): Promise<ChatMessageDto> {
    if (!file?.buffer?.length) throw new BadRequestException('File is required');
    await this.visibility.assertParticipant(actorId, conversationId);
    const { safeName } = assertChatFileAllowed(file);
    const caption = body.trim();
    const storageKey = this.attachments.newStorageKey(safeName);
    const expiresAt = this.attachments.expiresAtFromNow();

    await this.attachments.saveToDisk(file.buffer, storageKey);

    try {
      const message = await this.prisma.$transaction(async (tx) => {
        const created = await tx.chatMessage.create({
          data: {
            conversationId,
            senderId: actorId,
            body: caption,
            attachment: {
              create: {
                fileName: safeName,
                mimeType: file.mimetype || 'application/octet-stream',
                sizeBytes: file.size,
                storageKey,
                expiresAt,
              },
            },
          },
          include: {
            sender: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
            attachment: true,
          },
        });
        await tx.chatConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
        return created;
      });
      return this.toMessageDto(actorId, message);
    } catch (error) {
      await this.attachments.removeFromDisk(storageKey);
      throw error;
    }
  }

  async resolveAttachmentDownload(
    actorId: string,
    attachmentId: string,
  ): Promise<{ fileName: string; mimeType: string }> {
    const row = await this.prisma.chatMessageAttachment.findUnique({
      where: { id: attachmentId },
      include: { message: { select: { conversationId: true } } },
    });
    if (!row) throw new NotFoundException('Attachment not found');
    await this.visibility.assertParticipant(actorId, row.message.conversationId);
    if (this.attachments.isExpired(row.expiresAt)) {
      await this.attachments.removeFromDisk(row.storageKey);
      await this.prisma.chatMessageAttachment
        .delete({ where: { id: row.id } })
        .catch(() => undefined);
      throw new GoneException('This file has expired and was deleted');
    }
    return { fileName: row.fileName, mimeType: row.mimeType };
  }

  async markRead(actorId: string, conversationId: string): Promise<boolean> {
    await this.visibility.assertParticipant(actorId, conversationId);
    await this.prisma.chatParticipant.update({
      where: { conversationId_userId: { conversationId, userId: actorId } },
      data: { lastReadAt: new Date() },
    });
    return true;
  }

  async getParticipantUserIds(conversationId: string): Promise<string[]> {
    const rows = await this.prisma.chatParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    return rows.map((row) => row.userId);
  }

  private conversationInclude() {
    return {
      participants: {
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' as const },
        take: 1,
        include: { attachment: true },
      },
    };
  }

  private async ensureParticipant(conversationId: string, userId: string) {
    await this.prisma.chatParticipant.upsert({
      where: { conversationId_userId: { conversationId, userId } },
      create: { conversationId, userId },
      update: {},
    });
  }

  private async toConversationDto(
    actorId: string,
    conversation: {
      id: string;
      type: ChatConversationType;
      title: string | null;
      updatedAt: Date;
      participants: Array<{
        userId: string;
        lastReadAt?: Date | null;
        user: { id: string; displayName: string; avatarUrl: string | null; role: UserRole };
      }>;
      messages: Array<{
        body: string;
        createdAt: Date;
        senderId: string;
        attachment?: { fileName: string } | null;
      }>;
    },
  ): Promise<ChatConversationDto> {
    const lastReadAt =
      conversation.participants.find((p) => p.userId === actorId)?.lastReadAt ?? null;

    const unreadCount = await this.prisma.chatMessage.count({
      where: {
        conversationId: conversation.id,
        senderId: { not: actorId },
        ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
      },
    });

    const last = conversation.messages[0];
    const participants: ChatUserDto[] = conversation.participants
      .filter((p) => p.userId !== actorId)
      .map((p) => toChatUserDto(actorId, p.user));

    let title = conversation.title ?? 'Group';
    let peer: ChatUserDto | null = null;
    if (conversation.type === ChatConversationType.DIRECT) {
      const other = conversation.participants.find((p) => p.userId !== actorId);
      if (other) {
        peer = toChatUserDto(actorId, other.user);
        title = peer.displayName;
      }
    }

    return {
      id: conversation.id,
      type: conversation.type === ChatConversationType.DIRECT ? 'direct' : 'group',
      title,
      peer,
      participants: conversation.type === ChatConversationType.GROUP ? participants : undefined,
      lastMessage: last
        ? messagePreview(last.body, last.attachment?.fileName ?? null) || null
        : null,
      lastMessageAt: last?.createdAt.toISOString() ?? conversation.updatedAt.toISOString(),
      unreadCount,
      updatedAt: conversation.updatedAt.toISOString(),
    };
  }

  private toMessageDto(
    actorId: string,
    row: {
      id: string;
      conversationId: string;
      senderId: string;
      body: string;
      createdAt: Date;
      sender: { id: string; displayName: string; avatarUrl: string | null; role: UserRole };
      attachment?: {
        id: string;
        fileName: string;
        mimeType: string;
        sizeBytes: number;
        expiresAt: Date;
      } | null;
    },
  ): ChatMessageDto {
    return {
      id: row.id,
      conversationId: row.conversationId,
      senderId: row.senderId,
      sender: toChatUserDto(actorId, row.sender),
      body: row.body,
      createdAt: row.createdAt.toISOString(),
      isMine: row.senderId === actorId,
      attachment: row.attachment ? this.toAttachmentDto(row.attachment) : null,
    };
  }

  private toAttachmentDto(row: {
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    expiresAt: Date;
  }): ChatAttachmentDto {
    const expired = this.attachments.isExpired(row.expiresAt);
    return {
      id: row.id,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      url: expired ? '' : this.attachments.attachmentUrl(row.id),
      expiresAt: row.expiresAt.toISOString(),
      expired,
    };
  }
}
