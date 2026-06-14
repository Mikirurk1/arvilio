import {
  LESSON_STATUS,
  PRACTICE_SESSION_TYPE,
  USER_ROLE,
  VOCABULARY_WORD_STATUS_IDS,
  type PracticeSessionLogEntry,
  type UserRoleId,
} from '@pkg/types';
import { computeUnlockedAchievementIdsFromCounters, emptyProfileStats } from './achievements';
import { mockUsers } from './entities';
import { mockScheduledLessons } from './lessons';
import { mockPracticeSessionLog } from './practice-sessions';

export type StatsRange = 'week' | 'month' | 'quarter' | 'year';

export type DateRange = {
  from: string;
  to: string;
};

export type PracticeSummaryMetric = {
  id: number;
  label: string;
  value: string;
};

export type PracticeSummaryResult = {
  studentId: number;
  range: DateRange;
  metrics: PracticeSummaryMetric[];
  practiceMinutes: number;
  lessonMinutes: number;
};

export type VocabularyProgressResult = {
  addedWords: number;
  knownWords: number;
};

export type TrendBucket = {
  id: number;
  label: string;
  value: number;
};

export type TrendComparisonResult = {
  current: number;
  previous: number;
  delta: number;
  trend: 'improved' | 'declined' | 'flat';
  buckets: TrendBucket[];
};

export type UserPracticeAnalyticsMock = {
  studentId: number;
  weeklyGoalMinutes: number;
  monthlyGoalMinutes: number;
  sessions: PracticeSessionLogEntry[];
  totals: {
    practiceMinutes: number;
    lessonMinutes: number;
    totalSessions: number;
    practiceSessions: number;
    lessonSessions: number;
  };
};

export type StatisticsDashboardData = {
  roleId: UserRoleId;
  currentUserId: number;
  subjectStudentId?: number;
  rangePreset: StatsRange;
  title: string;
  rangeLabel: string;
  range: DateRange;
  kpis: Array<{
    id: number;
    label: string;
    value: string;
    deltaLabel: string;
    trend: 'up' | 'down' | 'flat';
  }>;
  timeTrend: TrendBucket[];
  vocabularyTrend: Array<{ id: number; label: string; added: number; known: number }>;
  statusBreakdown: Array<{ id: number; label: string; value: number }>;
  deltas: Array<{ id: number; label: string; value: string; trend: 'up' | 'down' | 'flat' }>;
  goals: {
    weeklyMinutes: number;
    monthlyMinutes: number;
    quarterlyMinutes: number;
    yearlyMinutes: number;
    currentMinutes: number;
  };
};

