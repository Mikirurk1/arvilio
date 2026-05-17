import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Global,
  Injectable,
  Module,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PrismaModule, PrismaService } from '@soenglish/data-access-prisma';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import type { Request, Response } from 'express';
import type {
  AuthSessionDto,
  AuthUserDto,
  LoginRequestDto,
} from '@soenglish/shared-types';
import { CurrentUser } from './current-user';
import { AuthGuard, OptionalAuthGuard } from './auth.guard';
import { GqlAuthGuard } from './gql-auth.guard';
import { generateTemporaryPassword, MailModule, MailService } from '@soenglish/module-mail';
import type { CreateAdminUserRequestDto } from '@soenglish/shared-types';
import { DailyGoalsService } from './daily-goals.service';
import { DashboardService } from './dashboard.service';
import { PracticeSessionsService } from './practice-sessions.service';
import { LanguagesService } from './languages.service';
import { StudentsAdminService } from './students-admin.service';
import { UsersService } from './users.service';
import { AuthSessionService } from './auth-session.service';
import type { UpdateAdminStudentRequestDto } from '@soenglish/shared-types';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
  clearAuthCookies,
  clearFacebookOAuthCookies,
  clearGoogleOAuthCookies,
  generateRefreshToken,
  getJwtSecret,
  hashRefreshToken,
  readFacebookLinkUserId,
  readGoogleLinkUserId,
  setAuthCookies,
  setFacebookLinkCookies,
  setGoogleLinkCookies,
} from './auth-cookies';
import { buildFacebookAuthUrl, exchangeFacebookCode } from './facebook-oauth';
import { profileConnectionsRedirect, webOrigin } from './oauth-link-redirect';
import { getTelegramWidgetConfig } from '@soenglish/module-notifications/telegram';
import { deleteAdminUserAccount } from './delete-admin-user';
import { linkTelegramAccount } from './link-telegram-account';
import { TelegramLinkService } from './telegram-link.service';
import {
  verifyTelegramLogin,
  type TelegramLoginPayload,
} from './telegram-auth';

function getGoogleClient(): OAuth2Client | null {
  const clientId = process.env['GOOGLE_CLIENT_ID'];
  const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];
  const callbackUrl =
    process.env['GOOGLE_CALLBACK_URL'] ?? 'http://localhost:3000/api/auth/google/callback';
  if (!clientId || !clientSecret) return null;
  return new OAuth2Client({ clientId, clientSecret, redirectUri: callbackUrl });
}

const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar.events',
];

function buildGoogleAuthUrl(): string {
  const client = getGoogleClient();
  if (!client) {
    throw new BadRequestException('Google OAuth is not configured on the server');
  }
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_OAUTH_SCOPES,
  });
}

type UserRoleName = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

function mapUserToDto(user: {
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
  oauthAccounts?: Array<{ provider: 'GOOGLE' | 'FACEBOOK' | 'TELEGRAM' }>;
}): AuthUserDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role.toLowerCase() as AuthUserDto['role'],
    status: user.status.toLowerCase() as AuthUserDto['status'],
    proficiencyLevel: user.proficiencyLevel ?? null,
    timezone: user.timezone,
    teacherId: user.teacherId,
    hasPassword: Boolean(user.passwordHash),
    linkedProviders: (user.oauthAccounts ?? []).map(
      (account) => account.provider.toLowerCase() as AuthUserDto['linkedProviders'][number],
    ),
  };
}

