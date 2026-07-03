import * as crypto from 'node:crypto';
import type { Response } from 'express';

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 30;
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
/** Impersonation sessions are deliberately short-lived (ADR-009). */
export const IMPERSONATION_TOKEN_TTL_SECONDS = 60 * 15;

export const ACCESS_COOKIE = 'soenglish_at';
export const REFRESH_COOKIE = 'soenglish_rt';
/** Set when starting GET /auth/google/link; read on OAuth callback. */
export const GOOGLE_OAUTH_INTENT_COOKIE = 'soenglish_google_intent';
export const GOOGLE_OAUTH_USER_COOKIE = 'soenglish_google_uid';

export function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET env var is required');
  return secret;
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

function isProduction(): boolean {
  return process.env['NODE_ENV'] === 'production';
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

/**
 * Start impersonation by overwriting ONLY the short-lived access cookie with the
 * impersonation token. The operator's refresh cookie is left untouched, so the
 * session auto-returns to the operator when the impersonation token expires (or
 * immediately via `clearAccessCookie`). ADR-009.
 */
export function setImpersonationAccessCookie(res: Response, accessToken: string): void {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...cookieOptions(),
    maxAge: IMPERSONATION_TOKEN_TTL_SECONDS * 1000,
  });
}

/** Stop impersonation: drop the access cookie so the operator's refresh re-issues their own session. */
export function clearAccessCookie(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, cookieOptions());
}

/**
 * Cross-app SSO (ADR-009): when the school app, platform console, and API live on
 * sibling subdomains in production (e.g. `app.arvilio.app`, `platform.arvilio.app`),
 * `AUTH_COOKIE_DOMAIN=.arvilio.app` makes the auth cookies shared across them so a
 * single session — including impersonation — works in every app. Unset (local dev,
 * single host) → host-only cookies, which are already shared across ports on the
 * same host (cookies ignore port).
 */
function authCookieDomain(): string | undefined {
  const domain = process.env['AUTH_COOKIE_DOMAIN']?.trim();
  return domain ? domain : undefined;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction(),
    path: '/',
    domain: authCookieDomain(),
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

export const ZOOM_OAUTH_INTENT_COOKIE = 'soenglish_zoom_intent';
export const ZOOM_OAUTH_USER_COOKIE = 'soenglish_zoom_uid';

export function setZoomLinkCookies(res: Response, userId: string): void {
  const common = cookieOptions();
  const maxAge = 10 * 60 * 1000;
  res.cookie(ZOOM_OAUTH_INTENT_COOKIE, 'link', { ...common, maxAge });
  res.cookie(ZOOM_OAUTH_USER_COOKIE, userId, { ...common, maxAge });
}

export function clearZoomOAuthCookies(res: Response): void {
  const common = cookieOptions();
  res.clearCookie(ZOOM_OAUTH_INTENT_COOKIE, common);
  res.clearCookie(ZOOM_OAUTH_USER_COOKIE, common);
}

export function readZoomLinkUserId(req: {
  cookies?: Record<string, string>;
}): string | null {
  if (req.cookies?.[ZOOM_OAUTH_INTENT_COOKIE] !== 'link') return null;
  const userId = req.cookies?.[ZOOM_OAUTH_USER_COOKIE]?.trim();
  return userId || null;
}

/**
 * ADR-008 / multi-tenant: carry the active schoolId through the OAuth round-trip
 * so the issued token targets the correct school (not just the first membership).
 * Written before the OAuth redirect, read on callback, cleared in all exit paths.
 */
export const OAUTH_SCHOOL_COOKIE = 'soenglish_oauth_school';

export function setOAuthSchoolCookie(res: Response, schoolId: string): void {
  res.cookie(OAUTH_SCHOOL_COOKIE, schoolId, { ...cookieOptions(), maxAge: 10 * 60 * 1000 });
}

export function clearOAuthSchoolCookie(res: Response): void {
  res.clearCookie(OAUTH_SCHOOL_COOKIE, cookieOptions());
}

export function readOAuthSchoolId(req: { cookies?: Record<string, string> }): string | null {
  const val = req.cookies?.[OAUTH_SCHOOL_COOKIE]?.trim();
  return val || null;
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
