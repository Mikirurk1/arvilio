import { BREAKPOINTS, MOBILE_MAX_WIDTH, tierFromWidth } from './breakpoints';

describe('breakpoints', () => {
  it('MOBILE_MAX_WIDTH is below sm breakpoint', () => {
    expect(MOBILE_MAX_WIDTH).toBe(BREAKPOINTS.sm - 1);
  });

  it('tierFromWidth classifies viewports', () => {
    expect(tierFromWidth(400)).toBe('mobile');
    expect(tierFromWidth(900)).toBe('tablet');
    expect(tierFromWidth(1300)).toBe('desktop');
  });
});
