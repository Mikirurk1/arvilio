import { resolveProductCtaUrl } from './cta';

describe('resolveProductCtaUrl', () => {
  const prevCampus = process.env.NEXT_PUBLIC_CAMPUS_URL;
  const prevConnect = process.env.NEXT_PUBLIC_CONNECT_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_CAMPUS_URL = prevCampus;
    process.env.NEXT_PUBLIC_CONNECT_URL = prevConnect;
  });

  it('builds Campus CTA with UTM defaults', () => {
    process.env.NEXT_PUBLIC_CAMPUS_URL = 'http://localhost:4200';
    const url = resolveProductCtaUrl({
      ctaBaseEnv: 'campus',
      ctaPath: '/login',
      locale: 'uk',
    });
    expect(url).toContain('http://localhost:4200/login');
    expect(url).toContain('utm_source=arvilio_hub');
    expect(url).toContain('lang=uk');
  });

  it('returns null for Connect when env missing', () => {
    delete process.env.NEXT_PUBLIC_CONNECT_URL;
    expect(
      resolveProductCtaUrl({ ctaBaseEnv: 'connect', ctaPath: '/' }),
    ).toBeNull();
  });
});
