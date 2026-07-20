/**
 * Unit tests for the throttle tracker key derivation (G13).
 * Mirrors apps/api/src/app/throttle-tracker.ts (kept in sync manually —
 * apps/api owns the runtime copy).
 */

const ACCESS_COOKIE_NAME = 'arvilio_at';

function resolveThrottleKey(
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

function readAccessCookie(
  cookies: Record<string, string> | undefined,
  cookieHeader: string | undefined,
): string | undefined {
  const fromParsed = cookies?.[ACCESS_COOKIE_NAME]?.trim();
  if (fromParsed) return fromParsed;
  if (!cookieHeader) return undefined;
  const match = new RegExp(`(?:^|;\\s*)${ACCESS_COOKIE_NAME}=([^;]*)`).exec(cookieHeader);
  if (!match?.[1]) return undefined;
  try {
    return decodeURIComponent(match[1].trim());
  } catch {
    return match[1].trim();
  }
}

function jwt(payload: Record<string, unknown>): string {
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${b64}.sig`;
}

describe('resolveThrottleKey', () => {
  it('returns IP when no Authorization header and no cookie', () => {
    expect(resolveThrottleKey('1.2.3.4', undefined)).toBe('1.2.3.4');
  });

  it('returns IP when header is not Bearer', () => {
    expect(resolveThrottleKey('1.2.3.4', 'Basic abc')).toBe('1.2.3.4');
  });

  it('uses schoolId (sid) from Bearer when present', () => {
    expect(resolveThrottleKey('1.2.3.4', `Bearer ${jwt({ sub: 'u1', sid: 'school-1' })}`)).toBe(
      'school-1',
    );
  });

  it('uses schoolId from access cookie (web cookie sessions)', () => {
    expect(
      resolveThrottleKey('1.2.3.4', undefined, jwt({ sub: 'u1', sid: 'school-1' })),
    ).toBe('school-1');
  });

  it('prefers Bearer over cookie', () => {
    expect(
      resolveThrottleKey(
        '1.2.3.4',
        `Bearer ${jwt({ sub: 'u1', sid: 'from-bearer' })}`,
        jwt({ sub: 'u1', sid: 'from-cookie' }),
      ),
    ).toBe('from-bearer');
  });

  it('falls back to userId (sub) when sid absent', () => {
    expect(resolveThrottleKey('1.2.3.4', `Bearer ${jwt({ sub: 'u1' })}`)).toBe('u1');
  });

  it('falls back to IP on malformed JWT payload', () => {
    expect(resolveThrottleKey('10.0.0.1', 'Bearer bad.!!!.token')).toBe('10.0.0.1');
  });

  it('falls back to IP on JWT with fewer than 3 parts', () => {
    expect(resolveThrottleKey('10.0.0.1', 'Bearer onlyone')).toBe('10.0.0.1');
  });
});

describe('readAccessCookie', () => {
  it('reads parsed cookies first', () => {
    expect(readAccessCookie({ [ACCESS_COOKIE_NAME]: 'tok' }, `${ACCESS_COOKIE_NAME}=other`)).toBe(
      'tok',
    );
  });

  it('parses Cookie header when cookies object missing', () => {
    expect(
      readAccessCookie(undefined, `foo=1; ${ACCESS_COOKIE_NAME}=abc.def.ghi; bar=2`),
    ).toBe('abc.def.ghi');
  });
});