const MOCK_NOW = new Date('2026-05-12T12:00:00.000Z');

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getRangeBounds(range: StatsRange, now: Date = MOCK_NOW): DateRange {
  const end = now;
  if (range === 'week') {
    const start = startOfDay(addDays(now, -6));
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (range === 'month') {
    const start = startOfDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (range === 'quarter') {
    const quarterStartMonth = Math.floor(now.getUTCMonth() / 3) * 3;
    const start = startOfDay(new Date(Date.UTC(now.getUTCFullYear(), quarterStartMonth, 1)));
    return { from: start.toISOString(), to: end.toISOString() };
  }
  const start = startOfDay(new Date(Date.UTC(now.getUTCFullYear(), 0, 1)));
  return { from: start.toISOString(), to: end.toISOString() };
}

function inRange(iso: string, range: DateRange): boolean {
  const at = new Date(iso).getTime();
  return at >= new Date(range.from).getTime() && at <= new Date(range.to).getTime();
}

function getUserVocabulary(studentId: number) {
  const user = mockUsers.find((u) => u.id === studentId);
  return user?.vocabulary ?? [];
}

export function getVocabularyProgressForRange(studentId: number, range: DateRange): VocabularyProgressResult {
  const rows = getUserVocabulary(studentId);
  let addedWords = 0;
  let knownWords = 0;
  for (const row of rows) {
    if (row.addedAt && inRange(row.addedAt, range)) addedWords += 1;
    if (row.knownAt && inRange(row.knownAt, range) && row.knownByTeacherId) {
      knownWords += 1;
    } else if (
      row.statusId === VOCABULARY_WORD_STATUS_IDS.learned &&
      !row.knownAt &&
      row.events?.some(
        (event) =>
          event.nextStatusId === VOCABULARY_WORD_STATUS_IDS.learned &&
          event.actorRoleId === USER_ROLE.teacher.id &&
          inRange(event.at, range),
      )
    ) {
      knownWords += 1;
    }
  }
  return { addedWords, knownWords };
}

export function getPracticeSummaryForRange(studentId: number, range: DateRange): PracticeSummaryResult {
  const sessions = mockPracticeSessionLog.filter(
    (entry) => entry.studentId === studentId && inRange(entry.startedAt, range),
  );

  const practiceSessions = sessions.filter((entry) => entry.source === 'practice');
  const practiceMinutes = practiceSessions.reduce((sum, session) => sum + session.durationMin, 0);
  const lessonMinutes = sessions
    .filter((entry) => entry.source === 'lesson')
    .reduce((sum, session) => sum + session.durationMin, 0);
  const quizzesCompleted = practiceSessions.filter(
    (entry) => entry.typeId === PRACTICE_SESSION_TYPE.quiz.id,
  ).length;
  const speakingSessions = practiceSessions.filter(
    (entry) => entry.typeId === PRACTICE_SESSION_TYPE.speaking.id,
  ).length;
  const vocab = getVocabularyProgressForRange(studentId, range);

  return {
    studentId,
    range,
    practiceMinutes,
    lessonMinutes,
    metrics: [
      { id: 1, label: 'New words learned', value: String(vocab.addedWords) },
      { id: 2, label: 'Quizzes completed', value: String(quizzesCompleted) },
      { id: 3, label: 'Speaking sessions', value: String(speakingSessions) },
      { id: 4, label: 'Time practicing', value: `${(practiceMinutes / 60).toFixed(1)}h` },
    ],
  };
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

export function getTrendComparison(studentId: number, range: DateRange, previousRange: DateRange): TrendComparisonResult {
  const currentSessions = mockPracticeSessionLog.filter(
    (entry) => entry.studentId === studentId && entry.source === 'practice' && inRange(entry.startedAt, range),
  );
  const previousSessions = mockPracticeSessionLog.filter(
    (entry) => entry.studentId === studentId && entry.source === 'practice' && inRange(entry.startedAt, previousRange),
  );

  const current = currentSessions.reduce((sum, row) => sum + row.durationMin, 0);
  const previous = previousSessions.reduce((sum, row) => sum + row.durationMin, 0);
  const delta = current - previous;
  const trend = delta > 0 ? 'improved' : delta < 0 ? 'declined' : 'flat';

  const bucketMap = new Map<string, number>();
  for (const session of currentSessions) {
    const label = dayLabel(session.startedAt);
    bucketMap.set(label, (bucketMap.get(label) ?? 0) + session.durationMin);
  }

  const sortedBuckets = Array.from(bucketMap.entries())
    .map(([label, value], index) => ({ id: index + 1, label, value }))
    .sort((a, b) => a.id - b.id);

  return {
    current,
    previous,
    delta,
    trend,
    buckets: sortedBuckets,
  };
}

export function getPracticeSummaryForPresetRange(studentId: number, preset: StatsRange): PracticeSummaryResult {
  return getPracticeSummaryForRange(studentId, getRangeBounds(preset));
}

function previousRangeOf(range: DateRange): DateRange {
  const from = new Date(range.from).getTime();
  const to = new Date(range.to).getTime();
  const durationMs = to - from;
  const previousTo = new Date(from - 1);
  const previousFrom = new Date(previousTo.getTime() - durationMs);
  return { from: previousFrom.toISOString(), to: previousTo.toISOString() };
}

function buildVocabularyTrend(studentId: number, range: DateRange): Array<{ id: number; label: string; added: number; known: number }> {
  const rows = getUserVocabulary(studentId);
  const bucket = new Map<string, { added: number; known: number }>();
  for (let i = 0; i < 7; i += 1) {
    const day = addDays(new Date(range.from), i);
    const label = day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
    bucket.set(label, { added: 0, known: 0 });
  }
  for (const row of rows) {
    if (row.addedAt && inRange(row.addedAt, range)) {
      const label = dayLabel(row.addedAt);
      const item = bucket.get(label);
      if (item) item.added += 1;
    }
    const knownEventAt =
      row.knownAt ??
      row.events?.find(
        (event) =>
          event.nextStatusId === VOCABULARY_WORD_STATUS_IDS.learned &&
          event.actorRoleId === USER_ROLE.teacher.id,
      )?.at;
    if (knownEventAt && inRange(knownEventAt, range)) {
      const label = dayLabel(knownEventAt);
      const item = bucket.get(label);
      if (item) item.known += 1;
    }
  }
  return Array.from(bucket.entries()).map(([label, value], index) => ({
    id: index + 1,
    label,
    added: value.added,
    known: value.known,
  }));
}

type LessonAggregate = {
  planned: number;
  completed: number;
  cancelled: number;
  cancelledCredited: number;
  completionRate: number;
  cancellationRate: number;
  averageDuration: number;
  homeworkReviewed: number;
};

function aggregateLessons(lessons: typeof mockScheduledLessons): LessonAggregate {
  const total = lessons.length;
  const planned = lessons.filter((l) => l.statusId === LESSON_STATUS.planned.id).length;
  const completed = lessons.filter((l) => l.statusId === LESSON_STATUS.completed.id).length;
  const cancelledLessons = lessons.filter((l) => l.statusId === LESSON_STATUS.cancelled.id);
  const cancelled = cancelledLessons.length;
  const cancelledCredited = cancelledLessons.filter((lesson) => lesson.credited).length;
  const averageDuration = total
    ? Math.round(lessons.reduce((sum, lesson) => sum + lesson.duration, 0) / total)
    : 0;
  const homeworkReviewed = lessons.filter((lesson) => lesson.studentResponse?.homeworkChecked).length;
  return {
    planned,
    completed,
    cancelled,
    cancelledCredited,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
    cancellationRate: total ? Math.round((cancelled / total) * 100) : 0,
    averageDuration,
    homeworkReviewed,
  };
}

function lessonsInRange(range: DateRange) {
  return mockScheduledLessons.filter((lesson) => {
    const startIso = `${lesson.date}T${lesson.startTime}:00.000Z`;
    return inRange(startIso, range);
  });
}

function lessonsForRole(
  roleId: UserRoleId,
  userId: number,
  range: DateRange,
  subjectStudentId?: number,
) {
  const scopedByRange = lessonsInRange(range);
  if (roleId === USER_ROLE.student.id) return scopedByRange.filter((lesson) => lesson.studentId === userId);
  if (roleId === USER_ROLE.teacher.id) {
    if (subjectStudentId) return scopedByRange.filter((lesson) => lesson.studentId === subjectStudentId);
    return scopedByRange.filter((lesson) => lesson.teacherId === userId);
  }
  if (roleId === USER_ROLE.admin.id) {
    if (subjectStudentId) return scopedByRange.filter((lesson) => lesson.studentId === subjectStudentId);
    const ownTeachingLessons = scopedByRange.filter((lesson) => lesson.teacherId === userId);
    if (ownTeachingLessons.length > 0) return ownTeachingLessons;
    return scopedByRange;
  }
  if (roleId === USER_ROLE.superAdmin.id) {
    if (subjectStudentId) return scopedByRange.filter((lesson) => lesson.studentId === subjectStudentId);
    return scopedByRange;
  }
  return [];
}

function lessonsTrend(lessons: typeof mockScheduledLessons): TrendBucket[] {
  const bucket = new Map<string, number>();
  for (const lesson of lessons) {
    const label = new Date(`${lesson.date}T00:00:00.000Z`).toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    });
    bucket.set(label, (bucket.get(label) ?? 0) + 1);
  }
  return Array.from(bucket.entries()).map(([label, value], index) => ({ id: index + 1, label, value }));
}

function lessonStatusBreakdown(aggregate: LessonAggregate): Array<{ id: number; label: string; value: number }> {
  return [
    { id: 1, label: 'Completed', value: aggregate.completed },
    { id: 2, label: 'Cancelled', value: aggregate.cancelled },
  ];
}

export function getRoleStatisticsDashboard(params: {
  roleId: UserRoleId;
  userId: number;
  rangePreset: StatsRange;
  subjectStudentId?: number;
}): StatisticsDashboardData {
  const { roleId, userId, rangePreset, subjectStudentId } = params;
  const range = getRangeBounds(rangePreset);
  const previousRange = previousRangeOf(range);
  const targetStudentId = subjectStudentId ?? userId;
  const summary = getPracticeSummaryForRange(targetStudentId, range);
  const previousSummary = getPracticeSummaryForRange(targetStudentId, previousRange);
  const currentVocabulary = getVocabularyProgressForRange(targetStudentId, range);
  const previousVocabulary = getVocabularyProgressForRange(targetStudentId, previousRange);
  const goalsSource = getUserPracticeAnalytics(targetStudentId);
  const currentMinutes = summary.practiceMinutes + summary.lessonMinutes;
  const currentLessons = lessonsForRole(roleId, userId, range, subjectStudentId);
  const previousLessons = lessonsForRole(roleId, userId, previousRange, subjectStudentId);
  const currentAgg = aggregateLessons(currentLessons);
  const previousAgg = aggregateLessons(previousLessons);

  const deltaFor = (current: number, previous: number, mode: 'count' | 'pp' = 'count') => {
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
  };

  const wordsDelta = deltaFor(currentVocabulary.addedWords, previousVocabulary.addedWords);
  const quizDelta = deltaFor(
    Number(summary.metrics.find((metric) => metric.id === 2)?.value ?? 0),
    Number(previousSummary.metrics.find((metric) => metric.id === 2)?.value ?? 0),
  );
  const speakingDelta = deltaFor(
    Number(summary.metrics.find((metric) => metric.id === 3)?.value ?? 0),
    Number(previousSummary.metrics.find((metric) => metric.id === 3)?.value ?? 0),
  );
  const completedDelta = deltaFor(currentAgg.completed, previousAgg.completed);
  const completionRateDelta = deltaFor(currentAgg.completionRate, previousAgg.completionRate, 'pp');
  const homeworkDelta = deltaFor(currentAgg.homeworkReviewed, previousAgg.homeworkReviewed);
  const plannedDelta = deltaFor(currentAgg.planned, previousAgg.planned);
  const cancelledCountDelta = deltaFor(currentAgg.cancelled, previousAgg.cancelled);
  const lessonHoursCurrent = Number((currentLessons.reduce((sum, lesson) => sum + lesson.duration, 0) / 60).toFixed(1));
  const lessonHoursPrevious = Number((previousLessons.reduce((sum, lesson) => sum + lesson.duration, 0) / 60).toFixed(1));
  const lessonHoursDelta = deltaFor(lessonHoursCurrent, lessonHoursPrevious);

  const roleTitle =
    roleId === USER_ROLE.student.id
      ? 'Student statistics'
      : roleId === USER_ROLE.teacher.id
        ? 'Teacher statistics'
        : roleId === USER_ROLE.admin.id
          ? 'Admin statistics'
          : 'Super-admin statistics';
  const rangeLabel =
    rangePreset === 'week'
      ? 'Current week'
      : rangePreset === 'month'
        ? 'Current month'
        : rangePreset === 'quarter'
          ? 'Current quarter'
          : 'Current year';

  return {
    roleId,
    currentUserId: userId,
    subjectStudentId,
    rangePreset,
    title: roleTitle,
    rangeLabel,
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
      ...(roleId !== USER_ROLE.student.id
        ? [
            {
              id: 5,
              label: 'Quizzes completed',
              value: String(summary.metrics.find((metric) => metric.id === 2)?.value ?? '0'),
              deltaLabel: quizDelta.label,
              trend: quizDelta.trend,
            },
          ]
        : []),
      ...(roleId === USER_ROLE.superAdmin.id
        ? [
            {
              id: 6,
              label: 'New words added',
              value: String(currentVocabulary.addedWords),
              deltaLabel: wordsDelta.label,
              trend: wordsDelta.trend,
            },
            {
              id: 7,
              label: 'Speaking sessions',
              value: String(summary.metrics.find((metric) => metric.id === 3)?.value ?? '0'),
              deltaLabel: speakingDelta.label,
              trend: speakingDelta.trend,
            },
          ]
        : []),
    ],
    timeTrend: lessonsTrend(currentLessons),
    vocabularyTrend: buildVocabularyTrend(targetStudentId, range),
    statusBreakdown: lessonStatusBreakdown(currentAgg),
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
      weeklyMinutes: goalsSource.weeklyGoalMinutes,
      monthlyMinutes: goalsSource.monthlyGoalMinutes,
      quarterlyMinutes: goalsSource.monthlyGoalMinutes * 3,
      yearlyMinutes: goalsSource.monthlyGoalMinutes * 12,
      currentMinutes,
    },
  };
}