const PROFICIENCY_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const ACCOUNT_STATUSES = new Set(['ACTIVE', 'PAUSED', 'LEAVED', 'BLOCKED']);

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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly telegramLinkService: TelegramLinkService,
  ) {}

  @Post('login')
  async login(
    @Body() body: LoginRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    const user = await this.authService.login(body);
    const tokens = await this.authService.issueTokens(user.id, {
      userAgent: req.headers['user-agent'] ?? undefined,
      ip: req.ip,
    });
    setAuthCookies(res, tokens);
    return { user: mapUserToDto(user) };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    const rawRefresh = (req as Request & { cookies?: Record<string, string> }).cookies?.[REFRESH_COOKIE];
    if (!rawRefresh) throw new UnauthorizedException();
    const rotated = await this.authService.rotateSessionFromRefreshToken(rawRefresh, {
      userAgent: req.headers['user-agent'] ?? undefined,
      ip: req.ip,
    });
    if (!rotated) throw new UnauthorizedException();
    setAuthCookies(res, {
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
    });
    const user = await this.authService.getUserWithProviders(rotated.userId);
    if (!user) throw new UnauthorizedException();
    return { user: mapUserToDto(user) };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{ ok: true }> {
    const refresh = (req as Request & { cookies?: Record<string, string> }).cookies?.[REFRESH_COOKIE];
    if (refresh) {
      await this.authService.revokeRefreshToken(refresh);
    }
    clearAuthCookies(res);
    return { ok: true };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@CurrentUser() userId: string): Promise<AuthSessionDto> {
    const user = await this.authService.getUserWithProviders(userId);
    if (!user) throw new UnauthorizedException();
    return { user: mapUserToDto(user) };
  }

  @Get('google')
  google(@Res() res: Response): void {
    try {
      clearGoogleOAuthCookies(res);
      res.redirect(buildGoogleAuthUrl());
    } catch {
      res.status(500).json({ error: 'Google OAuth is not configured' });
    }
  }

  @UseGuards(AuthGuard)
  @Get('google/link')
  googleLink(@CurrentUser() userId: string, @Res() res: Response): void {
    try {
      setGoogleLinkCookies(res, userId);
      res.redirect(buildGoogleAuthUrl());
    } catch {
      res.status(500).json({ error: 'Google OAuth is not configured' });
    }
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const linkUserId = readGoogleLinkUserId(req);
    const isLinkFlow = Boolean(linkUserId);

    const client = getGoogleClient();
    if (!client || !code) {
      clearGoogleOAuthCookies(res);
      if (isLinkFlow) {
        res.redirect(profileConnectionsRedirect({ google_link_error: 'missing_code' }));
        return;
      }
      res.status(400).json({ error: 'Google OAuth callback is missing code or configuration' });
      return;
    }

    let tokens;
    let payload: { sub: string; email: string; name?: string | null; picture?: string | null };
    try {
      const tokenResponse = await client.getToken(code);
      tokens = tokenResponse.tokens;
      const idToken = tokens.id_token;
      if (!idToken) {
        throw new BadRequestException('Google did not return id_token');
      }
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env['GOOGLE_CLIENT_ID'],
      });
      const verified = ticket.getPayload();
      if (!verified?.sub || !verified.email) {
        throw new BadRequestException('Google profile is missing identifier or email');
      }
      payload = {
        sub: verified.sub,
        email: verified.email,
        name: verified.name,
        picture: verified.picture,
      };
    } catch (err) {
      clearGoogleOAuthCookies(res);
      if (isLinkFlow) {
        const message =
          err instanceof Error ? err.message : 'Google sign-in failed';
        res.redirect(profileConnectionsRedirect({ google_link_error: message.slice(0, 240) }));
        return;
      }
      throw err;
    }

    const googlePayload = {
      googleSub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      accessToken: tokens.access_token ?? null,
      refreshToken: tokens.refresh_token ?? null,
      expiryDate: tokens.expiry_date ?? null,
      scopes: tokens.scope ?? null,
    };

    if (isLinkFlow && linkUserId) {
      clearGoogleOAuthCookies(res);
      try {
        await this.authService.linkGoogleToUser(linkUserId, googlePayload);
      } catch (err) {
        const message =
          err instanceof BadRequestException || err instanceof ForbiddenException
            ? (err.message as string)
            : 'Could not link Google account';
        res.redirect(profileConnectionsRedirect({ google_link_error: message.slice(0, 240) }));
        return;
      }
      res.redirect(profileConnectionsRedirect({ google_linked: '1' }));
      return;
    }

    clearGoogleOAuthCookies(res);

    let user;
    try {
      user = await this.authService.upsertGoogleUser(googlePayload);
    } catch (err) {
      if (err instanceof ForbiddenException) {
        const redirectUrl =
          process.env['GOOGLE_FAILURE_REDIRECT'] ??
          `${webOrigin()}/login?error=no_account`;
        res.redirect(redirectUrl);
        return;
      }
      throw err;
    }
    if (!user) {
      res.status(500).json({ error: 'Failed to upsert Google user' });
      return;
    }
    const issued = await this.authService.issueTokens(user.id, {
      userAgent: req.headers['user-agent'] ?? undefined,
      ip: req.ip,
    });
    setAuthCookies(res, issued);
    const redirectUrl = process.env['GOOGLE_SUCCESS_REDIRECT'] ?? `${webOrigin()}/dashboard`;
    res.redirect(redirectUrl);
  }

  @UseGuards(AuthGuard)
  @Get('facebook/link')
  facebookLink(@CurrentUser() userId: string, @Res() res: Response): void {
    try {
      setFacebookLinkCookies(res, userId);
      res.redirect(buildFacebookAuthUrl());
    } catch {
      res.status(500).json({ error: 'Facebook OAuth is not configured' });
    }
  }

  @Get('facebook/callback')
  async facebookCallback(
    @Query('code') code: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const linkUserId = readFacebookLinkUserId(req);
    const isLinkFlow = Boolean(linkUserId);

    if (!code) {
      clearFacebookOAuthCookies(res);
      if (isLinkFlow) {
        res.redirect(profileConnectionsRedirect({ facebook_link_error: 'missing_code' }));
        return;
      }
      res.status(400).json({ error: 'Facebook OAuth callback is missing code' });
      return;
    }

    try {
      const { accessToken, profile } = await exchangeFacebookCode(code);
      if (isLinkFlow && linkUserId) {
        clearFacebookOAuthCookies(res);
        await this.authService.linkFacebookToUser(linkUserId, {
          facebookId: profile.id,
          name: profile.name ?? null,
          email: profile.email ?? null,
          accessToken,
        });
        res.redirect(profileConnectionsRedirect({ facebook_linked: '1' }));
        return;
      }
      clearFacebookOAuthCookies(res);
      res.status(400).json({
        error: 'Facebook sign-in is only available when linking from Profile → Connections',
      });
    } catch (err) {
      clearFacebookOAuthCookies(res);
      if (isLinkFlow) {
        const message =
          err instanceof BadRequestException || err instanceof ForbiddenException
            ? (err.message as string)
            : 'Could not link Facebook account';
        res.redirect(profileConnectionsRedirect({ facebook_link_error: message.slice(0, 240) }));
        return;
      }
      throw err;
    }
  }

  @Get('telegram/widget-config')
  async telegramWidgetConfig(): Promise<{
    available: boolean;
    botUsername: string | null;
    localhostWarning: boolean;
    botLinkFlow: boolean;
  }> {
    return getTelegramWidgetConfig();
  }

  @UseGuards(AuthGuard)
  @Post('telegram/link/start')
  async telegramLinkStart(@CurrentUser() userId: string): Promise<{
    code: string;
    deepLink: string;
    expiresAt: string;
  }> {
    return this.telegramLinkService.startBotLink(userId);
  }

  @UseGuards(AuthGuard)
  @Get('telegram/link/status')
  async telegramLinkStatus(
    @CurrentUser() userId: string,
    @Query('code') code: string,
  ): Promise<{ status: 'pending' | 'linked' | 'expired' | 'unknown' }> {
    if (!code?.trim()) throw new BadRequestException('code is required');
    return this.telegramLinkService.getLinkStatusForUser(userId, code.trim());
  }

  @UseGuards(AuthGuard)
  @Post('telegram/link')
  async linkTelegramFromWidget(
    @CurrentUser() userId: string,
    @Body() body: TelegramLoginPayload,
  ): Promise<{ ok: true }> {
    await this.authService.linkTelegramToUser(userId, body);
    return { ok: true };
  }
}

