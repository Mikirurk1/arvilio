import {
  buildDailyGoalId,
  getDailyGoalsForUser,
  goalDefinitions,
  GOAL_TIER_LABELS,
  parseDailyGoalId,
} from '@pkg/types';

describe('daily-goals (@pkg/types)', () => {
  it('buildDailyGoalId and parseDailyGoalId round-trip', () => {
    const id = buildDailyGoalId('vocab-cards-5', '2026-05-20');
    expect(parseDailyGoalId(id)).toEqual({ templateId: 'vocab-cards-5', dateKey: '2026-05-20' });
  });

  it('parseDailyGoalId rejects invalid ids', () => {
    expect(parseDailyGoalId('bad')).toBeNull();
    expect(parseDailyGoalId('vocab-cards-5-not-a-date')).toBeNull();
  });

  it('getDailyGoalsForUser returns four tiers with stable ids for same seed', () => {
    const a = getDailyGoalsForUser('user-1', '2026-05-20');
    const b = getDailyGoalsForUser('user-1', '2026-05-20');
    expect(a).toHaveLength(4);
    expect(a.map((g) => g.id)).toEqual(b.map((g) => g.id));
    expect(a.map((g) => g.difficulty)).toEqual([1, 2, 3, 4]);
    expect(a.map((g) => g.kind)).toEqual(goalDefinitions.map((d) => d.kind));
    for (const goal of a) {
      expect(GOAL_TIER_LABELS[goal.difficulty]).toBeTruthy();
      expect(goal.actionPath).toMatch(/^\//);
    }
  });

  it('same user can get different variants on another date', () => {
    const dayA = getDailyGoalsForUser('user-1', '2026-05-20').map((g) => g.templateId);
    const dayB = getDailyGoalsForUser('user-1', '2026-05-21').map((g) => g.templateId);
    expect(dayA).not.toEqual(dayB);
  });
});
