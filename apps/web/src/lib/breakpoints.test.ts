import { BREAKPOINTS, MOBILE_MAX_WIDTH, tierFromWidth } from './breakpoints';

describe('breakpoints', () => {
  it('MOBILE_MAX_WIDTH matches sm breakpoint (aligns with respond-to(sm))', () => {
    expect(MOBILE_MAX_WIDTH).toBe(BREAKPOINTS.sm);
  });

  it('tierFromWidth classifies viewports', () => {
    expect(tierFromWidth(400)).toBe('mobile');
    expect(tierFromWidth(768)).toBe('mobile');
    expect(tierFromWidth(900)).toBe('tablet');
    expect(tierFromWidth(1300)).toBe('desktop');
  });
});
