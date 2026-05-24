import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { MailService } from '@be/mail';
import type { CreateAdminUserRequestDto, LoginRequestDto } from '@pkg/types';
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
import { randomDisplayColor } from '../shared/display-color';
import {
  ACCOUNT_STATUSES,
  mapUserToDto,
  PROFICIENCY_LEVELS,
  type UserRoleName,
} from '../shared/auth-user-map.util';
import { verifyTelegramLogin, type TelegramLoginPayload } from '../shared/telegram-auth';

export { mapUserToDto, type UserRoleName };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionAuth: AuthSessionService,
    private readonly mail: MailService,
    private readonly languages: LanguagesService,
  ) {}

  async issueTokens(userId: string, meta: { userAgent?: string; ip?: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
  }> {
    const accessToken = jwt.sign({ sub: userId }, getJwtSecret(), {
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

    if (targetRole === 'STUDENT') {
      const learningIds =
        body.learningLanguageIds?.length
          ? body.learningLanguageIds
          : [await this.languages.defaultLearningLanguageId()];
      await this.languages.assertLanguageIds(learningIds);
      await this.prisma.studentLearningLanguage.createMany({
        data: learningIds.map((languageId) => ({
          userId: user.id,
          languageId,
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
    const email = body.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { oauthAccounts: { select: { provider: true } } },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
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
      return this.prisma.user.findUnique({
        where: { id: existingByEmail.id },
        include: { oauthAccounts: { select: { provider: true } } },
      });
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
}