type CreateAccountBody = CreateAdminUserRequestDto;

@Controller('admin/users')
@UseGuards(AuthGuard)
export class AdminUsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(@CurrentUser() userId: string) {
    const actor = await this.requireAdmin(userId);
    const users = await this.prisma.user.findMany({
      where:
        actor.role === 'ADMIN'
          ? { role: { in: ['STUDENT', 'TEACHER', 'ADMIN'] } }
          : { role: { not: 'SUPER_ADMIN' } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return users.map((user) => ({
      ...user,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      createdAt: user.createdAt.toISOString(),
    }));
  }

  @Post()
  async create(@CurrentUser() userId: string, @Body() body: CreateAccountBody) {
    const actor = await this.requireAdmin(userId);
    const { user, welcomeEmailSent } = await this.authService.createUserAsAdmin(actor, body);
    return { user: mapUserToDto(user), welcomeEmailSent };
  }

  @Delete(':id')
  async remove(@CurrentUser() userId: string, @Param('id') targetId: string) {
    const actor = await this.requireAdmin(userId);
    await this.authService.deleteUserAsAdmin(actor, targetId);
    return { ok: true };
  }

  private async requireAdmin(userId: string): Promise<{ id: string; role: UserRoleName }> {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!actor) throw new UnauthorizedException();
    if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can manage accounts');
    }
    return { id: actor.id, role: actor.role };
  }
}

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('students')
  async students(@CurrentUser() userId: string) {
    return this.users.listStudents(userId);
  }

  @Get('me/profile')
  async getMyProfile(@CurrentUser() userId: string) {
    return this.users.getMyProfile(userId);
  }

  @Post('me/profile')
  async updateMyProfile(
    @CurrentUser() userId: string,
    @Body() body: import('@soenglish/shared-types').UpdateMyProfileRequestDto,
  ) {
    return this.users.updateMyProfile(userId, body);
  }

  @Post('me/password')
  async changeMyPassword(
    @CurrentUser() userId: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.users.changeMyPassword(userId, body);
  }
}

