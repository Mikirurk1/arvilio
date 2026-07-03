import { BadRequestException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';
import { MailService } from '@be/mail';
import { EntitlementsService } from '@be/billing/entitlements';
import type {
  CreateAdminUserRequestDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  ResetPasswordRequestDto,
  WebRequestSessionDto,
} from '@pkg/types';
import { resolveLocale } from '@pkg/types';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthSessionService } from './auth-session.service';
import { LanguagesService } from './languages.service';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  generateRefreshToken,
  getJwtSecret,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
} from '../shared/auth-cookies';
import { generateTemporaryPassword } from '@be/mail';
import { deleteAdminUserAccount } from '../infrastructure/delete-admin-user';
import { linkTelegramAccount } from '../infrastructure/link-telegram-account';
import { assertAccountStatusAllowsAuth } from '../shared/auth-account-status.util';
import { randomDisplayColor } from '../shared/display-color';
import {
  ACCOUNT_STATUSES,
  mapUserToDto,
  PROFICIENCY_LEVELS,
  type UserRoleName,
} from '../shared/auth-user-map.util';
import { verifyTelegramLogin, type TelegramLoginPayload } from '../shared/telegram-auth';

export { mapUserToDto, type UserRoleName };

const PASSWORD_RESET_TTL_MINUTES = 60;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly sessionAuth: AuthSessionService,
    private readonly mail: MailService,
    private readonly languages: LanguagesService,
    private readonly entitlements: EntitlementsService,
  ) {}

  async issueTokens(
    userId: string,
    meta: { userAgent?: string; ip?: string; preferredSchoolId?: string },
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
  }> {
    // ADR-008: embed schoolId/membershipRole/platformRole in the token so guards
    // can skip DB lookups on every request.
    // preferredSchoolId: set during OAuth login so the token targets the school
    // the user navigated from (ADR-007 cross-check). Falls back to first active membership.
    const [membership, operator] = await Promise.all([
      meta.preferredSchoolId
        ? this.sessionAuth.resolveActiveMembership(userId, meta.preferredSchoolId)
        : this.sessionAuth.resolveActiveMembership(userId),
      this.sessionAuth.resolvePlatformRole(userId),
    ]);
    const claims: Record<string, string | undefined> = { sub: userId };
    if (membership) {
      claims['schoolId'] = membership.schoolId;
      claims['membershipRole'] = membership.role;
    }
    if (operator) claims['platformRole'] = operator;
    const accessToken = jwt.sign(claims, getJwtSecret(), {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
    const refreshToken = generateRefreshToken();
    await this.prisma.authRefreshToken.create({
      data: {
        userId,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
        userAgent: meta.userAgent?.slice(0, 256) ?? null,
        ipAddress: meta.ip?.slice(0, 64) ?? null,
      },
    });
    return { accessToken, refreshToken, accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS };
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(rawToken);
    await this.prisma.authRefreshToken
      .updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }

  rotateSessionFromRefreshToken(
    rawRefreshToken: string,
    meta: { userAgent?: string; ip?: string },
  ) {
    return this.sessionAuth.rotateSessionFromRefreshToken(rawRefreshToken, meta);
  }

  async getUserWithProviders(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { oauthAccounts: { select: { provider: true } } },
    });
  }

  /**
   * Stop an impersonation session (ADR-009). Reads the `imp` claim from the
   * current access token and records `school.impersonate.stop` attributed to the
   * operator (not the impersonated user). The caller clears the access cookie so
   * the operator's own refresh re-issues their session. No-op if not impersonating.
   */
  async stopImpersonation(
    req: { headers: Record<string, string | string[] | undefined>; cookies?: Record<string, string> },
  ): Promise<{ stopped: boolean }> {
    const imp = this.sessionAuth.readImpersonationClaim(req);
    if (!imp) return { stopped: false };
    await this.prisma.platformAuditLog
      .create({
        data: {
          actorUserId: imp.actorUserId,
          action: 'school.impersonate.stop',
          targetSchoolId: imp.schoolId,
        },
      })
      .catch(() => undefined);
    return { stopped: true };
  }

  async resolveWebRequestSession(req: {
    headers: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string>;
  }): Promise<WebRequestSessionDto> {
    const resolved = await this.sessionAuth.resolveWebRequestSessionAuth(req);
    const acceptLanguage = Array.isArray(req.headers['accept-language'])
      ? req.headers['accept-language'][0]
      : (req.headers['accept-language'] ?? null);

    if (!resolved) {
      return {
        authenticated: false,
        user: null,
        authStrategy: 'anonymous',
        scope: 'school',
        availableScopes: ['school'],
        tenantKey: null,
        impersonation: null,
        trial: null,
        locale: resolveLocale({ acceptLanguage }),
      };
    }

    const schoolId = this.tenant.schoolId;
    const userDto = mapUserToDto(resolved.user);
    // Platform scope comes from the PlatformOperator axis (ADR-008), not the
    // school-level User.role.
    const [platformRole, trial, localeData] = await Promise.all([
      this.sessionAuth.resolvePlatformRole(resolved.user.id),
      this.sessionAuth.resolveTrialInfo(resolved.user.id),
      this.sessionAuth.resolveUserLocaleData(resolved.user.id, schoolId),
    ]);
    const availableScopes: WebRequestSessionDto['availableScopes'] =
      platformRole ? ['school', 'platform'] : ['school'];

    const locale = resolveLocale({
      userPreference: localeData.userLocale,
      schoolDefault: localeData.schoolLocale,
      acceptLanguage,
    });
    this.tenant.setLocale(locale);

    return {
      authenticated: true,
      user: userDto,
      authStrategy: resolved.authStrategy,
      scope: 'school',
      availableScopes,
      tenantKey: null,
      impersonation: resolved.impersonation,
      trial,
      locale,
    };
  }

  async createUserAsAdmin(
    actor: { id: string; role: UserRoleName },
    body: CreateAdminUserRequestDto,
  ): Promise<{
    user: {
      id: string;
      email: string;
      displayName: string;
      avatarUrl: string | null;
      role: UserRoleName;
      status: 'ACTIVE' | 'PAUSED' | 'LEAVED' | 'BLOCKED';
      proficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
      timezone: string;
      teacherId: string | null;
      passwordHash: string | null;
      oauthAccounts: Array<{ provider: 'GOOGLE' | 'FACEBOOK' | 'TELEGRAM' }>;
    };
    welcomeEmailSent: boolean;
  }> {
    if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create accounts');
    }
    const roleSlug = body.role ?? 'student';
    const targetRole = roleSlug.toUpperCase() as 'STUDENT' | 'TEACHER' | 'ADMIN';
    if (actor.role === 'ADMIN' && targetRole !== 'STUDENT') {
      throw new ForbiddenException('Admins can only create student accounts');
    }
    if ((targetRole as string) === 'SUPER_ADMIN') {
      throw new ForbiddenException('SUPER_ADMIN accounts can only be managed via CLI');
    }
    const email = body.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const schoolId = this.tenant.schoolId ?? DEFAULT_SCHOOL_ID;
    // Plan seat limit (Phase 5): block adding a student past the active-student cap.
    if (targetRole === 'STUDENT' && !(await this.entitlements.canAddActiveStudent(schoolId))) {
      throw new ForbiddenException(
        'Student seat limit reached for your plan — upgrade to add more students.',
      );
    }

    const displayName = body.displayName?.trim() || email.split('@')[0] || 'User';
    const timezone = body.timezone?.trim() || 'Europe/Kyiv';
    const proficiencyLevel =
      body.proficiencyLevel === undefined || body.proficiencyLevel === null
        ? null
        : body.proficiencyLevel;
    if (proficiencyLevel && !PROFICIENCY_LEVELS.has(proficiencyLevel)) {
      throw new BadRequestException('Invalid proficiency level');
    }

    const statusSlug = body.status ?? 'active';
    const status = statusSlug.toUpperCase();
    if (!ACCOUNT_STATUSES.has(status)) {
      throw new BadRequestException('Invalid account status');
    }

    let teacherId: string | null = null;
    if (body.teacherId) {
      if (targetRole !== 'STUDENT') {
        throw new BadRequestException('teacherId applies only to student accounts');
      }
      const teacher = await this.prisma.user.findUnique({
        where: { id: body.teacherId },
        select: { id: true, role: true },
      });
      const teachingRoles = new Set(['TEACHER', 'ADMIN', 'SUPER_ADMIN']);
      if (!teacher || !teachingRoles.has(teacher.role)) {
        throw new BadRequestException('Assigned teacher not found');
      }
      teacherId = teacher.id;
    }

    if (body.nativeLanguageId) {
      await this.languages.assertLanguageIds([body.nativeLanguageId]);
    }
    const plainPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role: targetRole,
        status: status as 'ACTIVE' | 'PAUSED' | 'LEAVED' | 'BLOCKED',
        timezone,
        proficiencyLevel,
        phone: body.phone === undefined ? null : this.normalizePhoneOptional(body.phone),
        telegram:
          body.telegram === undefined ? null : this.normalizeTelegramOptional(body.telegram),
        bio: body.bio === undefined ? null : this.trimOrNull(body.bio),
        nativeLanguageId:
          body.nativeLanguageId === undefined || body.nativeLanguageId === null
            ? null
            : body.nativeLanguageId,
        teacherId,
        displayColor: randomDisplayColor(),
      },
      include: { oauthAccounts: { select: { provider: true } } },
    });

    // Tenant membership (ADR-006): link the new user to the current school so the
    // tenant context resolves and seat accounting reflects them. Idempotent.
    await this.prisma.schoolMembership.upsert({
      where: { schoolId_userId: { schoolId, userId: user.id } },
      create: { schoolId, userId: user.id, role: targetRole, status: 'ACTIVE' },
      update: { role: targetRole, status: 'ACTIVE' },
    });

    if (targetRole === 'STUDENT') {
      const learningIds =
        body.learningLanguageIds?.length
          ? body.learningLanguageIds
          : [await this.languages.defaultLearningLanguageId()];
      await this.languages.assertLanguageIds(learningIds);
      const schoolId = this.tenant.schoolId ?? DEFAULT_SCHOOL_ID;
      await this.prisma.studentLearningLanguage.createMany({
        data: learningIds.map((languageId) => ({
          userId: user.id,
          languageId,
          schoolId,
        })),
      });
    }

    const loginUrl = `${process.env['WEB_ORIGIN'] ?? 'http://localhost:4200'}/login`;
    const welcomeEmailSent = await this.mail.sendWelcomeAccount({
      to: email,
      displayName,
      email,
      password: plainPassword,
      loginUrl,
    });

    return { user, welcomeEmailSent };
  }

  async requestPasswordReset(
    body: ForgotPasswordRequestDto,
    meta: { userAgent?: string; ip?: string },
  ): Promise<{ ok: true }> {
    const email = this.normalizeEmail(body.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      return { ok: true };
    }

    const rawToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(rawToken),
        expiresAt,
        requestedByIp: meta.ip?.slice(0, 64) ?? null,
        requestedByUserAgent: meta.userAgent?.slice(0, 256) ?? null,
      },
    });

    const resetUrl = `${process.env['WEB_ORIGIN'] ?? 'http://localhost:4200'}/reset-password?token=${encodeURIComponent(rawToken)}`;
    // Best-effort email: the reset token is already persisted, so a transient
    // mail/render/SMTP failure must not 500 the request (nor leak that the email
    // exists). Log and continue — the user can retry.
    try {
      await this.mail.sendPasswordReset({
        to: email,
        displayName: user.displayName,
        resetUrl,
        expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
      });
    } catch (error) {
      this.logger.warn(`Password-reset email failed to send: ${String(error)}`);
    }

    return { ok: true };
  }

  async verifyEmail(token: string): Promise<{ ok: true }> {
    if (!token) throw new BadRequestException('Verification token is required');
    const user = await this.prisma.user.findUnique({
      where: { emailVerifyToken: token },
      select: { id: true },
    });
    if (!user) throw new BadRequestException('Invalid or expired verification token');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), emailVerifyToken: null },
    });
    return { ok: true };
  }

  async resetPassword(body: ResetPasswordRequestDto): Promise<{ ok: true }> {
    const rawToken = body.token?.trim();
    if (!rawToken) {
      throw new BadRequestException('Reset token is required');
    }
    if (!body?.newPassword || body.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters');
    }

    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashRefreshToken(rawToken) },
    });
    if (!token || token.usedAt || token.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Password reset link is invalid or expired');
    }

    const revokedAt = new Date();
    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      }),
      this.prisma.authRefreshToken.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: revokedAt },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: { userId: token.userId, id: { not: token.id } },
      }),
    ]);

    return { ok: true };
  }

  private trimOrNull(value: string | null): string | null {
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed || null;
  }

  private normalizePhoneOptional(value: string | null): string | null {
    if (value === null) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length < 7 || digits.length > 15) {
      throw new BadRequestException('Phone number must contain 7–15 digits');
    }
    return `+${digits}`;
  }

  private normalizeTelegramOptional(value: string | null): string | null {
    if (value === null) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    if (!/^@[a-zA-Z0-9_]{5,32}$/.test(handle)) {
      throw new BadRequestException(
        'Telegram username must be 5–32 characters (letters, numbers, underscore)',
      );
    }
    return handle;
  }

  async login(body: LoginRequestDto) {
    const email = this.normalizeEmail(body.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { oauthAccounts: { select: { provider: true } } },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    assertAccountStatusAllowsAuth(user.status);
    return user;
  }

  async upsertGoogleUser(payload: {
    googleSub: string;
    email: string;
    name?: string | null;
    picture?: string | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    expiryDate?: number | null;
    scopes?: string | null;
  }) {
    const email = payload.email.toLowerCase();
    const existingByProvider = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: { provider: 'GOOGLE', providerAccountId: payload.googleSub },
      },
      include: {
        user: {
          include: { oauthAccounts: { select: { provider: true } } },
        },
      },
    });
    if (existingByProvider) {
      assertAccountStatusAllowsAuth(existingByProvider.user.status);
      await this.prisma.oAuthAccount.update({
        where: { id: existingByProvider.id },
        data: {
          accessToken: payload.accessToken ?? existingByProvider.accessToken,
          refreshToken: payload.refreshToken ?? existingByProvider.refreshToken,
          expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : existingByProvider.expiresAt,
          scopes: payload.scopes ?? existingByProvider.scopes,
          providerEmail: email,
        },
      });
      await this.maybeUpsertCalendarConnection(existingByProvider.userId, payload);
      return existingByProvider.user;
    }

    const existingByEmail = await this.prisma.user.findUnique({
      where: { email },
      include: { oauthAccounts: { select: { provider: true } } },
    });
    if (existingByEmail) {
      assertAccountStatusAllowsAuth(existingByEmail.status);
      await this.prisma.oAuthAccount.create({
        data: {
          userId: existingByEmail.id,
          provider: 'GOOGLE',
          providerAccountId: payload.googleSub,
          providerEmail: email,
          accessToken: payload.accessToken ?? null,
          refreshToken: payload.refreshToken ?? null,
          expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : null,
          scopes: payload.scopes ?? null,
        },
      });
      await this.maybeUpsertCalendarConnection(existingByEmail.id, payload);
      const linkedUser = await this.prisma.user.findUnique({
        where: { id: existingByEmail.id },
        include: { oauthAccounts: { select: { provider: true } } },
      });
      if (linkedUser) {
        assertAccountStatusAllowsAuth(linkedUser.status);
      }
      return linkedUser;
    }

    throw new ForbiddenException(
      'No account found for this Google email. Ask an administrator to create your account.',
    );
  }

  async linkGoogleToUser(
    userId: string,
    payload: {
      googleSub: string;
      email: string;
      accessToken?: string | null;
      refreshToken?: string | null;
      expiryDate?: number | null;
      scopes?: string | null;
    },
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const email = payload.email.trim().toLowerCase();
    if (email !== user.email.trim().toLowerCase()) {
      throw new BadRequestException(
        `Use the Google account that matches your SoEnglish email (${user.email}). You signed in as ${payload.email}.`,
      );
    }

    const ownedByOther = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: { provider: 'GOOGLE', providerAccountId: payload.googleSub },
      },
    });
    if (ownedByOther && ownedByOther.userId !== userId) {
      throw new BadRequestException('This Google account is already linked to another user.');
    }

    const existingForUser = await this.prisma.oAuthAccount.findFirst({
      where: { userId, provider: 'GOOGLE' },
    });
    if (existingForUser && existingForUser.providerAccountId !== payload.googleSub) {
      throw new BadRequestException(
        'Another Google account is already linked. Sign in with that Google account or contact support.',
      );
    }

    await this.prisma.oAuthAccount.upsert({
      where: {
        provider_providerAccountId: { provider: 'GOOGLE', providerAccountId: payload.googleSub },
      },
      create: {
        userId,
        provider: 'GOOGLE',
        providerAccountId: payload.googleSub,
        providerEmail: email,
        accessToken: payload.accessToken ?? null,
        refreshToken: payload.refreshToken ?? null,
        expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : null,
        scopes: payload.scopes ?? null,
      },
      update: {
        userId,
        providerEmail: email,
        accessToken: payload.accessToken ?? undefined,
        refreshToken: payload.refreshToken ?? undefined,
        expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : undefined,
        scopes: payload.scopes ?? undefined,
      },
    });

    await this.maybeUpsertCalendarConnection(userId, payload);
    if (!(payload.scopes ?? '').includes('calendar')) {
      throw new BadRequestException(
        'Google Calendar access was not granted. Try again and allow Calendar when Google asks.',
      );
    }
    const connection = await this.prisma.googleCalendarConnection.findUnique({ where: { userId } });
    if (!connection?.refreshToken) {
      throw new BadRequestException(
        'Google did not return a Calendar refresh token. Remove SoEnglish from your Google Account permissions, then connect again.',
      );
    }
  }

  private async upsertOAuthAccount(
    userId: string,
    provider: 'GOOGLE' | 'FACEBOOK' | 'TELEGRAM',
    providerAccountId: string,
    data: {
      providerEmail?: string | null;
      accessToken?: string | null;
      refreshToken?: string | null;
      expiresAt?: Date | null;
      scopes?: string | null;
    },
  ): Promise<void> {
    const ownedByOther = await this.prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    });
    if (ownedByOther && ownedByOther.userId !== userId) {
      throw new BadRequestException(`This ${provider.toLowerCase()} account is already linked to another user.`);
    }

    const existingForUser = await this.prisma.oAuthAccount.findFirst({
      where: { userId, provider },
    });
    if (existingForUser && existingForUser.providerAccountId !== providerAccountId) {
      throw new BadRequestException(
        `Another ${provider.toLowerCase()} account is already linked to your profile.`,
      );
    }

    await this.prisma.oAuthAccount.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      create: {
        userId,
        provider,
        providerAccountId,
        providerEmail: data.providerEmail ?? null,
        accessToken: data.accessToken ?? null,
        refreshToken: data.refreshToken ?? null,
        expiresAt: data.expiresAt ?? null,
        scopes: data.scopes ?? null,
      },
      update: {
        userId,
        providerEmail: data.providerEmail ?? undefined,
        accessToken: data.accessToken ?? undefined,
        refreshToken: data.refreshToken ?? undefined,
        expiresAt: data.expiresAt ?? undefined,
        scopes: data.scopes ?? undefined,
      },
    });
  }

  async linkFacebookToUser(
    userId: string,
    payload: { facebookId: string; name?: string | null; email?: string | null; accessToken: string },
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    await this.upsertOAuthAccount(userId, 'FACEBOOK', payload.facebookId, {
      providerEmail: payload.email?.trim().toLowerCase() ?? payload.name ?? null,
      accessToken: payload.accessToken,
    });
  }

  async linkTelegramToUser(userId: string, payload: TelegramLoginPayload): Promise<void> {
    verifyTelegramLogin(payload);
    await linkTelegramAccount(this.prisma, userId, {
      id: payload.id,
      username: payload.username,
      first_name: payload.first_name,
      last_name: payload.last_name,
    });
  }

  async deleteUserAsAdmin(actor: { id: string; role: UserRoleName }, targetId: string): Promise<void> {
    return deleteAdminUserAccount(this.prisma, actor, targetId);
  }

  private async maybeUpsertCalendarConnection(
    userId: string,
    payload: { accessToken?: string | null; refreshToken?: string | null; expiryDate?: number | null; scopes?: string | null },
  ): Promise<void> {
    const scopes = payload.scopes ?? '';
    if (!scopes.includes('calendar')) return;
    await this.prisma.googleCalendarConnection.upsert({
      where: { userId },
      update: {
        accessToken: payload.accessToken ?? null,
        refreshToken: payload.refreshToken ?? undefined,
        expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : null,
        scopes,
      },
      create: {
        userId,
        accessToken: payload.accessToken ?? null,
        refreshToken: payload.refreshToken ?? null,
        expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : null,
        scopes,
      },
    });
  }

  private normalizeEmail(value: string): string {
    const email = value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }
    return email;
  }
}
