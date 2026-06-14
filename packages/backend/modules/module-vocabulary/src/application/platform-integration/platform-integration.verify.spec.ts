import { verifyFacebookApp, verifyGoogleOAuth, verifyTelegramBot } from './platform-integration.verify';

describe('platform-integration.verify', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('verifyGoogleOAuth requires credentials', async () => {
    const result = await verifyGoogleOAuth({
      clientId: null,
      clientSecret: null,
      callbackUrl: 'http://localhost/cb',
      successRedirect: 'http://localhost',
      linkSuccessRedirect: null,
      failureRedirect: null,
    });
    expect(result.ok).toBe(false);
  });

  it('verifyGoogleOAuth accepts invalid_grant as valid client', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ error: 'invalid_grant' }),
    });
    const result = await verifyGoogleOAuth({
      clientId: 'id',
      clientSecret: 'secret',
      callbackUrl: 'http://localhost/cb',
      successRedirect: 'http://localhost',
      linkSuccessRedirect: null,
      failureRedirect: null,
    });
    expect(result.ok).toBe(true);
  });

  it('verifyFacebookApp accepts access_token', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ access_token: 'token' }),
    });
    const result = await verifyFacebookApp({
      appId: 'app',
      appSecret: 'secret',
      callbackUrl: 'http://localhost/cb',
    });
    expect(result.ok).toBe(true);
  });

  it('verifyTelegramBot validates getMe', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ ok: true, result: { username: 'school_bot' } }),
    });
    const result = await verifyTelegramBot({
      botToken: '123:abc',
      botUsername: 'school_bot',
      devPolling: false,
    });
    expect(result.ok).toBe(true);
    expect(result.message).toContain('@school_bot');
  });
});
