import { shouldSoftNavTourStep } from './tour-navigate';
import type { TourStep } from './tracks/types';

const baseStep = (overrides: Partial<TourStep>): TourStep => ({
  id: 'test',
  title: 'T',
  body: 'B',
  pose: 'point',
  ...overrides,
});

describe('shouldSoftNavTourStep', () => {
  it('never soft-navs (spotlight only; avoids remounts)', () => {
    expect(
      shouldSoftNavTourStep({
        open: true,
        contextualMode: false,
        phase: 'A',
        step: baseStep({ navHref: '/vocabulary' }),
        appPath: '/dashboard',
      }),
    ).toBe(false);
    expect(
      shouldSoftNavTourStep({
        open: true,
        contextualMode: false,
        phase: 'chapter',
        step: baseStep({
          navHref: '/practice',
          anchorId: 'practice-card-vocabulary',
        }),
        appPath: '/dashboard',
      }),
    ).toBe(false);
  });
});
