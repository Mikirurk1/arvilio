import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { StaffEarningsSectionType } from './staff-payout.types';

@ObjectType()
export class StatisticsKpiType {
  @Field(() => ID)
  id!: string;

  @Field()
  category!: string;

  @Field()
  label!: string;

  @Field()
  value!: string;

  @Field()
  deltaLabel!: string;

  @Field()
  trend!: string;
}

@ObjectType()
export class StatisticsTrendPointType {
  @Field()
  label!: string;

  @Field(() => Int)
  value!: number;
}

@ObjectType()
export class StatisticsVocabularyTrendPointType {
  @Field()
  label!: string;

  @Field(() => Int)
  added!: number;

  @Field(() => Int)
  known!: number;

  @Field(() => Int)
  reviewed!: number;
}

@ObjectType()
export class StatisticsPracticeTrendPointType {
  @Field()
  label!: string;

  @Field(() => Int)
  vocabularyMinutes!: number;

  @Field(() => Int)
  quizMinutes!: number;

  @Field(() => Int)
  speakingMinutes!: number;

  @Field(() => Int)
  gamesMinutes!: number;
}

@ObjectType()
export class StatisticsDailyGoalsTrendPointType {
  @Field()
  label!: string;

  @Field(() => Int)
  completionPercent!: number;

  @Field(() => Int)
  slotsCompleted!: number;
}

@ObjectType()
export class StatisticsBreakdownSliceType {
  @Field(() => ID)
  id!: string;

  @Field()
  label!: string;

  @Field(() => Int)
  value!: number;
}

@ObjectType()
export class StatisticsLessonsSectionType {
  @Field(() => Int)
  planned!: number;

  @Field(() => Int)
  completed!: number;

  @Field(() => Int)
  cancelled!: number;

  @Field(() => Int)
  credited!: number;

  @Field(() => Int)
  completionRatePercent!: number;

  @Field(() => Float)
  hours!: number;

  @Field(() => Int, { nullable: true })
  groupLessonsCompleted?: number;

  @Field(() => [StatisticsTrendPointType])
  trend!: StatisticsTrendPointType[];

  @Field(() => [StatisticsBreakdownSliceType])
  statusBreakdown!: StatisticsBreakdownSliceType[];
}

@ObjectType()
export class StatisticsVocabularySectionType {
  @Field(() => Int)
  wordsAdded!: number;

  @Field(() => Int)
  wordsReviewed!: number;

  @Field(() => Int)
  wordsMarkedLearned!: number;

  @Field(() => [StatisticsVocabularyTrendPointType])
  trend!: StatisticsVocabularyTrendPointType[];

  @Field(() => [StatisticsBreakdownSliceType])
  statusBreakdown!: StatisticsBreakdownSliceType[];
}

@ObjectType()
export class StatisticsPracticeSectionType {
  @Field(() => Int)
  totalMinutes!: number;

  @Field(() => Int)
  vocabularyMinutes!: number;

  @Field(() => Int)
  quizMinutes!: number;

  @Field(() => Int)
  speakingMinutes!: number;

  @Field(() => Int)
  gamesMinutes!: number;

  @Field(() => [StatisticsPracticeTrendPointType])
  trend!: StatisticsPracticeTrendPointType[];
}

@ObjectType()
export class StatisticsQuizSectionType {
  @Field(() => Int)
  attempts!: number;

  @Field(() => Int)
  perfectAttempts!: number;

  @Field(() => Int)
  bestScorePercent!: number;

  @Field(() => Int)
  questionsCorrect!: number;
}

@ObjectType()
export class StatisticsSpeakingSectionType {
  @Field(() => Int)
  submissions!: number;

  @Field(() => Int)
  reviewsReceived!: number;

  @Field(() => Int)
  minutes!: number;
}

@ObjectType()
export class StatisticsDailyGoalsSectionType {
  @Field(() => Int)
  slotsCompleted!: number;

  @Field(() => Int)
  slotsAvailable!: number;

  @Field(() => Int)
  daysWithAllGoals!: number;

  @Field(() => Int)
  daysInRange!: number;

  @Field(() => [StatisticsDailyGoalsTrendPointType])
  trend!: StatisticsDailyGoalsTrendPointType[];
}

@ObjectType()
export class StatisticsStaffOverviewType {
  @Field(() => Int)
  totalStudents!: number;

  @Field(() => Int)
  activeStudents!: number;

  @Field(() => Int)
  homeworkReviewed!: number;

  @Field(() => Int)
  speakingReviewsDone!: number;

