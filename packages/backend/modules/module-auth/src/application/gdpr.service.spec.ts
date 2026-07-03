import { NotFoundException } from '@nestjs/common';
import { GdprService } from './gdpr.service';

const mockUser = {
  id: 'u1',
  email: 'alice@example.com',
  passwordHash: 'hash',
  displayName: 'Alice',
  avatarUrl: null,
  phone: null,
  telegram: null,
  bio: null,
  status: 'ACTIVE',
  oauthAccounts: [],
  schoolMemberships: [],
  vocabularyCards: [],
  lessonsAsStudent: [],
  quizAttempts: [],
  speakingSubmissions: [],
  notificationDeliveries: [],
};

const makePrismaMock = (user: typeof mockUser | null = mockUser) => ({
  user: {
    findUnique: jest.fn().mockResolvedValue(user),
    update: jest.fn().mockResolvedValue(undefined),
  },
  authRefreshToken: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  passwordResetToken: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  oAuthAccount: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  $transaction: jest.fn().mockImplementation((ops: Promise<unknown>[]) =>
    Promise.all(ops),
  ),
});

describe('GdprService', () => {
  describe('exportUserData', () => {
    it('returns user data without passwordHash', async () => {
      const prisma = makePrismaMock();
      const svc = new GdprService(prisma as never);
      const result = await svc.exportUserData('u1');
      expect(result.exportedAt).toBeDefined();
      const profile = result.profile as Record<string, unknown>;
      expect(profile.email).toBe('alice@example.com');
      expect(profile.passwordHash).toBeUndefined();
    });

    it('throws NotFoundException for unknown user', async () => {
      const prisma = makePrismaMock(null);
      const svc = new GdprService(prisma as never);
      await expect(svc.exportUserData('unknown')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('eraseUser', () => {
    it('anonymizes the user and deletes tokens', async () => {
      const prisma = makePrismaMock();
      const svc = new GdprService(prisma as never);
      const result = await svc.eraseUser('u1', 'admin1');
      expect(result.erasedUserId).toBe('u1');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('throws NotFoundException for unknown user', async () => {
      const prisma = makePrismaMock(null);
      const svc = new GdprService(prisma as never);
      await expect(svc.eraseUser('ghost', 'admin')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
