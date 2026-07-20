import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { getTelegramWidgetConfig } from '@be/notifications/telegram';
import type { Request, Response } from 'express';
import type {
  AuthSessionDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  RegisterSchoolRequestDto,
  ResetPasswordRequestDto,
  WebRequestSessionDto,
} from '@pkg/types';
import { AuthService } from '../../application/auth.service';
import { CaptchaService } from '../../application/captcha.service';
import { SchoolSignupService } from '../../application/school-signup.service';
import { TelegramLinkService } from '../../application/telegram-link.service';
import {
  clearAccessCookie,
  clearAuthCookies,
  clearFacebookOAuthCookies,
  clearGoogleOAuthCookies,
  clearOAuthSchoolCookie,
  clearPlatformAuthCookies,
  readFacebookLinkUserId,
  readGoogleLinkUserId,
  readOAuthSchoolId,
  REFRESH_COOKIE,
  PLATFORM_REFRESH_COOKIE,
  setAuthCookies,
  setFacebookLinkCookies,
  setGoogleLinkCookies,
  setOAuthSchoolCookie,
  setPlatformAuthCookies,
} from '../../shared/auth-cookies';
import { buildFacebookAuthUrl, exchangeFacebookCode } from '../../shared/facebook-oauth';
import { profileConnectionsRedirect, webOrigin } from '../../shared/oauth-link-redirect';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';
import { buildGoogleAuthUrl, getGoogleClient, mapUserToDto } from '../../shared/auth-user-map.util';
import type { TelegramLoginPayload } from '../../shared/telegram-auth';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/current-user';
import { TenantContextService } from '@be/tenant';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captcha: CaptchaService,
    private readonly schoolSignup: SchoolSignupService,
    private readonly telegramLinkService: TelegramLinkService,
    private readonly tenant: TenantContextService,
  ) {}

  @Throttle({ global: { ttl: 900_000, limit: 10 } })
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

  /**
   * Arvilio Control Plane login — operators only. Stricter throttle than campus
   * login. No registration / OAuth / forgot-password on this surface.
   */
  @Throttle({ global: { ttl: 900_000, limit: 5 } })
  @Post('platform/login')
  async platformLogin(
    @Body() body: LoginRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    try {
      const user = await this.authService.platformLogin(body, {
        userAgent: req.headers['user-agent'] ?? undefined,
        ip: req.ip,
      });
      const tokens = await this.authService.issueTokens(user.id, {
        userAgent: req.headers['user-agent'] ?? undefined,
        ip: req.ip,
      });
      setPlatformAuthCookies(res, tokens);
      return { user: mapUserToDto(user) };
    } catch (err) {
      clearPlatformAuthCookies(res);
      throw err;
    }
  }

  /**
   * Self-serve "create your school" signup (Phase 4.5.1, G19/G28). Public, no card.
   * Provisions the school + admin + 7-day trial and auto-logs the admin in.
   */
  @Throttle({ global: { ttl: 900_000, limit: 5 } })
  @Post('register-school')
  async registerSchool(
    @Body() body: RegisterSchoolRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    const captchaOk = await this.captcha.verify(body.captchaToken, req.ip);
    if (!captchaOk) throw new BadRequestException('Captcha verification failed');
    const { userId } = await this.schoolSignup.registerSchool(body);
    const tokens = await this.authService.issueTokens(userId, {
      userAgent: req.headers['user-agent'] ?? undefined,
      ip: req.ip,
    });
    setAuthCookies(res, tokens);
    const user = await this.authService.getUserWithProviders(userId);
    if (!user) throw new UnauthorizedException();
    return { user: mapUserToDto(user) };
  }

  @Throttle({ global: { ttl: 900_000, limit: 10 } })
  @Post('forgot-password')
  async forgotPassword(
    @Body() body: ForgotPasswordRequestDto,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    return this.authService.requestPasswordReset(body, {
      userAgent: req.headers['user-agent'] ?? undefined,
      ip: req.ip,
    });
  }

  @Throttle({ global: { ttl: 900_000, limit: 10 } })
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordRequestDto): Promise<{ ok: true }> {
    return this.authService.resetPassword(body);
  }

  /** 10 verify attempts per IP per 10 minutes — prevents token enumeration (G37). */
  @Throttle({ global: { ttl: 600_000, limit: 10 } })
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string): Promise<{ ok: true }> {
    return this.authService.verifyEmail(token ?? '');
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    const rawRefresh =
      cookies?.[PLATFORM_REFRESH_COOKIE] ?? cookies?.[REFRESH_COOKIE];
    if (!rawRefresh) throw new UnauthorizedException();
    const rotated = await this.authService.rotateSessionFromRefreshToken(rawRefresh, {
      userAgent: req.headers['user-agent'] ?? undefined,
      ip: req.ip,
    });
    if (!rotated) throw new UnauthorizedException();
    const tokens = {
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
    };
    if (cookies?.[PLATFORM_REFRESH_COOKIE]) {
      setPlatformAuthCookies(res, tokens);
    } else {
      setAuthCookies(res, tokens);
    }
    const user = await this.authService.getUserWithProviders(rotated.userId);
    if (!user) throw new UnauthorizedException();
    return { user: mapUserToDto(user) };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{ ok: true }> {
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    const campusRefresh = cookies?.[REFRESH_COOKIE];
    const platformRefresh = cookies?.[PLATFORM_REFRESH_COOKIE];
    if (campusRefresh) {
      await this.authService.revokeRefreshToken(campusRefresh);
    }
    if (platformRefresh) {
      await this.authService.revokeRefreshToken(platformRefresh);
    }
    clearAuthCookies(res);
    clearPlatformAuthCookies(res);
    return { ok: true };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@CurrentUser() userId: string): Promise<AuthSessionDto> {
    const user = await this.authService.getUserWithProviders(userId);
    if (!user) throw new UnauthorizedException();
    return { user: mapUserToDto(user) };
  }

  @Get('web-session')
  async webSession(@Req() req: Request): Promise<WebRequestSessionDto> {
    return this.authService.resolveWebRequestSession(req as Request & {
      cookies?: Record<string, string>;
    });
  }

  /**
   * Stop impersonation (ADR-009). Runs while the impersonation token is the active
   * session, so it requires only AuthGuard (the impersonated user is authenticated)
   * — not the platform guard. Clears the access cookie to return to the operator.
   */
  @UseGuards(AuthGuard)
  @Post('impersonate/stop')
  async stopImpersonation(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ stopped: boolean }> {
    const result = await this.authService.stopImpersonation(
      req as Request & { cookies?: Record<string, string> },
    );
    clearAccessCookie(res);
    return result;
  }

  @Get('google')
  google(@Res() res: Response): void {
    try {
      clearGoogleOAuthCookies(res);
      // ADR-008: carry school context through the OAuth round-trip.
      const schoolId = this.tenant.schoolId;
      if (schoolId) setOAuthSchoolCookie(res, schoolId);
      else clearOAuthSchoolCookie(res);
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
    const preferredSchoolId = readOAuthSchoolId(req);

    // Clear all Google + school OAuth cookies on every exit path.
    const clearAll = () => {
      clearGoogleOAuthCookies(res);
      clearOAuthSchoolCookie(res);
    };

    const client = getGoogleClient();
    if (!client || !code) {
      clearAll();
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
        audience: getPlatformIntegrationRuntime().google.clientId ?? undefined,
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
      clearAll();
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
      clearAll();
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

    clearAll();

    let user;
    try {
      user = await this.authService.upsertGoogleUser(googlePayload);
    } catch (err) {
      if (err instanceof ForbiddenException) {
        const loginError = loginErrorParamFromException(err) ?? 'no_account';
        const redirectUrl =
          process.env['GOOGLE_FAILURE_REDIRECT'] ??
          `${webOrigin()}/login?error=${encodeURIComponent(loginError)}`;
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
      preferredSchoolId: preferredSchoolId ?? undefined,
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

function loginErrorParamFromException(error: ForbiddenException): string | null {
  const response = error.getResponse();
  if (response && typeof response === 'object') {
    const code = (response as { code?: unknown }).code;
    if (typeof code === 'string' && code.trim()) return code;
  }
  return error.message.includes('No account found') ? 'no_account' : null;
}
