import { ForbiddenException } from '@nestjs/common';
import {
  assertStaffCanDeleteVocabularyCards,
  vocabularyOverviewFromCounts,
} from './vocabulary-rbac.util';

describe('vocabulary-rbac.util', () => {
  it('assertStaffCanDeleteVocabularyCards blocks students', () => {
    expect(() => assertStaffCanDeleteVocabularyCards('STUDENT')).toThrow(ForbiddenException);
    expect(() => assertStaffCanDeleteVocabularyCards(undefined)).toThrow(ForbiddenException);
    expect(() => assertStaffCanDeleteVocabularyCards('TEACHER')).not.toThrow();
  });

  it('vocabularyOverviewFromCounts maps prisma aggregates', () => {
    expect(vocabularyOverviewFromCounts(12, 5, 3)).toEqual({
      totalWords: 12,
      masteredWords: 5,
      dueToday: 3,
    });
  });
});
