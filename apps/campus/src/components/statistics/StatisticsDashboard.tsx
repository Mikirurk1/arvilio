'use client';

import { useMemo, useState } from 'react';
import type { StatisticsStudentScope } from '@pkg/types';
import type { StatisticsDashboardDto, StatisticsKpiCategory, StatsRange } from '@pkg/types';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  Flame,
  GraduationCap,
  MessageSquare,
  Target,
  Users,
  Wallet,
} from 'lucide-react';
import {
  mapStatisticsDashboardToViewModel,
} from '../../lib/map-statistics-dashboard';
import { stripGroupContentFromStatisticsView } from '../../lib/group-lessons-feature';
import { useSchoolGroupLessons } from '../../hooks/use-school-group-lessons';
import {
  EmptyStateCard,
  Field,
  PanelCard,
  SectionHeader,
  SegmentedControl,
} from '../ui';
import styles from './StatisticsDashboard.module.scss';
import { StatisticsSection } from './StatisticsSection';
import { StatisticsKpiGrid } from './StatisticsKpiGrid';
import { StatisticsDashboardCharts } from './StatisticsDashboardCharts';

const KPI_CATEGORY_ICONS: Record<StatisticsKpiCategory, LucideIcon> = {
  lessons: CalendarCheck,
  vocabulary: BookOpen,
  practice: GraduationCap,
  quiz: Target,
  speaking: MessageSquare,
  dailyGoals: Flame,
  streak: Flame,
  roster: Users,
  school: Users,
  billing: Wallet,
};

const KPI_CATEGORY_HINTS: Partial<Record<StatisticsKpiCategory, string>> = {
  lessons: 'Lesson counts and hours for the selected period.',
  vocabulary: 'Words added, reviewed, and marked learned.',
  practice: 'Practice minutes across vocabulary, quizzes, and speaking.',
  quiz: 'Quiz attempts and scores in this period.',
  speaking: 'Speaking submissions and reviews.',
  dailyGoals: 'Daily goal slot completion.',
  streak: 'Consecutive active days.',
  roster: 'Aggregate counts across your student roster.',
  school: 'School-wide activity snapshot.',
  billing: 'Payments and billable lesson totals.',
};

type AllStudentsRosterView = 'lessons_billing' | 'activity';

type StatisticsDashboardProps = {
  dashboard: StatisticsDashboardDto | null;
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  range: StatsRange;
  onRangeChange: (range: StatsRange) => void;
  customDateFrom?: string;
  customDateTo?: string;
  onCustomDateFromChange?: (value: string) => void;
  onCustomDateToChange?: (value: string) => void;
  customDateMax?: string;
  studentScope?: StatisticsStudentScope;
  onStudentScopeChange?: (scope: StatisticsStudentScope) => void;
  allStudentsRosterView?: AllStudentsRosterView;
  onAllStudentsRosterViewChange?: (view: AllStudentsRosterView) => void;
  variant?: 'default' | 'profile';
  profileIntro?: string;
};

