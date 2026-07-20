import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { TenantContextService } from '@be/tenant';
import { ACCESS_COOKIE, PLATFORM_ACCESS_COOKIE, getJwtSecret } from '../../shared/auth-cookies';
import { getReqRes } from '../../shared/auth-request.util';
import { AuthSessionService } from '../../application/auth-session.service';

export interface SeededTenant {
  /** The active school is SUSPENDED (school-scoped access should be blocked). */
  suspended: boolean;
  /** The user is a platform operator (bypasses suspended-school blocking). */
  isPlatformOperator: boolean;
}

/** JWT claims embedded since ADR-008. Present on tokens issued after the reshape. */
export interface JwtTenantClaims {
  schoolId?: string;
  membershipRole?: string;
  platformRole?: string;
}

/**
 * Populate the request's tenant context from the user's active membership +
 * platform-operator axis. Returns enforcement flags so the *required* auth guard
 * can block suspended-school access while optional auth stays non-throwing.
 *
 * ADR-008: If `jwtClaims` are provided (new-shape tokens) the DB lookups for
 * membership and platformRole are skipped. School status is still fetched once
 * to enforce suspend-blocking (it can change at any time without token rotation).
 */
export async function seedTenantContext(
  sessionAuth: AuthSessionService,
  tenant: TenantContextService,
  userId: string,
  jwtClaims?: JwtTenantClaims,
): Promise<SeededTenant> {
  if (!tenant.isActive()) return { suspended: false, isPlatformOperator: false };
  tenant.setUserId(userId);

  let schoolStatus: string | null = null;

  if (jwtClaims?.schoolId && jwtClaims.membershipRole) {
    // Fast path: claims from token — skip membership DB lookup.
    tenant.setSchoolId(jwtClaims.schoolId);
    tenant.setMembershipRole(jwtClaims.membershipRole as 'STUDENT' | 'TEACHER' | 'ADMIN');
    // Still need school status to enforce suspension.
    const school = await sessionAuth.getSchoolStatus(jwtClaims.schoolId);
    schoolStatus = school?.status ?? null;
  } else {
    // Slow path: legacy tokens or no school membership yet.
    const membership = await sessionAuth.resolveActiveMembership(userId);
    if (membership) {
      tenant.setSchoolId(membership.schoolId);
      tenant.setMembershipRole(membership.role);
      schoolStatus = membership.schoolStatus;
    }
  }

  const isPlatformOperator = jwtClaims?.platformRole != null
    ? true
    : (await sessionAuth.resolvePlatformRole(userId)) !== null;
  if (jwtClaims?.platformRole) {
    tenant.setPlatformRole(jwtClaims.platformRole as 'PLATFORM_ADMIN' | 'PLATFORM_SUPPORT' | 'PLATFORM_BILLING');
  } else if (isPlatformOperator) {
    const role = await sessionAuth.resolvePlatformRole(userId);
    if (role) tenant.setPlatformRole(role);
  }

  return {
    suspended: schoolStatus === 'SUSPENDED',
    isPlatformOperator,
  };
}

export type AuthenticatedRequest = Request & {
  cookies?: Record<string, string>;
  user?: { id: string };
};

export function extractAccessToken(req: AuthenticatedRequest): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  // Prefer Control Plane cookie when both Campus + Platform cookies exist on localhost.
  return (
    req.cookies?.[PLATFORM_ACCESS_COOKIE] ||
    req.cookies?.[ACCESS_COOKIE] ||
    null
  );
}

export function verifyAccessToken(token: string): { sub: string } & JwtTenantClaims {
  const payload = jwt.verify(token, getJwtSecret()) as { sub?: string } & JwtTenantClaims;
  if (!payload?.sub) throw new UnauthorizedException();
  return {
    sub: payload.sub,
    schoolId: payload.schoolId,
    membershipRole: payload.membershipRole,
    platformRole: payload.platformRole,
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionAuth: AuthSessionService,
    private readonly tenant: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res } = getReqRes(context);
    const userId = await this.sessionAuth.resolveAuthenticatedUserId(req, res);
    if (!userId) throw new UnauthorizedException();
    req.user = { id: userId };

    // ADR-007: snapshot host-resolved schoolId (set by TenantResolutionMiddleware)
    // BEFORE seedTenantContext overwrites it with the JWT claim.
    const hostSchoolId = this.tenant.schoolId ?? null;

    // ADR-008: surface JWT claims for the fast-path in seedTenantContext.
    // Use verifyAccessToken (signature-verified) — never jwt.decode (unverified).
    const rawToken = extractAccessToken(req);
    let jwtClaims: JwtTenantClaims | undefined;
    if (rawToken) {
      try {
        const verified = verifyAccessToken(rawToken);
        if (verified.schoolId) jwtClaims = verified;
      } catch {
        // verification failed — fall back to DB path
      }
    }

    const seeded = await seedTenantContext(this.sessionAuth, this.tenant, userId, jwtClaims);

    // ADR-007: cross-check JWT.schoolId against host-resolved school.
    // Prevents a token issued for school A from being accepted on school B's domain.
    // Platform operators bypass — they manage multiple schools via the console.
    if (
      hostSchoolId &&
      jwtClaims?.schoolId &&
      hostSchoolId !== jwtClaims.schoolId &&
      !seeded.isPlatformOperator
    ) {
      throw new ForbiddenException('Token school does not match request host');
    }

    // Suspended school: block its members (platform operators bypass).
    if (seeded.suspended && !seeded.isPlatformOperator) {
      throw new ForbiddenException('This school is suspended');
    }
    return true;
  }
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly sessionAuth: AuthSessionService,
    private readonly tenant: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res } = getReqRes(context);
    const userId = await this.sessionAuth.resolveAuthenticatedUserId(req, res);
    if (userId) {
      req.user = { id: userId };
      const hostSchoolId = this.tenant.schoolId ?? null;
      const rawToken = extractAccessToken(req);
      let jwtClaims: JwtTenantClaims | undefined;
      if (rawToken) {
        try {
          const verified = verifyAccessToken(rawToken);
          if (verified.schoolId) jwtClaims = verified;
        } catch { /* fall back to DB path */ }
      }
      const seeded = await seedTenantContext(this.sessionAuth, this.tenant, userId, jwtClaims);
      // ADR-007: cross-school token on a public route → treat as unauthenticated
      // rather than blocking (page must still render for the host school).
      if (
        hostSchoolId &&
        jwtClaims?.schoolId &&
        hostSchoolId !== jwtClaims.schoolId &&
        !seeded.isPlatformOperator
      ) {
        req.user = undefined;
        this.tenant.setUserId(null);
        this.tenant.setSchoolId(hostSchoolId);
        this.tenant.setMembershipRole(null);
      }
    }
    return true;
  }
}