export function getStatisticsDashboard(studentId: number, rangePreset: StatsRange): StatisticsDashboardData {
  return getRoleStatisticsDashboard({
    roleId: USER_ROLE.student.id,
    userId: studentId,
    rangePreset,
    subjectStudentId: studentId,
  });
}

function computeSessionTotals(sessions: PracticeSessionLogEntry[]) {
  const practiceSessions = sessions.filter((session) => session.source === 'practice');
  const lessonSessions = sessions.filter((session) => session.source === 'lesson');
  return {
    practiceMinutes: practiceSessions.reduce((sum, row) => sum + row.durationMin, 0),
    lessonMinutes: lessonSessions.reduce((sum, row) => sum + row.durationMin, 0),
    totalSessions: sessions.length,
    practiceSessions: practiceSessions.length,
    lessonSessions: lessonSessions.length,
  };
}

const studentIds = mockUsers
  .filter((user) => user.role === USER_ROLE.student.id)
  .map((user) => user.id);

export const mockUserPracticeAnalytics: UserPracticeAnalyticsMock[] = studentIds.map((studentId) => {
  const sessions = mockPracticeSessionLog.filter((session) => session.studentId === studentId);
  return {
    studentId,
    weeklyGoalMinutes: 180,
    monthlyGoalMinutes: 720,
    sessions,
    totals: computeSessionTotals(sessions),
  };
});