  @Field(() => Int)
  speakingPendingReview!: number;

  @Field(() => Int)
  inactiveStudents!: number;
}

@ObjectType()
export class StatisticsSchoolOverviewType {
  @Field(() => Int)
  studentCount!: number;

  @Field(() => Int)
  teacherCount!: number;

  @Field(() => Int)
  lessonsInPeriod!: number;

  @Field(() => Int)
  utilizationPercent!: number;
}

@ObjectType()
export class StatisticsRosterEntryType {
  @Field(() => ID)
  studentId!: string;

  @Field()
  displayName!: string;

  @Field(() => Int)
  completedLessons!: number;

  @Field(() => Int)
  plannedLessons!: number;

  @Field(() => Int)
  cancelledLessons!: number;

  @Field(() => Int)
  cancelledCredited!: number;

  @Field(() => Float)
  lessonHours!: number;

  @Field(() => Int)
  practiceMinutes!: number;

  @Field(() => Int)
  wordsAdded!: number;

  @Field(() => Int)
  wordsLearned!: number;

  @Field(() => Int)
  quizAttempts!: number;

  @Field(() => Int)
  speakingSubmissions!: number;

  @Field(() => Int)
  homeworkReviewed!: number;

  @Field(() => Int)
  streakDays!: number;

  @Field({ nullable: true })
  lessonTypeLabel?: string;

  @Field(() => Int, { nullable: true })
  groupLessonsCompleted?: number;

  @Field(() => Int, { nullable: true })
  individualLessonsCompleted?: number;

  @Field(() => Int, { nullable: true })
  pricePerLessonMinor?: number;

  @Field({ nullable: true })
  currency?: string;

  @Field(() => Int, { nullable: true })
  paidInPeriodMinor?: number;

  @Field(() => Int, { nullable: true })
  lessonsGrantedInPeriod?: number;

  @Field(() => Int, { nullable: true })
  billableMinor?: number;
}

@ObjectType()
export class StatisticsBillingOverviewType {
  @Field()
  currency!: string;

  @Field(() => Int)
  totalPaidInPeriodMinor!: number;

  @Field(() => Int)
  totalLessonsGrantedInPeriod!: number;

  @Field(() => Int)
  totalBillableMinor!: number;

  @Field(() => Int, { nullable: true })
  groupLessonsCount?: number;

  @Field(() => Int, { nullable: true })
  groupRevenueMinor?: number;
}

@ObjectType()
export class StatisticsDateRangeType {
  @Field()
  from!: string;

  @Field()
  to!: string;
}

@ObjectType()
export class StatisticsDashboardType {
  @Field()
  layout!: string;

  @Field()
  subjectRole!: string;

  @Field()
  range!: string;

  @Field({ nullable: true })
  studentScope?: string;

  @Field({ nullable: true })
  statisticsFocus?: string;

  @Field()
  rangeLabel!: string;

  @Field(() => StatisticsDateRangeType)
  rangeBounds!: StatisticsDateRangeType;

  @Field()
  title!: string;

  @Field(() => Int)
  streakDays!: number;

  @Field(() => [StatisticsKpiType])
  kpis!: StatisticsKpiType[];

  @Field(() => StatisticsLessonsSectionType, { nullable: true })
  lessons?: StatisticsLessonsSectionType;

  @Field(() => StatisticsVocabularySectionType, { nullable: true })
  vocabulary?: StatisticsVocabularySectionType;

  @Field(() => StatisticsPracticeSectionType, { nullable: true })
  practice?: StatisticsPracticeSectionType;

  @Field(() => StatisticsQuizSectionType, { nullable: true })
  quiz?: StatisticsQuizSectionType;

  @Field(() => StatisticsSpeakingSectionType, { nullable: true })
  speaking?: StatisticsSpeakingSectionType;

  @Field(() => StatisticsDailyGoalsSectionType, { nullable: true })
  dailyGoals?: StatisticsDailyGoalsSectionType;

  @Field(() => StatisticsStaffOverviewType, { nullable: true })
  staffOverview?: StatisticsStaffOverviewType;

  @Field(() => StatisticsSchoolOverviewType, { nullable: true })
  schoolOverview?: StatisticsSchoolOverviewType;

  @Field(() => [StatisticsRosterEntryType], { nullable: true })
  roster?: StatisticsRosterEntryType[];

  @Field(() => StatisticsBillingOverviewType, { nullable: true })
  billingOverview?: StatisticsBillingOverviewType;

  @Field(() => StaffEarningsSectionType, { nullable: true })
  staffEarnings?: StaffEarningsSectionType;
}
