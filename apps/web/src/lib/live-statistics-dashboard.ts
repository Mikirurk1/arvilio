import type {
  ScheduledLessonBackendDto,
  StudentWordCardDto,
  UserRoleId,
} from '@pkg/types';
import { USER_ROLE } from '@pkg/types';
import type {
  DateRange,
  StatisticsDashboardData,
  StatsRange,
} from '../mocks/domains/statistics';
import { getRangeBounds } from '../mocks/domains/statistics';

function previousRangeOf(range: DateRange): DateRange {
  const from = new Date(range.from).getTime();
  const to = new Date(range.to).getTime();
  const durationMs = to - from;
  const previousTo = new Date(from - 1);
  const previousFrom = new Date(previousTo.getTime() - durationMs);
  return { from: previousFrom.toISOString(), to: previousTo.toISOString() };
}

function inRange(iso: string, range: DateRange): boolean {
  const ts = new Date(iso).getTime();
  return ts >= new Date(range.from).getTime() && ts <= new Date(range.to).getTime();
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function utcDayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function lessonsInRange(lessons: ScheduledLessonBackendDto[], range: DateRange) {
  return lessons.filter((lesson) => inRange(`${lesson.date}T${lesson.startTime}:00.000Z`, range));
}

type LessonAggregate = {
  planned: number;
  completed: number;
  cancelled: number;
  cancelledCredited: number;
  completionRate: number;
  homeworkReviewed: number;
};

function aggregateBackendLessons(lessons: ScheduledLessonBackendDto[]): LessonAggregate {
  const total = lessons.length;
  const planned = lessons.filter((l) => l.status === 'planned').length;
  const completed = lessons.filter((l) => l.status === 'completed').length;
  const cancelledLessons = lessons.filter((l) => l.status === 'cancelled');
  const cancelled = cancelledLessons.length;
  const cancelledCredited = cancelledLessons.filter((l) => l.credited).length;
  return {
    planned,
    completed,
    cancelled,
    cancelledCredited,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
    homeworkReviewed: 0,
  };
}

function lessonsTrend(lessons: ScheduledLessonBackendDto[]) {
  const bucket = new Map<string, number>();
  for (const lesson of lessons) {
    const label = new Date(`${lesson.date}T00:00:00.000Z`).toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    });
    bucket.set(label, (bucket.get(label) ?? 0) + 1);
  }
  return Array.from(bucket.entries()).map(([label, value], index) => ({
    id: index + 1,
    label,
    value,
  }));
}

function vocabularyTrendFromCards(cards: StudentWordCardDto[], range: DateRange) {
  const rangeStart = startOfUtcDay(new Date(range.from));
  const rangeEnd = new Date(range.to);
  const dayMs = 86_400_000;
  const totalDays = Math.floor((rangeEnd.getTime() - rangeStart.getTime()) / dayMs) + 1;
  const maxBuckets = 14;
  const bucketCount = Math.min(Math.max(totalDays, 1), maxBuckets);
  const windowStart =
    totalDays > maxBuckets
      ? new Date(rangeEnd.getTime() - (maxBuckets - 1) * dayMs)
      : rangeStart;
  const start = startOfUtcDay(windowStart);

  const bucket = new Map<string, { added: number; known: number; label: string }>();
  for (let i = 0; i < bucketCount; i += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const key = day.toISOString().slice(0, 10);
    const label = day.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
    bucket.set(key, { added: 0, known: 0, label });
  }

  for (const card of cards) {
    if (card.firstSeenAt && inRange(card.firstSeenAt, range)) {
      const item = bucket.get(utcDayKey(card.firstSeenAt));
      if (item) item.added += 1;
    }
    if (card.knownAt && inRange(card.knownAt, range)) {
      const item = bucket.get(utcDayKey(card.knownAt));
      if (item) item.known += 1;
    }
  }

  return Array.from(bucket.values()).map((value, index) => ({
    id: index + 1,
    label: value.label,
    added: value.added,
    known: value.known,
  }));
}

function vocabularyProgress(cards: StudentWordCardDto[], range: DateRange) {
  let addedWords = 0;
  let knownWords = 0;
  for (const card of cards) {
    if (card.firstSeenAt && inRange(card.firstSeenAt, range)) addedWords += 1;
    if (card.knownAt && inRange(card.knownAt, range)) knownWords += 1;
  }
  return { addedWords, knownWords };
}

function deltaFor(current: number, previous: number, mode: 'count' | 'pp' = 'count') {
  const diff = current - previous;
  const normalized =
    Math.abs(diff % 1) < 1e-9 ? Math.trunc(diff) : Number(diff.toFixed(1));
  if (diff === 0) return { label: 'No change', trend: 'flat' as const };
  if (mode === 'pp') {
    return {
      label: `${normalized > 0 ? '+' : ''}${normalized}pp vs prev`,
      trend: diff > 0 ? ('up' as const) : ('down' as const),
    };
  }
  return {
    label: `${normalized > 0 ? '+' : ''}${normalized} vs prev`,
    trend: diff > 0 ? ('up' as const) : ('down' as const),
  };
}

function rangeLabelFor(preset: StatsRange): string {
  if (preset === 'week') return 'Current week';
  if (preset === 'month') return 'Current month';
  if (preset === 'quarter') return 'Current quarter';
  return 'Current year';
}

