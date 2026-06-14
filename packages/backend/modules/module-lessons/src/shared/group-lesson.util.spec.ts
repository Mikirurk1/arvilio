import { BadRequestException } from '@nestjs/common';
import { GROUP_LESSONS_FEATURE_DISABLED_MESSAGE } from '@pkg/types';
import { assertGroupLessonsEnabledForSchool } from './group-lesson.util';

describe('group-lesson.util', () => {
  describe('assertGroupLessonsEnabledForSchool', () => {
    it('allows requests when group lessons are enabled', () => {
      expect(() =>
        assertGroupLessonsEnabledForSchool({
          groupLessons: {
            enabled: true,
            defaultBillingMode: 'per_member',
            defaultPriceMinor: 0,
            defaultCurrency: 'UAH',
            defaultSplitMode: 'equal_split',
          },
        }),
      ).not.toThrow();
    });

    it('rejects requests when group lessons are disabled', () => {
      expect(() => assertGroupLessonsEnabledForSchool({})).toThrow(BadRequestException);
      expect(() => assertGroupLessonsEnabledForSchool({ groupLessons: { enabled: false } as never })).toThrow(
        GROUP_LESSONS_FEATURE_DISABLED_MESSAGE,
      );
    });
  });
});
