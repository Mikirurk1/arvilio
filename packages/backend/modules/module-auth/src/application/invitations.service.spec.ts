import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InvitationsService } from './invitations.service';

const schoolId = 'school-1';
const userId = 'user-admin';
const inviteeId = 'user-invitee';

const prisma = {
  schoolMembership: { findFirst: jest.fn(), upsert: jest.fn() },
  schoolInvitation: {
    updateMany: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  school: { findUnique: jest.fn() },
  user: { findUnique: jest.fn() },
  $transaction: jest.fn(),
};
const mail = { appUrl: jest.fn().mockReturnValue('https://app.test'), sendTemplated: jest.fn().mockResolvedValue(true) };
const tenant = { schoolId };

function makeService() {
  return new InvitationsService(prisma as never, mail as never, tenant as never);
}

describe('InvitationsService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('creates invitation and sends email', async () => {
      prisma.schoolMembership.findFirst.mockResolvedValue(null);
      prisma.schoolInvitation.updateMany.mockResolvedValue({ count: 0 });
      prisma.schoolInvitation.create.mockResolvedValue({
        id: 'inv-1',
        token: 'tok',
        email: 'a@b.com',
        role: 'STUDENT',
        expiresAt: new Date(Date.now() + 86400000),
        acceptedAt: null,
        revokedAt: null,
        createdAt: new Date(),
      });
      prisma.school.findUnique.mockResolvedValue({ name: 'Acme School' });

      const svc = makeService();
      const result = await svc.create({ email: 'A@B.com', role: 'STUDENT' }, userId);

      expect(prisma.schoolInvitation.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ email: 'a@b.com', role: 'STUDENT', schoolId }) }),
      );
      expect(mail.sendTemplated).toHaveBeenCalledWith(
        'a@b.com',
        'school-invitation',
        expect.objectContaining({ schoolName: 'Acme School', acceptUrl: expect.stringContaining('tok') }),
      );
      expect(result.email).toBe('a@b.com');
    });

    it('throws if user is already an active member', async () => {
      prisma.schoolMembership.findFirst.mockResolvedValue({ id: 'mem-1' });
      await expect(makeService().create({ email: 'x@y.com', role: 'STUDENT' }, userId))
        .rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when no active school in context', async () => {
      const svc = new InvitationsService(prisma as never, mail as never, { schoolId: null } as never);
      await expect(svc.create({ email: 'x@y.com', role: 'STUDENT' }, userId))
        .rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('revoke', () => {
    it('revokes a pending invitation', async () => {
      prisma.schoolInvitation.findFirst.mockResolvedValue({ id: 'inv-1', revokedAt: null, acceptedAt: null });
      prisma.schoolInvitation.update.mockResolvedValue({});
      await makeService().revoke('inv-1');
      expect(prisma.schoolInvitation.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'inv-1' }, data: expect.objectContaining({ revokedAt: expect.any(Date) }) }),
      );
    });

    it('throws NotFoundException when not found', async () => {
      prisma.schoolInvitation.findFirst.mockResolvedValue(null);
      await expect(makeService().revoke('bad-id')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when already accepted', async () => {
      prisma.schoolInvitation.findFirst.mockResolvedValue({ id: 'inv-1', revokedAt: null, acceptedAt: new Date() });
      await expect(makeService().revoke('inv-1')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('accept', () => {
    const validInvitation = {
      id: 'inv-1',
      email: 'a@b.com',
      role: 'STUDENT' as const,
      expiresAt: new Date(Date.now() + 86400000),
      acceptedAt: null,
      revokedAt: null,
      schoolId,
      school: { status: 'ACTIVE', name: 'Acme' },
    };

    it('creates membership and marks invitation accepted', async () => {
      prisma.schoolInvitation.findUnique.mockResolvedValue(validInvitation);
      prisma.user.findUnique.mockResolvedValue({ email: 'a@b.com' });
      prisma.$transaction.mockResolvedValue([{}, {}]);

      await makeService().accept('tok', inviteeId);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('throws when email mismatch', async () => {
      prisma.schoolInvitation.findUnique.mockResolvedValue(validInvitation);
      prisma.user.findUnique.mockResolvedValue({ email: 'other@b.com' });
      await expect(makeService().accept('tok', inviteeId)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws when invitation is expired', async () => {
      prisma.schoolInvitation.findUnique.mockResolvedValue({
        ...validInvitation,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(makeService().accept('tok', inviteeId)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when school is suspended', async () => {
      prisma.schoolInvitation.findUnique.mockResolvedValue({
        ...validInvitation,
        school: { status: 'SUSPENDED', name: 'Acme' },
      });
      await expect(makeService().accept('tok', inviteeId)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFoundException for unknown token', async () => {
      prisma.schoolInvitation.findUnique.mockResolvedValue(null);
      await expect(makeService().accept('bad', inviteeId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
