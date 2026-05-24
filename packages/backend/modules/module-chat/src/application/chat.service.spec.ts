import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ChatConversationType } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { ChatAttachmentService } from './chat-attachment.service';
import { ChatService } from './chat.service';
import { ChatVisibilityService } from './chat-visibility.service';

describe('ChatService', () => {
  let service: ChatService;
  const visibility = {
    assertParticipant: jest.fn(),
    assertCanMessage: jest.fn(),
    listContacts: jest.fn(),
  };
  const attachments = {
    newStorageKey: jest.fn(),
    expiresAtFromNow: jest.fn(),
    saveToDisk: jest.fn(),
    removeFromDisk: jest.fn(),
    isExpired: jest.fn(),
    attachmentUrl: jest.fn(),
  };
  const prisma = {
    chatParticipant: { findMany: jest.fn(), upsert: jest.fn(), update: jest.fn() },
    chatMessage: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    chatConversation: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    chatMessageAttachment: { findUnique: jest.fn(), delete: jest.fn() },
    user: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    visibility.assertParticipant.mockResolvedValue(undefined);
    visibility.assertCanMessage.mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: prisma },
        { provide: ChatVisibilityService, useValue: visibility },
        { provide: ChatAttachmentService, useValue: attachments },
      ],
    }).compile();
    service = moduleRef.get(ChatService);
  });

  it('inboxPage rejects invalid cursor', async () => {
    await expect(service.inboxPage('u1', 10, 'not-a-cursor')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('sendMessage rejects empty body', async () => {
    await expect(service.sendMessage('u1', 'conv-1', '   ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('createGroup forbids non-admin', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'TEACHER' });
    await expect(service.createGroup('t1', 'Team', ['s1'])).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('createGroup rejects empty title', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
    await expect(service.createGroup('a1', '  ', ['s1'])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('findOrCreateDirect returns existing conversation', async () => {
    const updatedAt = new Date('2026-05-20T10:00:00Z');
    prisma.chatConversation.findUnique.mockResolvedValue({
      id: 'conv-1',
      type: ChatConversationType.DIRECT,
      title: null,
      updatedAt,
      participants: [
        {
          userId: 'u1',
          lastReadAt: null,
          user: { id: 'u1', displayName: 'A', avatarUrl: null, role: 'STUDENT' },
        },
        {
          userId: 'u2',
          lastReadAt: null,
          user: { id: 'u2', displayName: 'B', avatarUrl: null, role: 'TEACHER' },
        },
      ],
      messages: [],
    });
    prisma.chatParticipant.upsert.mockResolvedValue({});
    prisma.chatMessage.count.mockResolvedValue(0);

    const dto = await service.findOrCreateDirect('u1', 'u2');
    expect(dto.id).toBe('conv-1');
    expect(dto.type).toBe('direct');
    expect(prisma.chatConversation.create).not.toHaveBeenCalled();
  });

  it('markRead updates participant lastReadAt', async () => {
    prisma.chatParticipant.update.mockResolvedValue({});
    await expect(service.markRead('u1', 'conv-1')).resolves.toBe(true);
    expect(prisma.chatParticipant.update).toHaveBeenCalled();
  });

  it('inboxPage returns paginated conversations', async () => {
    const updatedAt = new Date('2026-05-20T12:00:00.000Z');
    prisma.chatParticipant.findMany.mockResolvedValue([
      {
        conversation: {
          id: 'conv-1',
          type: ChatConversationType.DIRECT,
          title: null,
          updatedAt,
          participants: [
            {
              userId: 'u1',
              lastReadAt: null,
              user: { id: 'u1', displayName: 'Me', avatarUrl: null, role: 'STUDENT' },
            },
            {
              userId: 'u2',
              lastReadAt: null,
              user: { id: 'u2', displayName: 'Peer', avatarUrl: null, role: 'TEACHER' },
            },
          ],
          messages: [{ body: 'Hi', createdAt: updatedAt, senderId: 'u2', attachment: null }],
        },
      },
    ]);
    prisma.chatMessage.count.mockResolvedValue(1);

    const page = await service.inboxPage('u1', 10);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.lastMessage).toBe('Hi');
    expect(page.hasMore).toBe(false);
  });

  it('messages returns chronological DTOs', async () => {
    const createdAt = new Date('2026-05-20T10:00:00Z');
    prisma.chatMessage.findMany.mockResolvedValue([
      {
        id: 'm1',
        conversationId: 'conv-1',
        senderId: 'u2',
        body: 'Hi',
        createdAt,
        sender: { id: 'u2', displayName: 'Peer', avatarUrl: null, role: 'TEACHER' },
        attachment: null,
      },
    ]);

    const rows = await service.messages('u1', 'conv-1');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.body).toBe('Hi');
    expect(rows[0]?.isMine).toBe(false);
  });

  it('sendMessage creates message in transaction', async () => {
    const createdAt = new Date('2026-05-20T10:00:00Z');
    const created = {
      id: 'm1',
      conversationId: 'conv-1',
      senderId: 'u1',
      body: 'Hello',
      createdAt,
      sender: { id: 'u1', displayName: 'Me', avatarUrl: null, role: 'STUDENT' },
      attachment: null,
    };
    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        chatMessage: { create: jest.fn().mockResolvedValue(created) },
        chatConversation: { update: jest.fn().mockResolvedValue({}) },
      }),
    );

    const dto = await service.sendMessage('u1', 'conv-1', 'Hello');
    expect(dto.body).toBe('Hello');
    expect(dto.isMine).toBe(true);
  });

  it('createGroup creates conversation for admin', async () => {
    const updatedAt = new Date('2026-05-20T10:00:00Z');
    prisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
    visibility.listContacts.mockResolvedValue([{ id: 's1', displayName: 'Student' }]);
    prisma.chatConversation.create.mockResolvedValue({
      id: 'g1',
      type: ChatConversationType.GROUP,
      title: 'Team',
      updatedAt,
      participants: [
        {
          userId: 'a1',
          lastReadAt: null,
          user: { id: 'a1', displayName: 'Admin', avatarUrl: null, role: 'ADMIN' },
        },
        {
          userId: 's1',
          lastReadAt: null,
          user: { id: 's1', displayName: 'Student', avatarUrl: null, role: 'STUDENT' },
        },
      ],
      messages: [],
    });
    prisma.chatMessage.count.mockResolvedValue(0);

    const dto = await service.createGroup('a1', 'Team', ['s1']);
    expect(dto.type).toBe('group');
    expect(dto.title).toBe('Team');
  });

  it('createGroup rejects member not in contacts', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
    visibility.listContacts.mockResolvedValue([]);
    await expect(service.createGroup('a1', 'Team', ['s1'])).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('sendMessageWithAttachment saves file and creates message', async () => {
    attachments.newStorageKey.mockReturnValue('key/file.pdf');
    attachments.expiresAtFromNow.mockReturnValue(new Date('2026-05-21T00:00:00Z'));
    attachments.attachmentUrl.mockReturnValue('/api/chat/attachments/a1');
    attachments.isExpired.mockReturnValue(false);
    const createdAt = new Date('2026-05-20T10:00:00Z');
    const created = {
      id: 'm1',
      conversationId: 'conv-1',
      senderId: 'u1',
      body: '',
      createdAt,
      sender: { id: 'u1', displayName: 'Me', avatarUrl: null, role: 'STUDENT' },
      attachment: {
        id: 'a1',
        fileName: 'file.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 100,
        expiresAt: new Date('2026-05-21T00:00:00Z'),
      },
    };
    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        chatMessage: { create: jest.fn().mockResolvedValue(created) },
        chatConversation: { update: jest.fn().mockResolvedValue({}) },
      }),
    );

    const dto = await service.sendMessageWithAttachment(
      'u1',
      'conv-1',
      { buffer: Buffer.from('pdf'), mimetype: 'application/pdf', size: 100, originalname: 'file.pdf' },
      '',
    );
    expect(dto.attachment?.fileName).toBe('file.pdf');
    expect(attachments.saveToDisk).toHaveBeenCalled();
  });

  it('sendMessageWithAttachment rejects empty buffer', async () => {
    await expect(
      service.sendMessageWithAttachment(
        'u1',
        'conv-1',
        { buffer: Buffer.alloc(0), mimetype: 'text/plain', size: 0, originalname: 'x.txt' },
        '',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('resolveAttachmentDownload returns metadata for valid attachment', async () => {
    attachments.isExpired.mockReturnValue(false);
    prisma.chatMessageAttachment.findUnique.mockResolvedValue({
      id: 'a1',
      fileName: 'file.pdf',
      mimeType: 'application/pdf',
      storageKey: 'key/file.pdf',
      expiresAt: new Date('2026-05-21T00:00:00Z'),
      message: { conversationId: 'conv-1' },
    });

    await expect(service.resolveAttachmentDownload('u1', 'a1')).resolves.toEqual({
      fileName: 'file.pdf',
      mimeType: 'application/pdf',
    });
  });

  it('resolveAttachmentDownload throws when attachment missing', async () => {
    prisma.chatMessageAttachment.findUnique.mockResolvedValue(null);
    await expect(service.resolveAttachmentDownload('u1', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('resolveAttachmentDownload throws Gone when expired', async () => {
    attachments.isExpired.mockReturnValue(true);
    prisma.chatMessageAttachment.findUnique.mockResolvedValue({
      id: 'a1',
      fileName: 'file.pdf',
      mimeType: 'application/pdf',
      storageKey: 'key/file.pdf',
      expiresAt: new Date('2020-01-01T00:00:00Z'),
      message: { conversationId: 'conv-1' },
    });
    prisma.chatMessageAttachment.delete.mockResolvedValue({});

    await expect(service.resolveAttachmentDownload('u1', 'a1')).rejects.toBeInstanceOf(
      GoneException,
    );
    expect(attachments.removeFromDisk).toHaveBeenCalledWith('key/file.pdf');
  });
});
