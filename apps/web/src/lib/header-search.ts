import type { ScheduledLessonBackendDto, StudentSummaryBackendDto, StudentWordCardDto } from '@pkg/types';
import {
  fromBackendLessons,
  getLessonRouteId,
  hydrateLessonPartyNames,
} from '../features/lesson-modal/scheduledLessonsBackendAdapter';
import { stripHtml } from './strip-html';

export type HeaderSearchResult = {
  id: string;
  type: 'lesson' | 'student' | 'vocabulary';
  label: string;
  sublabel?: string;
  href: string;
};

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matches(text: string | undefined | null, query: string): boolean {
  if (!text || !query) return false;
  return text.toLowerCase().includes(query);
}

export function buildHeaderSearchResults(params: {
  query: string;
  lessons: ScheduledLessonBackendDto[];
  nameByNumericId: Map<number, string>;
  students: StudentSummaryBackendDto[];
  vocabularyCards: StudentWordCardDto[];
  includeStudents: boolean;
  limit?: number;
}): HeaderSearchResult[] {
  const q = normalizeQuery(params.query);
  if (!q) return [];

  const limit = params.limit ?? 8;
  const results: HeaderSearchResult[] = [];
  const hydrated = hydrateLessonPartyNames(fromBackendLessons(params.lessons), params.nameByNumericId);

  for (const lesson of hydrated) {
    if (results.length >= limit) break;
    const haystack = [lesson.title, lesson.teacherName, lesson.studentName].join(' ');
    if (!matches(haystack, q)) continue;
    results.push({
      id: `lesson-${lesson.backendId ?? lesson.id}`,
      type: 'lesson',
      label: lesson.title,
      sublabel: `${lesson.studentName} · ${lesson.date}`,
      href: `/lessons/${getLessonRouteId(lesson)}`,
    });
  }

  if (params.includeStudents) {
    for (const student of params.students) {
      if (results.length >= limit) break;
      if (!matches([student.displayName, student.email].join(' '), q)) continue;
      results.push({
        id: `student-${student.id}`,
        type: 'student',
        label: student.displayName,
        sublabel: student.email,
        href: `/students/${student.id}`,
      });
    }
  }

  for (const card of params.vocabularyCards) {
    if (results.length >= limit) break;
    const lemma =
      card.word.definitions?.find((d) => d.lemmaText)?.lemmaText ?? card.word.text;
    const word = stripHtml(lemma || '');
    const definition = stripHtml(card.word.definition || '');
    if (!matches([word, definition].join(' '), q)) continue;
    results.push({
      id: `vocab-${card.id}`,
      type: 'vocabulary',
      label: word,
      sublabel: definition || 'Vocabulary',
      href: `/vocabulary?q=${encodeURIComponent(word)}`,
    });
  }

  return results;
}
