import { classifyTenantHost, normalizeHost } from './tenant-host';

// Tests assume the default ROOT_DOMAIN (arvilio.app); NEXT_PUBLIC_ROOT_DOMAIN unset.

describe('normalizeHost', () => {
  it('lowercases and strips port + trailing dot', () => {
    expect(normalizeHost('Acme.Arvilio.App:3000')).toBe('acme.arvilio.app');
    expect(normalizeHost('acme.arvilio.app.')).toBe('acme.arvilio.app');
  });
  it('returns null for empty', () => {
    expect(normalizeHost('')).toBeNull();
    expect(normalizeHost(undefined)).toBeNull();
  });
});

describe('classifyTenantHost', () => {
  it('treats apex and www as platform', () => {
    expect(classifyTenantHost('arvilio.app')).toEqual({ kind: 'platform' });
    expect(classifyTenantHost('www.arvilio.app')).toEqual({ kind: 'platform' });
  });

  it('treats reserved subdomains as platform', () => {
    expect(classifyTenantHost('app.arvilio.app')).toEqual({ kind: 'platform' });
    expect(classifyTenantHost('admin.arvilio.app')).toEqual({ kind: 'platform' });
    expect(classifyTenantHost('api.arvilio.app')).toEqual({ kind: 'platform' });
  });

  it('treats localhost and IPs as platform (dev)', () => {
    expect(classifyTenantHost('localhost:3000')).toEqual({ kind: 'platform' });
    expect(classifyTenantHost('127.0.0.1')).toEqual({ kind: 'platform' });
  });

  it('extracts a single-label tenant subdomain', () => {
    expect(classifyTenantHost('acme.arvilio.app')).toEqual({ kind: 'subdomain', slug: 'acme' });
    expect(classifyTenantHost('ACME.Arvilio.App:443')).toEqual({ kind: 'subdomain', slug: 'acme' });
  });

  it('does not treat multi-label subdomains as a tenant', () => {
    expect(classifyTenantHost('a.b.arvilio.app')).toEqual({ kind: 'platform' });
  });

  it('treats any other hostname as a custom domain', () => {
    expect(classifyTenantHost('school.example.com')).toEqual({
      kind: 'custom',
      hostname: 'school.example.com',
    });
  });

  it('returns platform for empty host', () => {
    expect(classifyTenantHost(null)).toEqual({ kind: 'platform' });
  });
});
