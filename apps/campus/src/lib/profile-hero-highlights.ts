import type { ScheduledLessonBackendDto, ScheduledLessonDto, TimeZoneId } from '@pkg/types';
import { LESSON_STATUS, formatTimeZoneOptionLabel, getTimeZoneById } from '@pkg/types';
import type { TranslateFn } from './cms/nav-i18n';
import { formatLessonTime12h } from './dashboard-hero';
import { lessonStartUtc } from './lessonTime';

function backendLessonStartMs(lesson: ScheduledLessonBackendDto): number {
  return new Date(`${lesson.date}T${lesson.startTime}`).getTime();
}

export function formatLessonWhenLabel(
  date: string,
  startTime: string,
  locale?: string,
): string {
  const anchor = new Date(`${date}T12:00:00`);
  const dateLabel = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(anchor);
  return `${dateLabel} · ${formatLessonTime12h(startTime)}`;
}

export function getTimeZoneHighlightLabel(timezoneId: TimeZoneId | number | undefined): string {
  const entry = getTimeZoneById((timezoneId ?? 1) as TimeZoneId);
  return entry ? formatTimeZoneOptionLabel(entry) : '—';
}

export function pickNextPlannedBackendLesson(
  lessons: ScheduledLessonBackendDto[] | undefined,
  now = Date.now(),
): ScheduledLessonBackendDto | null {
  if (!lessons?.length) return null;
  return (
    [...lessons]
      .filter((lesson) => lesson.status === 'planned' && backendLessonStartMs(lesson) >= now)
      .sort((a, b) => backendLessonStartMs(a) - backendLessonStartMs(b))[0] ?? null
  );
}

export function pickNextPlannedLessonDto(
  lessons: ScheduledLessonDto[] | undefined,
  now = Date.now(),
): ScheduledLessonDto | null {
  if (!lessons?.length) return null;
  return (
    [...lessons]
      .filter(
        (lesson) =>
          lesson.statusId === LESSON_STATUS.planned.id &&
          lessonStartUtc(lesson).getTime() >= now,
      )
      .sort((a, b) => lessonStartUtc(a).getTime() - lessonStartUtc(b).getTime())[0] ?? null
  );
}

export function pickLastCompletedLessonDto(
  lessons: ScheduledLessonDto[] | undefined,
  now = Date.now(),
): ScheduledLessonDto | null {
  if (!lessons?.length) return null;
  return (
    [...lessons]
      .filter(
        (lesson) =>
          lesson.statusId === LESSON_STATUS.completed.id &&
          lessonStartUtc(lesson).getTime() < now,
      )
      .sort((a, b) => lessonStartUtc(b).getTime() - lessonStartUtc(a).getTime())[0] ?? null
  );
}

export function truncateEmail(email: string, max = 28): string {
  const trimmed = email.trim();
  if (trimmed.length <= max) return trimmed;
  const at = trimmed.indexOf('@');
  if (at <= 0) return `${trimmed.slice(0, max - 1)}…`;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  if (domain.length + 4 >= max) return `${trimmed.slice(0, max - 1)}…`;
  const keepLocal = Math.max(3, max - domain.length - 1);
  return `${local.slice(0, keepLocal)}…${domain}`;
}

export type ProfileHeroAction = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  href: string;
  tone?: 'green' | 'blue' | 'amber' | 'neutral';
};

export function formatContactMetaLine(email: string | undefined, timezoneId: TimeZoneId | number | undefined): string | null {
  const parts: string[] = [];
  const trimmedEmail = email?.trim();
  if (trimmedEmail) parts.push(truncateEmail(trimmedEmail, 36));
  const timezone = getTimeZoneHighlightLabel(timezoneId);
  if (timezone && timezone !== '—') parts.push(timezone);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function buildProfileHeroAction(input: {
  lessons: ScheduledLessonBackendDto[] | undefined;
  reviewCount?: number;
  isStudent: boolean;
  now?: number;
  t?: TranslateFn;
  locale?: string;
}): ProfileHeroAction | null {
  const nextLesson = pickNextPlannedBackendLesson(input.lessons, input.now);
  if (nextLesson) {
    return {
      eyebrow: input.t?.('profile.hero.nextOnSchedule') ?? 'Next on schedule',
      title: nextLesson.title,
      subtitle: formatLessonWhenLabel(nextLesson.date, nextLesson.startTime, input.locale),
      href: `/lessons/${nextLesson.id}`,
      tone: 'blue',
    };
  }

  if (input.isStudent && (input.reviewCount ?? 0) > 0) {
    const count = input.reviewCount!;
    return {
      eyebrow: input.t?.('profile.hero.vocabulary') ?? 'Vocabulary',
      title: input.t?.('profile.hero.reviewDue') ?? 'Review due',
      subtitle:
        input.t?.('profile.hero.wordsToReview', { count }) ??
        `${count} word${count === 1 ? '' : 's'} to review`,
      href: '/practice/vocabulary',
      tone: 'green',
    };
  }

  return null;
}

export function buildStudentHeroAction(
  lessons: ScheduledLessonDto[] | undefined,
  lessonHref: (lesson: ScheduledLessonDto) => string,
  now = Date.now(),
  t?: TranslateFn,
  locale?: string,
): ProfileHeroAction | null {
  const nextLesson = pickNextPlannedLessonDto(lessons, now);
  if (!nextLesson) return null;
  return {
    eyebrow: t?.('profile.hero.nextOnSchedule') ?? 'Next on schedule',
    title: nextLesson.title,
    subtitle: formatLessonWhenLabel(nextLesson.date, nextLesson.startTime, locale),
    href: lessonHref(nextLesson),
    tone: 'blue',
  };
}
