import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import * as jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
  generateRefreshToken,
  getJwtSecret,
  hashRefreshToken,
  setAuthCookies,
} from '../shared/auth-cookies';
import { assertAccountStatusAllowsAuth } from '../shared/auth-account-status.util';

const WEB_SESSION_USER_INCLUDE = {
  oauthAccounts: { select: { provider: true as const } },
} as const;

export type WebSessionAuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'PAUSED' | 'LEAVED' | 'BLOCKED';
  proficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  timezone: string;
  teacherId: string | null;
  passwordHash: string | null;
  oauthAccounts: Array<{ provider: 'GOOGLE' | 'FACEBOOK' | 'TELEGRAM' }>;
};

@Injectable()
export class AuthSessionService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadWebSessionUser(userId: string): Promise<WebSessionAuthUser | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: WEB_SESSION_USER_INCLUDE,
    });
  }

  private assertWebSessionUser(
    user: WebSessionAuthUser | null,
    options?: { revokeRefreshTokenId?: string },
  ): user is WebSessionAuthUser {
    if (!user) return false;
    try {
      assertAccountStatusAllowsAuth(user.status);
    } catch (error) {
      if (options?.revokeRefreshTokenId) {
        void this.prisma.authRefreshToken
          .updateMany({
            where: { id: options.revokeRefreshTokenId, revokedAt: null },
            data: { revokedAt: new Date() },
          })
          .catch(() => undefined);
      }
      throw error;
    }
    return true;
  }

  private async assertUserCanAuthenticate(
    userId: string,
    options?: { revokeRefreshTokenId?: string },
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });
    if (!user) return false;
    try {
      assertAccountStatusAllowsAuth(user.status);
    } catch (error) {
      if (options?.revokeRefreshTokenId) {
        await this.prisma.authRefreshToken
          .updateMany({
            where: { id: options.revokeRefreshTokenId, revokedAt: null },
            data: { revokedAt: new Date() },
          })
          .catch(() => undefined);
      }
      throw error;
    }
    return true;
  }

  async peekAuthenticatedUser(
    req: Pick<Request, 'headers'> & { cookies?: Record<string, string> },
  ): Promise<{ userId: string; authStrategy: 'access' | 'refresh' } | null> {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
    const access = bearer ?? req.cookies?.[ACCESS_COOKIE] ?? null;
    if (access) {
      let payload: { sub?: string } | null = null;
      try {
        payload = jwt.verify(access, getJwtSecret()) as { sub?: string };
      } catch {
        // access expired or invalid — fall through to refresh lookup
      }
      if (payload?.sub) {
        const allowed = await this.assertUserCanAuthenticate(payload.sub);
        if (!allowed) return null;
        return { userId: payload.sub, authStrategy: 'access' };
      }
    }

    const rawRefresh = req.cookies?.[REFRESH_COOKIE];
    if (!rawRefresh) return null;

    const tokenHash = hashRefreshToken(rawRefresh);
    const existing = await this.prisma.authRefreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, userId: true },
    });
    if (!existing) return null;

    const allowed = await this.assertUserCanAuthenticate(existing.userId, {
      revokeRefreshTokenId: existing.id,
    });
    if (!allowed) return null;
    return { userId: existing.userId, authStrategy: 'refresh' };
  }

  /**
   * Non-mutating session resolution for request-time web auth (one user row read).
   */
  async resolveWebRequestSessionAuth(
    req: Pick<Request, 'headers'> & { cookies?: Record<string, string> },
  ): Promise<{ authStrategy: 'access' | 'refresh'; user: WebSessionAuthUser } | null> {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
    const access = bearer ?? req.cookies?.[ACCESS_COOKIE] ?? null;
    if (access) {
      let payload: { sub?: string } | null = null;
      try {
        payload = jwt.verify(access, getJwtSecret()) as { sub?: string };
      } catch {
        // access expired or invalid — fall through to refresh lookup
      }
      if (payload?.sub) {
        const user = await this.loadWebSessionUser(payload.sub);
        if (!this.assertWebSessionUser(user)) return null;
        return { authStrategy: 'access', user };
      }
    }

    const rawRefresh = req.cookies?.[REFRESH_COOKIE];
    if (!rawRefresh) return null;

    const tokenHash = hashRefreshToken(rawRefresh);
    const existing = await this.prisma.authRefreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, userId: true },
    });
    if (!existing) return null;

    const user = await this.loadWebSessionUser(existing.userId);
    if (!this.assertWebSessionUser(user, { revokeRefreshTokenId: existing.id })) return null;
    return { authStrategy: 'refresh', user };
  }

  async rotateSessionFromRefreshToken(
    rawRefreshToken: string,
    meta: { userAgent?: string; ip?: string },
  ): Promise<{ userId: string; accessToken: string; refreshToken: string } | null> {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const existing = await this.prisma.authRefreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!existing) return null;

    const allowed = await this.assertUserCanAuthenticate(existing.userId, {
      revokeRefreshTokenId: existing.id,
    });
    if (!allowed) return null;

    await this.prisma.authRefreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = jwt.sign({ sub: existing.userId }, getJwtSecret(), {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
    const refreshToken = generateRefreshToken();
    await this.prisma.authRefreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
        userAgent: meta.userAgent?.slice(0, 256) ?? null,
        ipAddress: meta.ip?.slice(0, 64) ?? null,
      },
    });

    return { userId: existing.userId, accessToken, refreshToken };
  }

  async resolveAuthenticatedUserId(
    req: Request & { cookies?: Record<string, string> },
    res?: Response,
  ): Promise<string | null> {
    const peeked = await this.peekAuthenticatedUser(req);
    if (peeked?.authStrategy === 'access') return peeked.userId;
    if (peeked?.authStrategy !== 'refresh') return null;

    const rawRefresh = req.cookies?.[REFRESH_COOKIE];
    if (!rawRefresh) return null;
    if (!res) return peeked.userId;

    const rotated = await this.rotateSessionFromRefreshToken(rawRefresh, {
      userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
      ip: req.ip,
    });
    if (rotated) {
      setAuthCookies(res, {
        accessToken: rotated.accessToken,
        refreshToken: rotated.refreshToken,
      });
      return rotated.userId;
    }

    // Another in-flight request may have rotated this refresh token already.
    return peeked.userId;
  }
}
