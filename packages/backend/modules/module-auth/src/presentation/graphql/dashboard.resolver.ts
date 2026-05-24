import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, DashboardService, GqlAuthGuard } from '@be/auth';
import { DailyGoalsService } from '../../application/daily-goals.service';
import { PracticeSessionsService } from '../../application/practice-sessions.service';
import { StreakService } from '@be/notifications';
import type { RecordPracticeSessionRequestDto } from '@pkg/types';
import {
  DailyGoalType,
  DashboardSummaryType,
  LearningStreakType,
  PracticeSessionType,
  PracticeWeekSummaryType,
  RecordPracticeSessionInput,
  WordOfDayType,
} from '@be/graphql';

@Resolver()
@UseGuards(GqlAuthGuard)
export class DashboardResolver {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly dailyGoalsService: DailyGoalsService,
    private readonly practiceSessions: PracticeSessionsService,
    private readonly streak: StreakService,
  ) {}

  @Query(() => DashboardSummaryType, { name: 'dashboardSummary' })
  dashboardSummary(@CurrentGqlUser() userId: string) {
    return this.dashboard.summaryFor(userId);
  }

  @Query(() => LearningStreakType, { name: 'learningStreak', nullable: true })
  learningStreak(@CurrentGqlUser() userId: string) {
    return this.streak.learningStreakForDashboard(userId);
  }

  @Query(() => WordOfDayType, { name: 'wordOfDay', nullable: true })
  wordOfDay(@CurrentGqlUser() userId: string) {
    return this.dashboard.wordOfDayFor(userId);
  }

  @Query(() => [DailyGoalType], { name: 'dailyGoals' })
  dailyGoals(@CurrentGqlUser() userId: string) {
    return this.dailyGoalsService.listForUser(userId);
  }

  @Mutation(() => [DailyGoalType], { name: 'setDailyGoalDone' })
  setDailyGoalDone(
    @CurrentGqlUser() userId: string,
    @Args('goalId', { type: () => ID }) goalId: string,
    @Args('done') done: boolean,
  ) {
    return this.dailyGoalsService.setDone(userId, goalId, done);
  }

  @Query(() => PracticeWeekSummaryType, { name: 'practiceWeekSummary' })
  practiceWeekSummary(@CurrentGqlUser() userId: string) {
    return this.practiceSessions.weekSummaryFor(userId);
  }

  @Mutation(() => PracticeSessionType, { name: 'recordPracticeSession' })
  recordPracticeSession(
    @CurrentGqlUser() userId: string,
    @Args('input') input: RecordPracticeSessionInput,
  ) {
    return this.practiceSessions.record(userId, {
      kind: input.kind as RecordPracticeSessionRequestDto['kind'],
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      source: input.source as RecordPracticeSessionRequestDto['source'] | undefined,
    });
  }
}
