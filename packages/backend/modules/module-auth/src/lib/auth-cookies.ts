import * as crypto from 'node:crypto';
import type { Response } from 'express';

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 30;
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

export const ACCESS_COOKIE = 'soenglish_at';
export const REFRESH_COOKIE = 'soenglish_rt';
/** Set when starting GET /auth/google/link; read on OAuth callback. */
export const GOOGLE_OAUTH_INTENT_COOKIE = 'soenglish_google_intent';
export const GOOGLE_OAUTH_USER_COOKIE = 'soenglish_google_uid';

export function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? 'soenglish-dev-secret';
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }): void {
  const common = cookieOptions();
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...common,
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...common,
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  const common = cookieOptions();
  res.clearCookie(ACCESS_COOKIE, common);
  res.clearCookie(REFRESH_COOKIE, common);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction(),
    path: '/',
  };
}

export function setGoogleLinkCookies(res: Response, userId: string): void {
  const common = cookieOptions();
  const maxAge = 10 * 60 * 1000;
  res.cookie(GOOGLE_OAUTH_INTENT_COOKIE, 'link', { ...common, maxAge });
  res.cookie(GOOGLE_OAUTH_USER_COOKIE, userId, { ...common, maxAge });
}

export function clearGoogleOAuthCookies(res: Response): void {
  const common = cookieOptions();
  res.clearCookie(GOOGLE_OAUTH_INTENT_COOKIE, common);
  res.clearCookie(GOOGLE_OAUTH_USER_COOKIE, common);
}

export function readGoogleLinkUserId(req: {
  cookies?: Record<string, string>;
}): string | null {
  if (req.cookies?.[GOOGLE_OAUTH_INTENT_COOKIE] !== 'link') return null;
  const userId = req.cookies?.[GOOGLE_OAUTH_USER_COOKIE]?.trim();
  return userId || null;
}

export const FACEBOOK_OAUTH_INTENT_COOKIE = 'soenglish_facebook_intent';
export const FACEBOOK_OAUTH_USER_COOKIE = 'soenglish_facebook_uid';

export function setFacebookLinkCookies(res: Response, userId: string): void {
  const common = cookieOptions();
  const maxAge = 10 * 60 * 1000;
  res.cookie(FACEBOOK_OAUTH_INTENT_COOKIE, 'link', { ...common, maxAge });
  res.cookie(FACEBOOK_OAUTH_USER_COOKIE, userId, { ...common, maxAge });
}

export function clearFacebookOAuthCookies(res: Response): void {
  const common = cookieOptions();
  res.clearCookie(FACEBOOK_OAUTH_INTENT_COOKIE, common);
  res.clearCookie(FACEBOOK_OAUTH_USER_COOKIE, common);
}

export function readFacebookLinkUserId(req: {
  cookies?: Record<string, string>;
}): string | null {
  if (req.cookies?.[FACEBOOK_OAUTH_INTENT_COOKIE] !== 'link') return null;
  const userId = req.cookies?.[FACEBOOK_OAUTH_USER_COOKIE]?.trim();
  return userId || null;
}
