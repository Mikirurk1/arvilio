/**
 * Unit tests for the throttle tracker key derivation (G13).
 * Copied logic inline so this package has no dependency on apps/api.
 */

function resolveThrottleKey(ip: string, authHeader: string | undefined): string {
  if (!authHeader?.startsWith('Bearer ')) return ip;
  const token = authHeader.slice(7);
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

function jwt(payload: Record<string, unknown>): string {
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `Bearer header.${b64}.sig`;
}

describe('resolveThrottleKey', () => {
  it('returns IP when no Authorization header', () => {
    expect(resolveThrottleKey('1.2.3.4', undefined)).toBe('1.2.3.4');
  });

  it('returns IP when header is not Bearer', () => {
    expect(resolveThrottleKey('1.2.3.4', 'Basic abc')).toBe('1.2.3.4');
  });

  it('uses schoolId (sid) when present', () => {
    expect(resolveThrottleKey('1.2.3.4', jwt({ sub: 'u1', sid: 'school-1' }))).toBe('school-1');
  });

  it('falls back to userId (sub) when sid absent', () => {
    expect(resolveThrottleKey('1.2.3.4', jwt({ sub: 'u1' }))).toBe('u1');
  });

  it('falls back to IP on malformed JWT payload', () => {
    expect(resolveThrottleKey('10.0.0.1', 'Bearer bad.!!!.token')).toBe('10.0.0.1');
  });

  it('falls back to IP on JWT with fewer than 3 parts', () => {
    expect(resolveThrottleKey('10.0.0.1', 'Bearer onlyone')).toBe('10.0.0.1');
  });
});
