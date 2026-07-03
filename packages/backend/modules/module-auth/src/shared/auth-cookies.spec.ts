import {
  ACCESS_COOKIE,
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

describe('auth-cookies', () => {
  it('hashRefreshToken is deterministic', () => {
    expect(hashRefreshToken('abc')).toBe(hashRefreshToken('abc'));
    expect(hashRefreshToken('abc')).not.toBe(hashRefreshToken('xyz'));
  });

  it('setAuthCookies sets access and refresh cookies', () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    setAuthCookies(res as never, { accessToken: 'at', refreshToken: 'rt' });
    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_COOKIE,
      'at',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE,
      'rt',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('omits cookie domain by default (host-only)', () => {
    delete process.env.AUTH_COOKIE_DOMAIN;
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    setAuthCookies(res as never, { accessToken: 'at', refreshToken: 'rt' });
    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_COOKIE,
      'at',
      expect.objectContaining({ domain: undefined }),
    );
  });

  it('applies AUTH_COOKIE_DOMAIN for cross-subdomain SSO', () => {
    process.env.AUTH_COOKIE_DOMAIN = '.arvilio.app';
    try {
      const res = { cookie: jest.fn(), clearCookie: jest.fn() };
      setAuthCookies(res as never, { accessToken: 'at', refreshToken: 'rt' });
      expect(res.cookie).toHaveBeenCalledWith(
        ACCESS_COOKIE,
        'at',
        expect.objectContaining({ domain: '.arvilio.app' }),
      );
    } finally {
      delete process.env.AUTH_COOKIE_DOMAIN;
    }
  });

  it('clearAuthCookies clears both cookies', () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    clearAuthCookies(res as never);
    expect(res.clearCookie).toHaveBeenCalledWith(ACCESS_COOKIE, expect.any(Object));
    expect(res.clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE, expect.any(Object));
  });

  it('readGoogleLinkUserId returns user id when intent is link', () => {
    expect(
      readGoogleLinkUserId({
        cookies: { soenglish_google_intent: 'link', soenglish_google_uid: 'user-1' },
      }),
    ).toBe('user-1');
    expect(readGoogleLinkUserId({ cookies: {} })).toBeNull();
  });

  it('setGoogleLinkCookies sets intent cookies', () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    setGoogleLinkCookies(res as never, 'uid-1');
    expect(res.cookie).toHaveBeenCalled();
  });

  it('readFacebookLinkUserId and setFacebookLinkCookies', () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    setFacebookLinkCookies(res as never, 'uid-2');
    expect(
      readFacebookLinkUserId({
        cookies: { soenglish_facebook_intent: 'link', soenglish_facebook_uid: 'uid-2' },
      }),
    ).toBe('uid-2');
  });

  it('generateRefreshToken returns unique hex strings', () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).toMatch(/^[a-f0-9]+$/);
    expect(a).not.toBe(b);
  });

  it('getJwtSecret throws when JWT_SECRET is not set', () => {
    const prev = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow('JWT_SECRET env var is required');
    process.env.JWT_SECRET = prev;
  });

  it('setAuthCookies uses secure flag in production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    setAuthCookies(res as never, { accessToken: 'at', refreshToken: 'rt' });
    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_COOKIE,
      'at',
      expect.objectContaining({
        secure: true,
        maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
      }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE,
      'rt',
      expect.objectContaining({ maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000 }),
    );
    process.env.NODE_ENV = prev;
  });

  it('clearGoogleOAuthCookies clears intent cookies', () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    clearGoogleOAuthCookies(res as never);
    expect(res.clearCookie).toHaveBeenCalledTimes(2);
  });

  it('clearFacebookOAuthCookies clears intent cookies', () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    clearFacebookOAuthCookies(res as never);
    expect(res.clearCookie).toHaveBeenCalledTimes(2);
  });

  it('readGoogleLinkUserId returns null when uid cookie empty', () => {
    expect(
      readGoogleLinkUserId({
        cookies: { soenglish_google_intent: 'link', soenglish_google_uid: '  ' },
      }),
    ).toBeNull();
  });
});
