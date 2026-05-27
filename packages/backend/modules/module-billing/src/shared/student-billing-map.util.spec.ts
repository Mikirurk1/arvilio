import { DEFAULT_MIN_PACKAGE_LESSONS } from '@pkg/types';
import {
  billingModeFromDto,
  billingModeToDto,
  resolveStudentPackages,
} from './student-billing-map.util';
import { DEFAULT_PAYMENT_CONFIG } from './payment-map.util';

describe('student billing map', () => {
  it('maps billing modes', () => {
    expect(billingModeToDto('PER_LESSON')).toBe('per_lesson');
    expect(billingModeFromDto('packages')).toBe('PACKAGES');
  });

  it('returns no packages for per_lesson mode', () => {
    const result = resolveStudentPackages(
      {
        ...DEFAULT_PAYMENT_CONFIG,
        packages: [{ id: 'p1', lessons: 4, label: '4 lessons' }],
        minPackageLessons: DEFAULT_MIN_PACKAGE_LESSONS,
      },
      10000,
      false,
      'per_lesson',
      [],
    );
    expect(result).toHaveLength(0);
  });

  it('applies locked lesson count override', () => {
    const result = resolveStudentPackages(
      {
        ...DEFAULT_PAYMENT_CONFIG,
        packages: [{ id: 'p1', lessons: 4, label: '4 lessons' }],
        minPackageLessons: 3,
      },
      10000,
      false,
      'packages',
      [{ packageId: 'p1', lessons: 6, lessonsLocked: true, enabled: true }],
    );
    expect(result[0].lessons).toBe(6);
    expect(result[0].lessonsLocked).toBe(true);
    expect(result[0].amountMinor).toBe(60000);
  });

  it('excludes disabled packages', () => {
    const result = resolveStudentPackages(
      {
        ...DEFAULT_PAYMENT_CONFIG,
        packages: [{ id: 'p1', lessons: 4, label: '4 lessons' }],
        minPackageLessons: 3,
      },
      10000,
      false,
      'both',
      [{ packageId: 'p1', lessons: null, lessonsLocked: false, enabled: false }],
    );
    expect(result).toHaveLength(0);
  });
});
