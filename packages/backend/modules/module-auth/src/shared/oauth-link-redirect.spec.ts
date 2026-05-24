import { profileConnectionsRedirect, webOrigin } from './oauth-link-redirect';

describe('oauth-link-redirect', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('webOrigin defaults to localhost', () => {
    delete process.env.WEB_ORIGIN;
    expect(webOrigin()).toBe('http://localhost:4200');
  });

  it('profileConnectionsRedirect builds profile tab query', () => {
    process.env.WEB_ORIGIN = 'https://app.test';
    const url = profileConnectionsRedirect({ linked: 'google' });
    expect(url).toContain('/profile?');
    expect(url).toContain('tab=connections');
    expect(url).toContain('linked=google');
  });
});
