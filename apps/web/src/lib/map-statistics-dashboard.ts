import type {
  StatisticsDashboardDto,
  StatisticsDashboardFocus,
  StatisticsDashboardLayout,
  StatisticsKpiCategory,
  StaffEarningsSectionDto,
} from '@pkg/types';

export type StatisticsDashboardViewModel = {
  layout: StatisticsDashboardLayout;
  title: string;
  rangeLabel: string;
  kpis: StatisticsDashboardDto['kpis'];
  kpisByCategory: Array<{
    category: StatisticsKpiCategory;
    categoryLabel: string;
    items: StatisticsDashboardDto['kpis'];
  }>;
  lessonsTrend: Array<{ label: string; value: number }>;
  vocabularyTrend: Array<{ label: string; added: number; known: number; reviewed: number }>;
  lessonStatusBreakdown: Array<{ id: string; label: string; value: number }>;
  vocabStatusBreakdown: Array<{ id: string; label: string; value: number }>;
  practiceTrend: Array<{
    label: string;
    vocabularyMinutes: number;
    quizMinutes: number;
    speakingMinutes: number;
    gamesMinutes: number;
  }>;
  dailyGoalsTrend: Array<{ label: string; completionPercent: number; slotsCompleted: number }>;
  dailyGoalsSummary: {
    slotsCompleted: number;
    slotsAvailable: number;
    daysWithAllGoals: number;
    daysInRange: number;
  } | null;
  staffOverview: StatisticsDashboardDto['staffOverview'];
  schoolOverview: StatisticsDashboardDto['schoolOverview'];
  roster: StatisticsDashboardDto['roster'];
  studentScope?: StatisticsDashboardDto['studentScope'];
  billingOverview?: StatisticsDashboardDto['billingOverview'];
  staffEarnings?: StaffEarningsSectionDto;
  isStudentLayout: boolean;
};

const STUDENT_CATEGORY_ORDER: StatisticsKpiCategory[] = [
  'lessons',
  'vocabulary',
  'practice',
  'quiz',
  'speaking',
  'dailyGoals',
  'streak',
];

const STAFF_OPERATIONS_CATEGORY_ORDER: StatisticsKpiCategory[] = [
  'roster',
  'billing',
  'school',
  'lessons',
  'speaking',
];

const STAFF_LEARNING_CATEGORY_ORDER: StatisticsKpiCategory[] = [
  ...STAFF_OPERATIONS_CATEGORY_ORDER,
  'quiz',
  'vocabulary',
];

const CATEGORY_LABELS: Record<StatisticsKpiCategory, string> = {
  lessons: 'Lessons',
  vocabulary: 'Vocabulary',
  practice: 'Practice',
  quiz: 'Quizzes',
  speaking: 'Speaking',
  dailyGoals: 'Daily goals',
  streak: 'Streak',
  roster: 'Roster',
  school: 'School',
  billing: 'Payments',
};

function categoryOrderFor(
  layout: StatisticsDashboardLayout,
  focus: StatisticsDashboardFocus = 'operations',
): StatisticsKpiCategory[] {
  if (layout === 'student') return STUDENT_CATEGORY_ORDER;
  return focus === 'learning' ? STAFF_LEARNING_CATEGORY_ORDER : STAFF_OPERATIONS_CATEGORY_ORDER;
}

export function mapStatisticsDashboardToViewModel(
  dto: StatisticsDashboardDto,
): StatisticsDashboardViewModel {
  const order = categoryOrderFor(dto.layout, dto.statisticsFocus ?? 'operations');
  const kpisByCategory = order
    .map((category) => ({
      category,
      items: dto.kpis.filter((kpi) => kpi.category === category),
    }))
    .filter((group) => group.items.length > 0);

  return {
    layout: dto.layout,
    title: dto.title,
    rangeLabel: dto.rangeLabel,
    kpis: dto.kpis,
    kpisByCategory: kpisByCategory.map((group) => ({
      category: group.category,
      categoryLabel: CATEGORY_LABELS[group.category],
      items: group.items,
    })),
    lessonsTrend: dto.lessons?.trend ?? [],
    vocabularyTrend: dto.vocabulary?.trend ?? [],
    lessonStatusBreakdown: dto.lessons?.statusBreakdown ?? [],
    vocabStatusBreakdown: dto.vocabulary?.statusBreakdown ?? [],
    practiceTrend: dto.practice?.trend ?? [],
    dailyGoalsTrend: dto.dailyGoals?.trend ?? [],
    dailyGoalsSummary: dto.dailyGoals
      ? {
          slotsCompleted: dto.dailyGoals.slotsCompleted,
          slotsAvailable: dto.dailyGoals.slotsAvailable,
          daysWithAllGoals: dto.dailyGoals.daysWithAllGoals,
          daysInRange: dto.dailyGoals.daysInRange,
        }
      : null,
    staffOverview: dto.staffOverview,
    schoolOverview: dto.schoolOverview,
    roster: dto.roster ?? [],
    studentScope: dto.studentScope,
    billingOverview: dto.billingOverview,
    staffEarnings: dto.staffEarnings,
    isStudentLayout: dto.layout === 'student',
  };
}

export const KPI_TOOLTIPS: Record<string, string> = {
  'lessons-completed': 'Lessons marked completed in the selected period.',
  'lessons-hours': 'Total duration of completed lessons in the period.',
  'lessons-rate': 'Completed lessons divided by all scheduled lessons in the period.',
  'lessons-cancel-rate': 'Cancelled lessons as a share of all scheduled lessons in the period.',
  'vocab-added': 'New word cards created in the period.',
  'vocab-reviewed': 'Cards with a review event in the period.',
  'vocab-learned': 'Cards marked learned (known) in the period.',
  'practice-min': 'Practice hub minutes (vocabulary, quiz, speaking, games).',
  'quiz-attempts': 'Finished quiz attempts in the period.',
  'quiz-perfect': 'Quizzes with a near-perfect score in the period.',
  'speaking-sub': 'Speaking recordings submitted in the period.',
  'speaking-min': 'Total speaking practice minutes in the period.',
  'goals-days': 'Days where all four daily goals were completed.',
  streak: 'Current learning streak (days).',
  'staff-active-students': 'Students with at least one scheduled lesson in the period.',
  'staff-roster-size': 'Students assigned to you (teacher) or in the school (admin).',
  'staff-inactive': 'Roster students with no lessons, practice, quizzes, speaking, or new words in the period.',
  'homework-reviewed': 'Lessons where homework was marked reviewed in the period.',
  'speaking-reviewed': 'Speaking submissions you reviewed in the period.',
  'speaking-pending': 'Speaking submissions from your students still awaiting review.',
  'school-teachers': 'Staff accounts with a teaching role in the school.',
  'school-utilization': 'Completed lessons divided by all scheduled lessons school-wide.',
  'school-quizzes': 'Quiz attempts finished by any student in the period.',
  'school-words-added': 'New vocabulary cards created school-wide in the period.',
  'school-speaking-sub': 'Speaking recordings submitted by any student in the period.',
  'billing-paid': 'Sum of successful student payments in the selected period.',
  'billing-lessons-credited': 'Lesson credits added to balances (purchase + manual) in the period.',
  'billing-billable': 'Completed lessons multiplied by each student’s price per lesson.',
};
