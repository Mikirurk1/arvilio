import type { StatisticsDashboardDto } from '@pkg/types';
import { mapStatisticsDashboardToViewModel } from './map-statistics-dashboard';

const baseDto = (): StatisticsDashboardDto => ({
  layout: 'student',
  subjectRole: 'student',
  range: 'week',
  rangeLabel: 'Last 7 days',
  rangeBounds: { from: '2026-05-26T00:00:00.000Z', to: '2026-06-02T12:00:00.000Z' },
  title: 'Your statistics',
  streakDays: 3,
  kpis: [
    {
      id: 'lessons-completed',
      category: 'lessons',
      label: 'Completed lessons',
      value: '2',
      deltaLabel: '+1 vs prev',
      trend: 'up',
    },
    {
      id: 'streak',
      category: 'streak',
      label: 'Learning streak',
      value: '3 days',
      deltaLabel: 'Current',
      trend: 'flat',
    },
  ],
  lessons: {
    planned: 1,
    completed: 2,
    cancelled: 0,
    credited: 0,
    completionRatePercent: 67,
    hours: 1.5,
    trend: [{ label: '6/1', value: 1 }],
    statusBreakdown: [
      { id: 'completed', label: 'Completed', value: 2 },
      { id: 'planned', label: 'Planned', value: 1 },
    ],
  },
  vocabulary: {
    wordsAdded: 4,
    wordsReviewed: 2,
    wordsMarkedLearned: 1,
    trend: [{ label: '6/1', added: 2, known: 1, reviewed: 1 }],
    statusBreakdown: [{ id: 'NEW', label: 'New', value: 5 }],
  },
  practice: {
    totalMinutes: 30,
    vocabularyMinutes: 10,
    quizMinutes: 10,
    speakingMinutes: 5,
    gamesMinutes: 5,
    trend: [
      {
        label: '6/1',
        vocabularyMinutes: 10,
        quizMinutes: 10,
        speakingMinutes: 5,
        gamesMinutes: 5,
      },
    ],
  },
  quiz: {
    attempts: 2,
    perfectAttempts: 1,
    bestScorePercent: 100,
    questionsCorrect: 20,
  },
  speaking: {
    submissions: 1,
    reviewsReceived: 0,
    minutes: 5,
  },
  dailyGoals: {
    slotsCompleted: 6,
    slotsAvailable: 28,
    daysWithAllGoals: 1,
    daysInRange: 7,
    trend: [{ label: '6/1', completionPercent: 100, slotsCompleted: 4 }],
  },
});

describe('mapStatisticsDashboardToViewModel', () => {
  it('groups KPIs by category and maps chart series', () => {
    const vm = mapStatisticsDashboardToViewModel(baseDto());
    expect(vm.kpis).toHaveLength(2);
    expect(vm.isStudentLayout).toBe(true);
    expect(vm.kpisByCategory.map((g) => g.category)).toEqual(['lessons', 'streak']);
    expect(vm.lessonsTrend).toHaveLength(1);
    expect(vm.dailyGoalsSummary?.daysInRange).toBe(7);
    expect(vm.vocabStatusBreakdown[0]?.value).toBe(5);
  });
});