export function StatisticsDashboard({
  dashboard,
  loading = false,
  refreshing = false,
  error = null,
  range,
  onRangeChange,
  customDateFrom,
  customDateTo,
  onCustomDateFromChange,
  onCustomDateToChange,
  customDateMax,
  studentScope = 'my_students',
  onStudentScopeChange,
  allStudentsRosterView: allStudentsRosterViewProp,
  onAllStudentsRosterViewChange,
  variant = 'default',
  profileIntro,
}: StatisticsDashboardProps) {
  const isProfile = variant === 'profile';
  const [allStudentsRosterViewInternal, setAllStudentsRosterViewInternal] =
    useState<AllStudentsRosterView>('lessons_billing');
  const allStudentsRosterView = allStudentsRosterViewProp ?? allStudentsRosterViewInternal;
  const setAllStudentsRosterView = (view: AllStudentsRosterView) => {
    onAllStudentsRosterViewChange?.(view);
    if (allStudentsRosterViewProp === undefined) {
      setAllStudentsRosterViewInternal(view);
    }
  };

  const { enabled: groupLessonsEnabled } = useSchoolGroupLessons();
  const view = useMemo(() => {
    if (!dashboard) return null;
    const mapped = mapStatisticsDashboardToViewModel(dashboard);
    return stripGroupContentFromStatisticsView(mapped, groupLessonsEnabled);
  }, [dashboard, groupLessonsEnabled]);

  if (loading && !view) {
    return <p className={styles.loadingNote}>Loading statistics from the server…</p>;
  }

  if (error && !view) {
    return <EmptyStateCard title="Could not load statistics" description={error} />;
  }

  if (!view) {
    return (
      <EmptyStateCard
        title="No statistics"
        description="Select a period to load your dashboard."
      />
    );
  }

  const isStudent = view.isStudentLayout;
  const isTeacherLayout = view.layout === 'teacher';
  const showLessonsBillingRoster = !isStudent && allStudentsRosterView === 'lessons_billing';
  const showTeacherLessonsRoster = showLessonsBillingRoster && isTeacherLayout;
  const showAdminBillingRoster = showLessonsBillingRoster && !isTeacherLayout;
  const showRosterViewSwitcher = isProfile && !isStudent;
  const goals = view.dailyGoalsSummary;
  const goalSlotPercent =
    goals && goals.slotsAvailable > 0
      ? Math.round((goals.slotsCompleted / goals.slotsAvailable) * 100)
      : 0;

  const summaryKpis = view.kpis.slice(0, 4);
  const rangeNoteText = isStudent
    ? `${view.rangeLabel}: lessons by calendar date; practice and quizzes by activity timestamp (UTC).`
    : showAdminBillingRoster
      ? `${view.rangeLabel}: lessons, cancellations, and payments per student.`
      : showTeacherLessonsRoster
        ? `${view.rangeLabel}: lesson counts per student (no student pricing).`
        : `${view.rangeLabel}: per-student learning activity (practice, vocabulary, quizzes, speaking).`;

  const suppressFilterScroll = isProfile;

  const rangeOptions = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
    ...(isProfile ? [{ value: 'custom', label: 'Custom' }] : []),
  ];

  const rangeControl = (
    <SegmentedControl
      className={styles.rangeSwitch}
      ariaLabel="Statistics range"
      value={range}
      onValueChange={(value) => onRangeChange(value as StatsRange)}
      optionClassName={styles.rangeBtn}
      activeOptionClassName={styles.rangeBtnActive}
      preventScrollOnPointerDown={suppressFilterScroll}
      options={rangeOptions}
    />
  );

  const customRangeControl =
    isProfile && range === 'custom' && customDateFrom != null && customDateTo != null ? (
      <div className={styles.customRangeRow}>
        <Field
          type="date"
          label="From"
          rootClassName={styles.customRangeFieldRoot}
          labelClassName={styles.customRangeLabel}
          className={[styles.customRangeTrigger, styles.customRangeField].filter(Boolean).join(' ')}
          value={customDateFrom}
          max={customDateTo}
          onChange={(event) => onCustomDateFromChange?.(event.target.value)}
        />
        <span className={styles.customDateSep} aria-hidden>–</span>
        <Field
          type="date"
          label="To"
          rootClassName={styles.customRangeFieldRoot}
          labelClassName={styles.customRangeLabel}
          className={[styles.customRangeTrigger, styles.customRangeField].filter(Boolean).join(' ')}
          value={customDateTo}
          min={customDateFrom}
          max={customDateMax}
          onChange={(event) => onCustomDateToChange?.(event.target.value)}
        />
      </div>
    ) : null;

  const rangeFilterGroup = (
    <div className={styles.rangeFilterGroup}>
      {rangeControl}
      {customRangeControl}
    </div>
  );

  const scopeControl =
    onStudentScopeChange != null ? (
      <SegmentedControl
        className={styles.rangeSwitch}
        ariaLabel="Student scope"
        value={studentScope}
        onValueChange={(value) => onStudentScopeChange(value as StatisticsStudentScope)}
        optionClassName={styles.rangeBtn}
        activeOptionClassName={styles.rangeBtnActive}
        preventScrollOnPointerDown={suppressFilterScroll}
        options={[
          { value: 'all', label: 'All students' },
          { value: 'my_students', label: 'My students' },
        ]}
      />
    ) : null;

  const rosterViewControl = showRosterViewSwitcher ? (
    <SegmentedControl
      className={styles.rangeSwitch}
      ariaLabel="Student roster view"
      value={allStudentsRosterView}
      onValueChange={(value) => setAllStudentsRosterView(value as AllStudentsRosterView)}
      optionClassName={styles.rangeBtn}
      activeOptionClassName={styles.rangeBtnActive}
      preventScrollOnPointerDown={suppressFilterScroll}
      options={[
        { value: 'lessons_billing', label: 'Lessons & payments' },
        { value: 'activity', label: 'Learning activity' },
      ]}
    />
  ) : null;

  const profileControls = (
    <div className={styles.profileControls}>
      {scopeControl}
      {rosterViewControl}
      {rangeFilterGroup}
    </div>
  );

  const chartBoxClass = isProfile ? `${styles.chartBox} ${styles.chartBoxProfile}` : styles.chartBox;
  const chartGridClass = isProfile ? styles.statsChartGrid : styles.chartGrid;
  const chartCardClass = [styles.chartCard, isProfile ? styles.chartCardProfile : ''].filter(Boolean).join(' ');
  const pieRadius = isProfile ? 64 : 72;

  const wrapperClass = [
    isProfile ? styles.wrapperProfile : styles.wrapper,
    refreshing ? styles.wrapperRefreshing : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass} aria-busy={refreshing || undefined}>
      {isProfile ? (
        <>
          <section className={styles.statsSummary} aria-label="Statistics overview">
            <div className={styles.statsSummaryIntro}>
              <span className={styles.statsSummaryIcon} aria-hidden>
                <BarChart3 size={18} />
              </span>
              <div>
                <h3 className={styles.statsSummaryTitle}>{view.title}</h3>
                <p className={styles.statsSummaryText}>
                  {view.rangeLabel}
                  {profileIntro ? ` · ${profileIntro}` : ''}
                </p>
              </div>
            </div>
            {summaryKpis.length > 0 ? (
              <dl className={styles.statsSummaryGrid}>
                {summaryKpis.map((kpi) => (
                  <div key={kpi.id} className={styles.statsSummaryItem}>
                    <dt>{kpi.label}</dt>
                    <dd>{kpi.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>

          <section className={styles.statsToolbar} aria-label="Statistics filters">
            <p className={styles.statsToolbarNote}>{rangeNoteText}</p>
            <div className={styles.statsToolbarControls}>
              {isStudent ? rangeFilterGroup : profileControls}
            </div>
          </section>

          <div className={styles.statsSections}>
            {view.kpisByCategory.map((group) => {
              const Icon = KPI_CATEGORY_ICONS[group.category];
              return (
                <StatisticsSection
                  key={group.category}
                  icon={<Icon size={16} />}
                  title={group.categoryLabel}
                  description={KPI_CATEGORY_HINTS[group.category]}
                >
                  <StatisticsKpiGrid
                    kpisByCategory={[group]}
                    isProfile
                    withSectionHeaders={false}
                  />
                </StatisticsSection>
              );
            })}
          </div>
        </>
      ) : (
        <PanelCard className={styles.rangeCard}>
          <SectionHeader title={view.title} action={rangeControl} />
          <p className={styles.rangeNote}>
            {view.rangeLabel}: lessons by calendar date; other activity by timestamp in this period.
          </p>
          <StatisticsKpiGrid kpisByCategory={view.kpisByCategory} isProfile={false} />
        </PanelCard>
      )}

      <StatisticsDashboardCharts
        view={view}
        isProfile={isProfile}
        isStudent={isStudent}
        showLessonsBillingRoster={showLessonsBillingRoster}
        showAdminBillingRoster={showAdminBillingRoster}
        showTeacherLessonsRoster={showTeacherLessonsRoster}
        chartBoxClass={chartBoxClass}
        chartCardClass={chartCardClass}
        chartGridClass={chartGridClass}
        pieRadius={pieRadius}
        goals={goals}
        goalSlotPercent={goalSlotPercent}
      />
    </div>
  );
}
