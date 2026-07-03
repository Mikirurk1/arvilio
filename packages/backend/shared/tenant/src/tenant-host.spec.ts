import { HostSchoolResolver, normalizeTenantHost } from './tenant-host';

describe('normalizeTenantHost', () => {
  it('lowercases and strips the port', () => {
    expect(normalizeTenantHost('Acme.Arvilio.App:3000')).toBe('acme.arvilio.app');
  });

  it('keeps custom domains intact', () => {
    expect(normalizeTenantHost('school.example.com')).toBe('school.example.com');
  });

  it('strips a trailing FQDN dot', () => {
    expect(normalizeTenantHost('acme.arvilio.app.')).toBe('acme.arvilio.app');
  });

  it('returns null for empty / missing hosts', () => {
    expect(normalizeTenantHost(undefined)).toBeNull();
    expect(normalizeTenantHost(null)).toBeNull();
    expect(normalizeTenantHost('   ')).toBeNull();
  });

  it('returns null for localhost and loopback', () => {
    expect(normalizeTenantHost('localhost')).toBeNull();
    expect(normalizeTenantHost('localhost:3000')).toBeNull();
    expect(normalizeTenantHost('127.0.0.1')).toBeNull();
    expect(normalizeTenantHost('[::1]')).toBeNull();
    expect(normalizeTenantHost('[::1]:8080')).toBeNull();
  });

  it('returns null for IPv4 literals', () => {
    expect(normalizeTenantHost('192.168.1.10')).toBeNull();
    expect(normalizeTenantHost('10.0.0.5:443')).toBeNull();
  });
});

describe('HostSchoolResolver', () => {
  it('caches hits without re-calling the loader within TTL', async () => {
    const loader = jest.fn().mockResolvedValue('school_a');
    const resolver = new HostSchoolResolver(loader, () => 1000, 60_000);
    expect(await resolver.resolve('acme.arvilio.app')).toBe('school_a');
    expect(await resolver.resolve('acme.arvilio.app')).toBe('school_a');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('caches misses (negative caching)', async () => {
    const loader = jest.fn().mockResolvedValue(null);
    const resolver = new HostSchoolResolver(loader, () => 1000, 60_000);
    expect(await resolver.resolve('nope.example.com')).toBeNull();
    expect(await resolver.resolve('nope.example.com')).toBeNull();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('re-loads after the TTL expires', async () => {
    const loader = jest
      .fn()
      .mockResolvedValueOnce('school_a')
      .mockResolvedValueOnce('school_b');
    let now = 1000;
    const resolver = new HostSchoolResolver(loader, () => now, 60_000);
    expect(await resolver.resolve('acme.arvilio.app')).toBe('school_a');
    now += 60_001;
    expect(await resolver.resolve('acme.arvilio.app')).toBe('school_b');
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('keeps distinct hosts independent', async () => {
    const loader = jest.fn(async (host: string) => (host === 'a.app' ? 'school_a' : 'school_b'));
    const resolver = new HostSchoolResolver(loader, () => 1000, 60_000);
    expect(await resolver.resolve('a.app')).toBe('school_a');
    expect(await resolver.resolve('b.app')).toBe('school_b');
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
