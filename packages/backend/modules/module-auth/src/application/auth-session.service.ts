import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import * as jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  IMPERSONATION_TOKEN_TTL_SECONDS,
  REFRESH_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
  generateRefreshToken,
  getJwtSecret,
  hashRefreshToken,
  setAuthCookies,
} from '../shared/auth-cookies';
import { assertAccountStatusAllowsAuth } from '../shared/auth-account-status.util';

/** Impersonation claim embedded in an access token (ADR-009). `act` = operator, `sid` = school. */
export interface ImpersonationClaim {
  act: string;
  sid: string;
}

export interface ImpersonationContext {
  actorUserId: string;
  schoolId: string;
}

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
  ): Promise<{
    authStrategy: 'access' | 'refresh';
    user: WebSessionAuthUser;
    impersonation: ImpersonationContext | null;
  } | null> {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
    const access = bearer ?? req.cookies?.[ACCESS_COOKIE] ?? null;
    if (access) {
      let payload: { sub?: string; imp?: ImpersonationClaim } | null = null;
      try {
        payload = jwt.verify(access, getJwtSecret()) as { sub?: string; imp?: ImpersonationClaim };
      } catch {
        // access expired or invalid — fall through to refresh lookup
      }
      if (payload?.sub) {
        const user = await this.loadWebSessionUser(payload.sub);
        if (!this.assertWebSessionUser(user)) return null;
        const impersonation = payload.imp
          ? { actorUserId: payload.imp.act, schoolId: payload.imp.sid }
          : null;
        return { authStrategy: 'access', user, impersonation };
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
    // Refresh-derived sessions are never impersonation sessions: impersonation only
    // overwrites the access cookie, leaving the operator's own refresh in place.
    return { authStrategy: 'refresh', user, impersonation: null };
  }

  /**
   * Mint a short-lived impersonation access token (ADR-009). Authenticates as the
   * target school user (`sub`) while carrying the `imp` claim so the UI can render
   * the mandatory banner and the session auto-expires back to the operator.
   */
  mintImpersonationAccessToken(params: {
    targetUserId: string;
    actorUserId: string;
    schoolId: string;
  }): { accessToken: string; expiresInSeconds: number } {
    const imp: ImpersonationClaim = { act: params.actorUserId, sid: params.schoolId };
    const accessToken = jwt.sign({ sub: params.targetUserId, imp }, getJwtSecret(), {
      expiresIn: IMPERSONATION_TOKEN_TTL_SECONDS,
    });
    return { accessToken, expiresInSeconds: IMPERSONATION_TOKEN_TTL_SECONDS };
  }

  /** Read the impersonation claim from the request's access token, or null. */
  readImpersonationClaim(
    req: Pick<Request, 'headers'> & { cookies?: Record<string, string> },
  ): ImpersonationContext | null {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
    const access = bearer ?? req.cookies?.[ACCESS_COOKIE] ?? null;
    if (!access) return null;
    try {
      const payload = jwt.verify(access, getJwtSecret()) as { imp?: ImpersonationClaim };
      return payload.imp ? { actorUserId: payload.imp.act, schoolId: payload.imp.sid } : null;
    } catch {
      return null;
    }
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

  /** ADR-008: minimal status fetch for suspension check when schoolId is in the JWT. */
  async getSchoolStatus(schoolId: string): Promise<{ status: string } | null> {
    return this.prisma.school.findUnique({ where: { id: schoolId }, select: { status: true } });
  }

  /**
   * Resolve the user's active tenant (ADR-006) for the request context.
   * Single-school today → a user has one ACTIVE membership; multi-school later
   * will choose the active one (e.g. from the JWT / host). Uses the raw client
   * intentionally: this establishes the tenant, so it must run unscoped.
   */
  async resolveActiveMembership(
    userId: string,
    preferredSchoolId?: string,
  ): Promise<{
    schoolId: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    schoolStatus: 'TRIAL' | 'ACTIVE' | 'SUSPENDED';
  } | null> {
    const where = preferredSchoolId
      ? { userId, schoolId: preferredSchoolId, status: 'ACTIVE' as const }
      : { userId, status: 'ACTIVE' as const };
    const membership = await this.prisma.schoolMembership.findFirst({
      where,
      select: { schoolId: true, role: true, school: { select: { status: true } } },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership) return null;
    return {
      schoolId: membership.schoolId,
      role: membership.role,
      schoolStatus: membership.school.status,
    };
  }

  /**
   * Trial countdown info for the user's active school (Phase 4.5.1). Returns null
   * unless the school is on a trial with a `trialEndsAt`. `daysLeft` is clamped at 0.
   */
  async resolveTrialInfo(userId: string): Promise<{ trialEndsAt: string; daysLeft: number } | null> {
    const membership = await this.prisma.schoolMembership.findFirst({
      where: { userId, status: 'ACTIVE' },
      select: { school: { select: { status: true, subscription: { select: { trialEndsAt: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership || membership.school.status !== 'TRIAL') return null;
    const end = membership.school.subscription?.trialEndsAt;
    if (!end) return null;
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    return { trialEndsAt: end.toISOString(), daysLeft };
  }

  /**
   * Resolve the user's platform-operator role (ADR-008) — the source of truth for
   * platform-console access, separate from school membership. Raw/unscoped: it
   * establishes the platform axis. Returns null for non-operators.
   */
  async resolvePlatformRole(
    userId: string,
  ): Promise<'PLATFORM_ADMIN' | 'PLATFORM_SUPPORT' | 'PLATFORM_BILLING' | null> {
    const operator = await this.prisma.platformOperator.findUnique({
      where: { userId },
      select: { role: true },
    });
    return operator?.role ?? null;
  }

  /** Fetch locale preferences for locale resolution (G33). */
  async resolveUserLocaleData(
    userId: string,
    schoolId: string | null,
  ): Promise<{ userLocale: string | null; schoolLocale: string | null }> {
    const [user, school] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { locale: true } }),
      schoolId
        ? this.prisma.school.findUnique({ where: { id: schoolId }, select: { defaultLocale: true } })
        : Promise.resolve(null),
    ]);
    return {
      userLocale: user?.locale ?? null,
      schoolLocale: school?.defaultLocale ?? null,
    };
  }
}
