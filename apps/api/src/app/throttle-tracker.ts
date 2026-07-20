/**
 * Derive the rate-limit tracker key from a request (G13).
 *
 * Priority: schoolId (sid claim) → userId (sub claim) → IP.
 * Accepts Bearer Authorization **or** httpOnly access cookies (`arvilio_pat`
 * preferred, then Campus `arvilio_at`) — the web apps use cookie sessions, so
 * Bearer-only tracking bucketed every localhost user onto one IP and burned the
 * global limit during normal SPA nav.
 *
 * Decodes the JWT without verifying — the key is used only for bucketing;
 * AuthGuard handles actual verification earlier in the pipeline.
 */
export const ACCESS_COOKIE_NAME = 'arvilio_at';
export const PLATFORM_ACCESS_COOKIE_NAME = 'arvilio_pat';

export function resolveThrottleKey(
  ip: string,
  authHeader: string | undefined,
  accessCookie?: string | null,
): string {
  const token = bearerToken(authHeader) ?? accessCookie?.trim() ?? null;
  if (!token) return ip;
  const parts = token.split('.');
  if (parts.length < 3) return ip;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8'),
    ) as { sub?: string; sid?: string };
    return payload.sid ?? payload.sub ?? ip;
  } catch {
    return ip;
  }
}

function bearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

function readNamedCookie(
  name: string,
  cookies: Record<string, string> | undefined,
  cookieHeader: string | undefined,
): string | undefined {
  const fromParsed = cookies?.[name]?.trim();
  if (fromParsed) return fromParsed;
  if (!cookieHeader) return undefined;
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(cookieHeader);
  if (!match?.[1]) return undefined;
  try {
    return decodeURIComponent(match[1].trim());
  } catch {
    return match[1].trim();
  }
}

/** Prefer Control Plane `arvilio_pat`, then Campus `arvilio_at`. */
export function readAccessCookie(
  cookies: Record<string, string> | undefined,
  cookieHeader: string | undefined,
): string | undefined {
  return (
    readNamedCookie(PLATFORM_ACCESS_COOKIE_NAME, cookies, cookieHeader) ??
    readNamedCookie(ACCESS_COOKIE_NAME, cookies, cookieHeader)
  );
}
