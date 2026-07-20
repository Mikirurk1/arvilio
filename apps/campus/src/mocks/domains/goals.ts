/** Re-export shared daily goals logic (used by profile mocks until fully migrated). */
export {
  defaultGoalDateKey,
  getDailyGoalsForUser,
  goalDefinitions,
  GOAL_TIER_LABELS,
  type DailyGoalInstance,
  type GoalDifficulty,
  type GoalKind,
  type GoalVariant,
} from '@pkg/types';
