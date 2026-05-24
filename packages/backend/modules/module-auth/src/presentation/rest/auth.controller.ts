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
import { getTelegramWidgetConfig } from '@be/notifications/telegram';
import type { Request, Response } from 'express';
import type { AuthSessionDto, LoginRequestDto } from '@pkg/types';
import { AuthService } from '../../application/auth.service';
import { TelegramLinkService } from '../../application/telegram-link.service';
import {
  clearAuthCookies,
  clearFacebookOAuthCookies,
  clearGoogleOAuthCookies,
  readFacebookLinkUserId,
  readGoogleLinkUserId,
  REFRESH_COOKIE,
  setAuthCookies,
  setFacebookLinkCookies,
  setGoogleLinkCookies,
} from '../../shared/auth-cookies';
import { buildFacebookAuthUrl, exchangeFacebookCode } from '../../shared/facebook-oauth';
import { profileConnectionsRedirect, webOrigin } from '../../shared/oauth-link-redirect';
import { buildGoogleAuthUrl, getGoogleClient, mapUserToDto } from '../../shared/auth-user-map.util';
import type { TelegramLoginPayload } from '../../shared/telegram-auth';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/current-user';

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