export function buildLiveStatisticsDashboard(params: {
  roleId: UserRoleId;
  rangePreset: StatsRange;
  lessons: ScheduledLessonBackendDto[];
  cards?: StudentWordCardDto[];
  title: string;
  currentUserId?: number;
  subjectStudentId?: number;
  now?: Date;
}): StatisticsDashboardData {
  const {
    roleId,
    rangePreset,
    lessons,
    cards = [],
    title,
    currentUserId = 0,
    subjectStudentId,
    now = new Date(),
  } = params;

  const range = getRangeBounds(rangePreset, now);
  const previousRange = previousRangeOf(range);
  const currentLessons = lessonsInRange(lessons, range);
  const previousLessons = lessonsInRange(lessons, previousRange);
  const currentAgg = aggregateBackendLessons(currentLessons);
  const previousAgg = aggregateBackendLessons(previousLessons);
  const currentVocabulary = vocabularyProgress(cards, range);
  const previousVocabulary = vocabularyProgress(cards, previousRange);

  const completedDelta = deltaFor(currentAgg.completed, previousAgg.completed);
  const completionRateDelta = deltaFor(currentAgg.completionRate, previousAgg.completionRate, 'pp');
  const cancelledCountDelta = deltaFor(currentAgg.cancelled, previousAgg.cancelled);
  const plannedDelta = deltaFor(currentAgg.planned, previousAgg.planned);
  const homeworkDelta = deltaFor(currentAgg.homeworkReviewed, previousAgg.homeworkReviewed);
  const wordsDelta = deltaFor(currentVocabulary.addedWords, previousVocabulary.addedWords);

  const lessonHoursCurrent = Number(
    (currentLessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0) / 60).toFixed(1),
  );
  const lessonHoursPrevious = Number(
    (previousLessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0) / 60).toFixed(1),
  );
  const lessonHoursDelta = deltaFor(lessonHoursCurrent, lessonHoursPrevious);

  const currentMinutes = currentLessons
    .filter((l) => l.status === 'completed')
    .reduce((sum, l) => sum + (l.duration ?? 0), 0);

  return {
    roleId,
    currentUserId,
    subjectStudentId,
    rangePreset,
    title,
    rangeLabel: rangeLabelFor(rangePreset),
    range,
    kpis: [
      {
        id: 1,
        label: 'Completed lessons',
        value: String(currentAgg.completed),
        deltaLabel: completedDelta.label,
        trend: completedDelta.trend,
      },
      {
        id: 2,
        label: 'Cancelled lessons',
        value: String(currentAgg.cancelled),
        deltaLabel: `${cancelledCountDelta.label} · ${currentAgg.cancelledCredited} credited`,
        trend: cancelledCountDelta.trend,
      },
      {
        id: 3,
        label: 'Lesson hours',
        value: `${lessonHoursCurrent}h`,
        deltaLabel: lessonHoursDelta.label,
        trend: lessonHoursDelta.trend,
      },
      {
        id: 4,
        label: 'Completion rate',
        value: `${currentAgg.completionRate}%`,
        deltaLabel: completionRateDelta.label,
        trend: completionRateDelta.trend,
      },
      ...(roleId === USER_ROLE.student.id
        ? [
            {
              id: 5,
              label: 'New words added',
              value: String(currentVocabulary.addedWords),
              deltaLabel: wordsDelta.label,
              trend: wordsDelta.trend,
            },
          ]
        : []),
    ],
    timeTrend: lessonsTrend(currentLessons),
    vocabularyTrend: vocabularyTrendFromCards(cards, range),
    statusBreakdown: [
      { id: 1, label: 'Completed', value: currentAgg.completed },
      { id: 2, label: 'Cancelled', value: currentAgg.cancelled },
      { id: 3, label: 'Planned', value: currentAgg.planned },
    ],
    deltas: [
      {
        id: 1,
        label: 'Completion rate',
        value: `${currentAgg.completionRate}%`,
        trend: completionRateDelta.trend,
      },
      {
        id: 2,
        label: 'Homework reviewed',
        value: String(currentAgg.homeworkReviewed),
        trend: homeworkDelta.trend,
      },
      {
        id: 3,
        label: 'Lessons planned',
        value: String(currentAgg.planned),
        trend: plannedDelta.trend,
      },
    ],
    goals: {
      weeklyMinutes: 180,
      monthlyMinutes: 720,
      quarterlyMinutes: 2160,
      yearlyMinutes: 8640,
      currentMinutes,
    },
  };
}

export function filterLessonsForViewer(
  lessons: ScheduledLessonBackendDto[] | null | undefined,
  roleId: UserRoleId,
  viewerBackendId: string | null | undefined,
): ScheduledLessonBackendDto[] {
  if (!lessons?.length) return [];
  if (!viewerBackendId) return lessons;
  if (roleId === USER_ROLE.student.id) {
    return lessons.filter((lesson) => lesson.studentId === viewerBackendId);
  }
  if (roleId === USER_ROLE.teacher.id) {
    return lessons.filter((lesson) => lesson.teacherId === viewerBackendId);
  }
  return lessons;
}