export function getUserPracticeAnalytics(studentId: number): UserPracticeAnalyticsMock {
  const existing = mockUserPracticeAnalytics.find((entry) => entry.studentId === studentId);
  if (existing) return existing;
  return {
    studentId,
    weeklyGoalMinutes: 180,
    monthlyGoalMinutes: 720,
    sessions: [],
    totals: computeSessionTotals([]),
  };
}

function nextSessionLogId(): number {
  return mockPracticeSessionLog.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

export function appendMockPracticeSession(
  input: Omit<PracticeSessionLogEntry, 'id' | 'durationMin'> & { durationMin?: number },
): PracticeSessionLogEntry {
  const startedAtMs = new Date(input.startedAt).getTime();
  const endedAtMs = new Date(input.endedAt).getTime();
  const computedDurationMin = Math.max(0, Math.round((endedAtMs - startedAtMs) / 60000));
  const entry: PracticeSessionLogEntry = {
    ...input,
    id: nextSessionLogId(),
    durationMin: input.durationMin ?? computedDurationMin,
  };
  mockPracticeSessionLog.push(entry);

  const profile = mockUserPracticeAnalytics.find((row) => row.studentId === entry.studentId);
  if (profile) {
    profile.sessions.push(entry);
    profile.totals = computeSessionTotals(profile.sessions);
  } else {
    mockUserPracticeAnalytics.push({
      studentId: entry.studentId,
      weeklyGoalMinutes: 180,
      monthlyGoalMinutes: 720,
      sessions: [entry],
      totals: computeSessionTotals([entry]),
    });
  }

  const user = mockUsers.find((row) => row.id === entry.studentId);
  if (user) {
    const currentStats = user.stats ?? { ...emptyProfileStats };
    const nextStats = {
      ...currentStats,
      practiceMinutesTotal:
        currentStats.practiceMinutesTotal +
        (entry.source === 'practice' ? entry.durationMin : 0),
      lessonMinutesTotal:
        currentStats.lessonMinutesTotal +
        (entry.source === 'lesson' ? entry.durationMin : 0),
      quizzesCompleted:
        currentStats.quizzesCompleted +
        (entry.source === 'practice' && entry.typeId === PRACTICE_SESSION_TYPE.quiz.id ? 1 : 0),
      speakingSessions:
        currentStats.speakingSessions +
        (entry.source === 'practice' && entry.typeId === PRACTICE_SESSION_TYPE.speaking.id ? 1 : 0),
      lessonsCompleted:
        currentStats.lessonsCompleted +
        (entry.source === 'lesson' && entry.typeId === PRACTICE_SESSION_TYPE.lesson.id ? 1 : 0),
    };
    user.stats = {
      ...nextStats,
      unlockedAchievementIds: computeUnlockedAchievementIdsFromCounters({
        wordsLearned: nextStats.wordsLearned,
        lessonsCompleted: nextStats.lessonsCompleted,
        streakDays: nextStats.streakDays,
        quizzesCompleted: nextStats.quizzesCompleted,
        perfectQuizCount: nextStats.perfectQuizCount,
        speakingSessions: nextStats.speakingSessions,
        speakingSubmissions: nextStats.speakingSubmissions,
        speakingReviewsReceived: nextStats.speakingReviewsReceived,
        speakingMinutesTotal: nextStats.speakingMinutesTotal,
        gamesSessions: nextStats.gamesSessions,
        practiceMinutesTotal: nextStats.practiceMinutesTotal,
        lessonMinutesTotal: nextStats.lessonMinutesTotal,
        weeklyGoalsCompleted: nextStats.weeklyGoalsCompleted,
      }),
    };
  }

  return entry;
}
