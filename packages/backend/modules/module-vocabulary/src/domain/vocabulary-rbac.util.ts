import { ForbiddenException } from '@nestjs/common';

export function assertStaffCanDeleteVocabularyCards(actorRole: string | undefined): void {
  if (!actorRole || actorRole === 'STUDENT') {
    throw new ForbiddenException('Students cannot delete vocabulary cards');
  }
}

export function vocabularyOverviewFromCounts(
  total: number,
  mastered: number,
  dueRowCount: number,
): { totalWords: number; masteredWords: number; dueToday: number } {
  return { totalWords: total, masteredWords: mastered, dueToday: dueRowCount };
}