@Controller('languages')
@UseGuards(AuthGuard)
export class LanguagesController {
  constructor(private readonly languages: LanguagesService) {}

  @Get()
  list() {
    return this.languages.listActive();
  }
}

@Controller('admin/students')
@UseGuards(AuthGuard)
export class AdminStudentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentsAdmin: StudentsAdminService,
  ) {}

  @Patch(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id') studentId: string,
    @Body() body: UpdateAdminStudentRequestDto,
  ) {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!actor || (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN')) {
      throw new ForbiddenException('Only admins can update student languages');
    }
    return this.studentsAdmin.updateStudent(
      actor.role as 'ADMIN' | 'SUPER_ADMIN',
      studentId,
      body,
    );
  }
}

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  async summary(@CurrentUser() userId: string) {
    return this.dashboard.summaryFor(userId);
  }
}

@Global()
@Module({
  imports: [PrismaModule, MailModule],
  controllers: [
    AuthController,
    AdminUsersController,
    AdminStudentsController,
    LanguagesController,
    UsersController,
    DashboardController,
  ],
  providers: [
    AuthService,
    AuthSessionService,
    DashboardService,
    DailyGoalsService,
    PracticeSessionsService,
    LanguagesService,
    StudentsAdminService,
    UsersService,
    TelegramLinkService,
    AuthGuard,
    OptionalAuthGuard,
    GqlAuthGuard,
  ],
  exports: [
    AuthService,
    AuthSessionService,
    DashboardService,
    DailyGoalsService,
    PracticeSessionsService,
    LanguagesService,
    StudentsAdminService,
    UsersService,
    AuthGuard,
    OptionalAuthGuard,
    GqlAuthGuard,
    TelegramLinkService,
  ],
})
export class AuthModule {}

export { ACCESS_COOKIE, REFRESH_COOKIE } from './auth-cookies';
