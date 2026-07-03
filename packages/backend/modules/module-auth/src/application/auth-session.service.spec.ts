import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import * as jwt from 'jsonwebtoken';
import { AuthSessionService } from './auth-session.service';
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_COOKIE,
  generateRefreshToken,
  getJwtSecret,
  hashRefreshToken,
} from '../shared/auth-cookies';

describe('AuthSessionService', () => {
  let service: AuthSessionService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
    authRefreshToken: {
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    schoolMembership: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters';
    prisma.user.findUnique.mockResolvedValue({ status: 'ACTIVE' });
    prisma.authRefreshToken.updateMany.mockResolvedValue({});
    const moduleRef = await Test.createTestingModule({
      providers: [AuthSessionService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(AuthSessionService);
  });

  describe('rotateSessionFromRefreshToken', () => {
    it('returns null when refresh token is unknown', async () => {
      prisma.authRefreshToken.findFirst.mockResolvedValue(null);
      const result = await service.rotateSessionFromRefreshToken('invalid', {});
      expect(result).toBeNull();
    });

    it('revokes old token and issues new pair', async () => {
      const raw = generateRefreshToken();
      prisma.authRefreshToken.findFirst.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-abc',
        tokenHash: hashRefreshToken(raw),
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      prisma.authRefreshToken.update.mockResolvedValue({});
      prisma.authRefreshToken.create.mockResolvedValue({});

      const result = await service.rotateSessionFromRefreshToken(raw, { ip: '127.0.0.1' });

      expect(result?.userId).toBe('user-abc');
      expect(prisma.authRefreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'rt-1' } }),
      );
      expect(prisma.authRefreshToken.create).toHaveBeenCalled();
      const payload = jwt.verify(result!.accessToken, getJwtSecret()) as { sub?: string };
      expect(payload.sub).toBe('user-abc');
    });

    it('revokes blocked refresh token and throws ForbiddenException', async () => {
      const raw = generateRefreshToken();
      prisma.authRefreshToken.findFirst.mockResolvedValue({
        id: 'rt-blocked',
        userId: 'user-blocked',
        tokenHash: hashRefreshToken(raw),
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      prisma.user.findUnique.mockResolvedValue({ status: 'BLOCKED' });

      await expect(service.rotateSessionFromRefreshToken(raw, {})).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.authRefreshToken.updateMany).toHaveBeenCalledWith({
        where: { id: 'rt-blocked', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('resolveWebRequestSessionAuth', () => {
    const activeUser = {
      id: 'user-abc',
      email: 'u@example.com',
      displayName: 'User',
      avatarUrl: null,
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
      proficiencyLevel: null,
      timezone: 'Europe/Kyiv',
      teacherId: null,
      passwordHash: 'hash',
      oauthAccounts: [{ provider: 'GOOGLE' as const }],
    };

    it('loads the user once for a valid access cookie', async () => {
      const token = jwt.sign({ sub: 'user-abc' }, getJwtSecret(), {
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      });
      prisma.user.findUnique.mockResolvedValue(activeUser);

      const result = await service.resolveWebRequestSessionAuth({
        headers: {},
        cookies: { [ACCESS_COOKIE]: token },
      });

      expect(result).toEqual({ authStrategy: 'access', user: activeUser, impersonation: null });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('loads the user once for refresh-backed sessions', async () => {
      const rawRefresh = generateRefreshToken();
      prisma.authRefreshToken.findFirst.mockResolvedValue({
        id: 'rt-web',
        userId: 'user-abc',
      });
      prisma.user.findUnique.mockResolvedValue(activeUser);

      const result = await service.resolveWebRequestSessionAuth({
        headers: {},
        cookies: { [REFRESH_COOKIE]: rawRefresh },
      });

      expect(result).toEqual({ authStrategy: 'refresh', user: activeUser, impersonation: null });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('revokes blocked refresh-backed sessions and throws ForbiddenException', async () => {
      const rawRefresh = generateRefreshToken();
      prisma.authRefreshToken.findFirst.mockResolvedValue({
        id: 'rt-blocked',
        userId: 'user-blocked',
      });
      prisma.user.findUnique.mockResolvedValue({ ...activeUser, id: 'user-blocked', status: 'BLOCKED' });

      await expect(
        service.resolveWebRequestSessionAuth({
          headers: {},
          cookies: { [REFRESH_COOKIE]: rawRefresh },
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.authRefreshToken.updateMany).toHaveBeenCalledWith({
        where: { id: 'rt-blocked', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('resolveAuthenticatedUserId', () => {
    it('reads user id from valid access cookie', async () => {
      const token = jwt.sign({ sub: 'user-from-cookie' }, getJwtSecret(), {
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      });
      const userId = await service.resolveAuthenticatedUserId({
        headers: {},
        cookies: { [ACCESS_COOKIE]: token },
      });
      expect(userId).toBe('user-from-cookie');
    });

    it('rotates session when access expired but refresh cookie present', async () => {
      const expired = jwt.sign({ sub: 'old' }, getJwtSecret(), { expiresIn: -1 });
      const rawRefresh = generateRefreshToken();
      prisma.authRefreshToken.findFirst.mockResolvedValue({
        id: 'rt-2',
        userId: 'user-rotated',
        tokenHash: hashRefreshToken(rawRefresh),
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      prisma.authRefreshToken.update.mockResolvedValue({});
      prisma.authRefreshToken.create.mockResolvedValue({});

      const res = { cookie: jest.fn(), clearCookie: jest.fn() };
      const userId = await service.resolveAuthenticatedUserId(
        {
          headers: {},
          cookies: { [ACCESS_COOKIE]: expired, [REFRESH_COOKIE]: rawRefresh },
        },
        res as never,
      );

      expect(userId).toBe('user-rotated');
      expect(res.cookie).toHaveBeenCalled();
    });

    it('authenticates via refresh peek when response is unavailable', async () => {
      const rawRefresh = generateRefreshToken();
      prisma.authRefreshToken.findFirst.mockResolvedValue({
        id: 'rt-3',
        userId: 'user-peek',
      });

      const userId = await service.resolveAuthenticatedUserId({
        headers: {},
        cookies: { [REFRESH_COOKIE]: rawRefresh },
      });

      expect(userId).toBe('user-peek');
    });

    it('still authenticates when concurrent refresh rotation already consumed the token', async () => {
      const expired = jwt.sign({ sub: 'old' }, getJwtSecret(), { expiresIn: -1 });
      const rawRefresh = generateRefreshToken();
      prisma.authRefreshToken.findFirst
        .mockResolvedValueOnce({
          id: 'rt-4',
          userId: 'user-race',
        })
        .mockResolvedValueOnce(null);
      prisma.authRefreshToken.update.mockResolvedValue({});
      prisma.authRefreshToken.create.mockResolvedValue({});

      const res = { cookie: jest.fn(), clearCookie: jest.fn() };
      const userId = await service.resolveAuthenticatedUserId(
        {
          headers: {},
          cookies: { [ACCESS_COOKIE]: expired, [REFRESH_COOKIE]: rawRefresh },
        },
        res as never,
      );

      expect(userId).toBe('user-race');
    });

    it('rejects blocked users even with a valid access cookie', async () => {
      const token = jwt.sign({ sub: 'blocked-user' }, getJwtSecret(), {
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      });
      prisma.user.findUnique.mockResolvedValue({ status: 'BLOCKED' });

      await expect(
        service.resolveAuthenticatedUserId({
          headers: {},
          cookies: { [ACCESS_COOKIE]: token },
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('resolveTrialInfo', () => {
    it('returns days left for a TRIAL school with a trialEndsAt', async () => {
      const end = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
      prisma.schoolMembership.findFirst.mockResolvedValue({
        school: { status: 'TRIAL', subscription: { trialEndsAt: end } },
      });
      const info = await service.resolveTrialInfo('user-abc');
      expect(info?.trialEndsAt).toBe(end.toISOString());
      expect(info?.daysLeft).toBe(6);
    });

    it('returns null for a non-trial (ACTIVE) school', async () => {
      prisma.schoolMembership.findFirst.mockResolvedValue({
        school: { status: 'ACTIVE', subscription: { trialEndsAt: new Date() } },
      });
      expect(await service.resolveTrialInfo('user-abc')).toBeNull();
    });

    it('returns null when there is no membership or no trialEndsAt', async () => {
      prisma.schoolMembership.findFirst.mockResolvedValueOnce(null);
      expect(await service.resolveTrialInfo('user-abc')).toBeNull();
      prisma.schoolMembership.findFirst.mockResolvedValueOnce({
        school: { status: 'TRIAL', subscription: null },
      });
      expect(await service.resolveTrialInfo('user-abc')).toBeNull();
    });

    it('clamps daysLeft at 0 for a lapsed trial', async () => {
      prisma.schoolMembership.findFirst.mockResolvedValue({
        school: { status: 'TRIAL', subscription: { trialEndsAt: new Date(Date.now() - 86_400_000) } },
      });
      expect((await service.resolveTrialInfo('user-abc'))?.daysLeft).toBe(0);
    });
  });

  describe('impersonation (ADR-009)', () => {
    it('mints an access token carrying sub + imp claim', () => {
      const { accessToken, expiresInSeconds } = service.mintImpersonationAccessToken({
        targetUserId: 'target-1',
        actorUserId: 'operator-1',
        schoolId: 'school_a',
      });
      expect(expiresInSeconds).toBe(60 * 15);
      const payload = jwt.verify(accessToken, getJwtSecret()) as {
        sub?: string;
        imp?: { act: string; sid: string };
      };
      expect(payload.sub).toBe('target-1');
      expect(payload.imp).toEqual({ act: 'operator-1', sid: 'school_a' });
    });

    it('surfaces impersonation context from the access cookie in the web session', async () => {
      const { accessToken } = service.mintImpersonationAccessToken({
        targetUserId: 'user-abc',
        actorUserId: 'operator-1',
        schoolId: 'school_a',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-abc',
        email: 'u@example.com',
        displayName: 'User',
        avatarUrl: null,
        role: 'ADMIN',
        status: 'ACTIVE',
        proficiencyLevel: null,
        timezone: 'Europe/Kyiv',
        teacherId: null,
        passwordHash: 'hash',
        oauthAccounts: [],
      });

      const result = await service.resolveWebRequestSessionAuth({
        headers: {},
        cookies: { [ACCESS_COOKIE]: accessToken },
      });

      expect(result?.impersonation).toEqual({ actorUserId: 'operator-1', schoolId: 'school_a' });
    });

    it('readImpersonationClaim returns null for a normal token', () => {
      const token = jwt.sign({ sub: 'user-abc' }, getJwtSecret(), {
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      });
      expect(service.readImpersonationClaim({ headers: {}, cookies: { [ACCESS_COOKIE]: token } })).toBeNull();
    });

    it('readImpersonationClaim reads the claim from an impersonation token', () => {
      const { accessToken } = service.mintImpersonationAccessToken({
        targetUserId: 'target-1',
        actorUserId: 'operator-1',
        schoolId: 'school_a',
      });
      expect(
        service.readImpersonationClaim({ headers: {}, cookies: { [ACCESS_COOKIE]: accessToken } }),
      ).toEqual({ actorUserId: 'operator-1', schoolId: 'school_a' });
    });
  });
});
