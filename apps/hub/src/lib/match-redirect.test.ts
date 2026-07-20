import { matchRedirect } from './match-redirect';
import type { RedirectMatch } from './match-redirect';

function redirect(partial: Partial<RedirectMatch> & Pick<RedirectMatch, 'fromPath'>): RedirectMatch {
  return {
    fromPath: partial.fromPath,
    toPath: partial.toPath ?? null,
    toUrl: partial.toUrl ?? null,
    statusCode: partial.statusCode ?? '301',
    enabled: partial.enabled ?? true,
  };
}

describe('matchRedirect', () => {
  const list = [
    redirect({ fromPath: '/home', toPath: '/' }),
    redirect({ fromPath: '/products/campus', toPath: '/campus' }),
    redirect({ fromPath: '/uk/legacy', toPath: '/pricing' }),
  ];

  it('matches exact pathname', () => {
    expect(matchRedirect('/home', list)?.toPath).toBe('/');
  });

  it('matches locale-prefixed path against bare fromPath', () => {
    expect(matchRedirect('/en/home', list)?.toPath).toBe('/');
    expect(matchRedirect('/uk/products/campus', list)?.toPath).toBe('/campus');
  });

  it('matches locale-specific fromPath', () => {
    expect(matchRedirect('/uk/legacy', list)?.toPath).toBe('/pricing');
  });

  it('returns null when no match', () => {
    expect(matchRedirect('/en/pricing', list)).toBeNull();
  });
});
