import { BadRequestException } from '@nestjs/common';
import { buildFacebookAuthUrl, exchangeFacebookCode } from './facebook-oauth';

describe('facebook-oauth', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.FACEBOOK_APP_ID = 'app-id';
    process.env.FACEBOOK_APP_SECRET = 'app-secret';
    process.env.FACEBOOK_CALLBACK_URL = 'http://localhost:3000/api/auth/facebook/callback';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.FACEBOOK_APP_ID;
    delete process.env.FACEBOOK_APP_SECRET;
    delete process.env.FACEBOOK_CALLBACK_URL;
  });

  it('buildFacebookAuthUrl includes client_id and redirect_uri', () => {
    const url = buildFacebookAuthUrl();
    expect(url).toContain('facebook.com');
    expect(url).toContain('client_id=app-id');
    expect(url).toContain(encodeURIComponent('http://localhost:3000/api/auth/facebook/callback'));
  });

  it('buildFacebookAuthUrl throws when not configured', () => {
    delete process.env.FACEBOOK_APP_ID;
    expect(() => buildFacebookAuthUrl()).toThrow(BadRequestException);
  });

  it('exchangeFacebookCode returns token and profile', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'fb-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'fb-1', name: 'Test User', email: 'fb@test.com' }),
      }) as typeof fetch;

    await expect(exchangeFacebookCode('auth-code')).resolves.toEqual({
      accessToken: 'fb-token',
      profile: { id: 'fb-1', name: 'Test User', email: 'fb@test.com' },
    });
  });
});
