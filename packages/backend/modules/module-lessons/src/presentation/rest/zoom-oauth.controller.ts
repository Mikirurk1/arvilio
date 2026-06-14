import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';
import {
  AuthGuard,
  CurrentUser,
} from '@be/auth';
import {
  clearZoomOAuthCookies,
  readZoomLinkUserId,
  setZoomLinkCookies,
} from '@be/auth';
import { ZoomService } from '../../infrastructure/zoom.service';

function buildZoomAuthUrl(): string {
  const zoom = getPlatformIntegrationRuntime().videoMeeting?.zoom;
  if (!zoom?.clientId || !zoom.callbackUrl) {
    throw new BadRequestException('Zoom OAuth is not configured');
  }
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: zoom.clientId,
    redirect_uri: zoom.callbackUrl,
  });
  return `https://zoom.us/oauth/authorize?${params.toString()}`;
}

function profileRedirect(query: Record<string, string>): string {
  const webOrigin =
    process.env['WEB_ORIGIN']?.replace(/\/$/, '') ?? 'http://localhost:4200';
  const params = new URLSearchParams(query).toString();
  return `${webOrigin}/profile?${params}`;
}

@Controller('auth/zoom')
export class ZoomOAuthController {
  constructor(private readonly zoom: ZoomService) {}

  @UseGuards(AuthGuard)
  @Get('link')
  link(@CurrentUser() userId: string, @Res() res: Response): void {
    try {
      setZoomLinkCookies(res, userId);
      res.redirect(buildZoomAuthUrl());
    } catch {
      res.status(500).json({ error: 'Zoom OAuth is not configured' });
    }
  }

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const linkUserId = readZoomLinkUserId(req as Request & {
      cookies?: Record<string, string>;
    });
    clearZoomOAuthCookies(res);
    if (!linkUserId) {
      res.redirect(
        profileRedirect({ zoom_link_error: 'missing_session' }),
      );
      return;
    }
    if (!code) {
      res.redirect(profileRedirect({ zoom_link_error: 'missing_code' }));
      return;
    }
    const zoom = getPlatformIntegrationRuntime().videoMeeting?.zoom;
    if (!zoom?.callbackUrl) {
      res.redirect(profileRedirect({ zoom_link_error: 'not_configured' }));
      return;
    }
    try {
      await this.zoom.exchangeAuthorizationCode(
        linkUserId,
        code,
        zoom.callbackUrl,
      );
      res.redirect(profileRedirect({ zoom_linked: '1' }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message.slice(0, 240) : 'zoom_link_failed';
      res.redirect(profileRedirect({ zoom_link_error: message }));
    }
  }
}
