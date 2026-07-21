import { BadRequestException } from '@nestjs/common';
import { resetPlatformIntegrationRuntimeFromEnv } from '@be/platform-integration';
import { buildFacebookAuthUrl, exchangeFacebookCode } from './facebook-oauth';

describe('facebook-oauth', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.FACEBOOK_APP_ID = 'app-id';
    process.env.FACEBOOK_APP_SECRET = 'app-secret';
    // Callbacks must hit the Campus web origin (Next rewrite), not the Nest port.
    process.env.WEB_ORIGIN = 'http://localhost:4200';
    delete process.env.FACEBOOK_CALLBACK_URL;
    delete process.env.OAUTH_PUBLIC_BASE_URL;
    resetPlatformIntegrationRuntimeFromEnv();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.FACEBOOK_APP_ID;
    delete process.env.FACEBOOK_APP_SECRET;
    delete process.env.FACEBOOK_CALLBACK_URL;
    delete process.env.WEB_ORIGIN;
    delete process.env.OAUTH_PUBLIC_BASE_URL;
    resetPlatformIntegrationRuntimeFromEnv();
  });

  it('buildFacebookAuthUrl includes client_id and redirect_uri on web origin', () => {
    const url = buildFacebookAuthUrl();
    expect(url).toContain('facebook.com');
    expect(url).toContain('client_id=app-id');
    expect(url).toContain(
      encodeURIComponent('http://localhost:4200/api/auth/facebook/callback'),
    );
  });

  it('buildFacebookAuthUrl honors FACEBOOK_CALLBACK_URL override', () => {
    process.env.FACEBOOK_CALLBACK_URL =
      'http://localhost:3000/api/auth/facebook/callback';
    resetPlatformIntegrationRuntimeFromEnv();
    const url = buildFacebookAuthUrl();
    expect(url).toContain(
      encodeURIComponent('http://localhost:3000/api/auth/facebook/callback'),
    );
  });

  it('buildFacebookAuthUrl throws when not configured', () => {
    delete process.env.FACEBOOK_APP_ID;
    resetPlatformIntegrationRuntimeFromEnv();
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
