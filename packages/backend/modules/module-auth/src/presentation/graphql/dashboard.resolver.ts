import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  AchievementStatsService,
  CurrentGqlUser,
  DashboardService,
  GqlAuthGuard,
} from '@be/auth';
import { DailyGoalsService } from '../../application/daily-goals.service';
import { PracticeSessionsService } from '../../application/practice-sessions.service';
import { StreakService } from '@be/notifications';
import type { RecordPracticeSessionRequestDto } from '@pkg/types';
import {
  AchievementStatsType,
  DailyGoalType,
  DashboardSummaryType,
  LearningStreakType,
  PracticeSessionType,
  PracticeWeekSummaryType,
  RecordPracticeSessionInput,
  StatisticsDashboardType,
  WordOfDayType,
} from '@be/graphql';
import { StatisticsDashboardService } from '../../application/statistics-dashboard.service';
import type { StatsRange } from '@pkg/types';

@Resolver()
@UseGuards(GqlAuthGuard)
export class DashboardResolver {
  constructor(
    private readonly achievements: AchievementStatsService,
    private readonly dashboard: DashboardService,
    private readonly dailyGoalsService: DailyGoalsService,
    private readonly practiceSessions: PracticeSessionsService,
    private readonly statisticsDashboardService: StatisticsDashboardService,
    private readonly streak: StreakService,
  ) {}

  private parseStatsRange(range: string): StatsRange {
    if (
      range === 'week' ||
      range === 'month' ||
      range === 'quarter' ||
      range === 'year' ||
      range === 'custom'
    ) {
      return range;
    }
    throw new Error(`Invalid statistics range: ${range}`);
  }

  @Query(() => DashboardSummaryType, { name: 'dashboardSummary' })
  dashboardSummary(@CurrentGqlUser() userId: string) {
    return this.dashboard.summaryFor(userId);
  }

  @Query(() => LearningStreakType, { name: 'learningStreak', nullable: true })
  learningStreak(@CurrentGqlUser() userId: string) {
    return this.streak.learningStreakForDashboard(userId);
  }

  @Query(() => AchievementStatsType, { name: 'achievementStats' })
  achievementStats(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
  ) {
    return this.achievements.statsFor(userId, studentId);
  }

  @Query(() => WordOfDayType, { name: 'wordOfDay', nullable: true })
  wordOfDay(@CurrentGqlUser() userId: string) {
    return this.dashboard.wordOfDayFor(userId);
  }

  @Query(() => [DailyGoalType], { name: 'dailyGoals' })
  dailyGoals(@CurrentGqlUser() userId: string) {
    return this.dailyGoalsService.listForUser(userId);
  }

  @Query(() => StatisticsDashboardType, { name: 'statisticsDashboard' })
  statisticsDashboard(
    @CurrentGqlUser() userId: string,
    @Args('range') range: string,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
    @Args('studentScope', { nullable: true }) studentScope?: string,
    @Args('statisticsFocus', { nullable: true }) statisticsFocus?: string,
    @Args('rangeFrom', { nullable: true }) rangeFrom?: string,
    @Args('rangeTo', { nullable: true }) rangeTo?: string,
    @Args('staffUserId', { nullable: true, type: () => ID }) staffUserId?: string,
  ) {
    return this.statisticsDashboardService.dashboardFor(
      userId,
      this.parseStatsRange(range),
      studentId,
      this.parseStudentScope(studentScope),
      new Date(),
      this.parseStatisticsFocus(statisticsFocus),
      rangeFrom,
      rangeTo,
      staffUserId,
    );
  }

  private parseStatisticsFocus(focus?: string): 'operations' | 'learning' {
    if (focus === 'learning') return 'learning';
    return 'operations';
  }

  private parseStudentScope(scope?: string): 'all' | 'my_students' | undefined {
    if (scope === 'all' || scope === 'my_students') return scope;
    return undefined;
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
