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
      {
        individualPricePerLessonMinor: 10000,
        individualIsCustomPrice: false,
        groupPricePerLessonMinor: 4000,
        groupIsCustomPrice: false,
      },
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
      {
        individualPricePerLessonMinor: 10000,
        individualIsCustomPrice: true,
        groupPricePerLessonMinor: 4000,
        groupIsCustomPrice: false,
      },
      'packages',
      [{ packageId: 'p1', lessons: 6, lessonsLocked: true, enabled: true }],
    );
    expect(result[0].lessons).toBe(6);
    expect(result[0].lessonsLocked).toBe(true);
    expect(result[0].amountMinor).toBe(60000);
    expect(result[0].creditTrack).toBe('individual');
  });

  it('excludes disabled packages', () => {
    const result = resolveStudentPackages(
      {
        ...DEFAULT_PAYMENT_CONFIG,
        packages: [{ id: 'p1', lessons: 4, label: '4 lessons' }],
        minPackageLessons: 3,
      },
      {
        individualPricePerLessonMinor: 10000,
        individualIsCustomPrice: false,
        groupPricePerLessonMinor: 4000,
        groupIsCustomPrice: false,
      },
      'both',
      [{ packageId: 'p1', lessons: null, lessonsLocked: false, enabled: false }],
    );
    expect(result).toHaveLength(0);
  });

  it('uses group default price for group credit packages', () => {
    const result = resolveStudentPackages(
      {
        ...DEFAULT_PAYMENT_CONFIG,
        groupLessons: {
          enabled: true,
          defaultBillingMode: 'per_member',
          defaultPriceMinor: 3500,
          defaultCurrency: 'UAH',
          defaultSplitMode: 'equal_split',
        },
        packages: [{ id: 'g1', lessons: 5, label: '5 group lessons', creditTrack: 'group' }],
        minPackageLessons: 3,
      },
      {
        individualPricePerLessonMinor: 10000,
        individualIsCustomPrice: false,
        groupPricePerLessonMinor: 3500,
        groupIsCustomPrice: false,
      },
      'both',
      [],
    );
    expect(result[0]?.creditTrack).toBe('group');
    expect(result[0]?.amountMinor).toBe(17500);
  });
});
