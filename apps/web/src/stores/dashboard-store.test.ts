import { createIdleSlice } from './lib/async-slice';
import { useDashboardStore } from './dashboard-store';

const mockGraphql = jest.fn();

jest.mock('../lib/graphql-client', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphql(...args),
}));

jest.mock('./lessons-store', () => ({
  useLessonsStore: { getState: () => ({ fetchScheduledLessons: jest.fn() }) },
}));

jest.mock('./vocabulary-store', () => ({
  useVocabularyStore: {
    getState: () => ({
      fetchOverview: jest.fn().mockResolvedValue(undefined),
      fetchCards: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe('dashboard-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDashboardStore.setState({
      summary: createIdleSlice(),
      goals: createIdleSlice(),
      streak: createIdleSlice(),
      wordOfDay: createIdleSlice(),
    });
  });

  it('fetchSummary loads dashboard summary', async () => {
    mockGraphql.mockResolvedValue({
      dashboardSummary: { role: 'student', lessonsToday: 0 },
    });
    await useDashboardStore.getState().fetchSummary(true);
    expect(useDashboardStore.getState().summary.status).toBe('success');
  });

  it('fetchGoals loads daily goals', async () => {
    mockGraphql.mockResolvedValue({
      dailyGoals: [
        {
          id: 'g1',
          templateId: 'vocab-cards-5',
          kind: 'vocabulary',
          text: 'Review 5 vocabulary flashcards today',
          difficulty: 1,
          done: false,
          progressCurrent: 2,
          progressTarget: 5,
          progressLabel: 'cards',
          actionPath: '/vocabulary/play',
          dateKey: '2026-05-20',
        },
      ],
    });
    await useDashboardStore.getState().fetchGoals(true);
    expect(useDashboardStore.getState().goals.status).toBe('success');
    expect(useDashboardStore.getState().goals.data).toHaveLength(1);
    expect(useDashboardStore.getState().goals.data?.[0]?.progressCurrent).toBe(2);
  });

  it('fetchDashboard loads student-specific slices', async () => {
    mockGraphql
      .mockResolvedValueOnce({ dashboardSummary: { role: 'student' } })
      .mockResolvedValueOnce({ dailyGoals: [] })
      .mockResolvedValueOnce({ learningStreak: null })
      .mockResolvedValueOnce({ wordOfDay: null });
    await useDashboardStore.getState().fetchDashboard(true);
    expect(useDashboardStore.getState().summary.status).toBe('success');
    expect(useDashboardStore.getState().goals.status).toBe('success');
  });
});
