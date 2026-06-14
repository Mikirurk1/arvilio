'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BookOpen,
  Coins,
  GraduationCap,
  Info,
  PieChart as PieChartIcon,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { StatisticsDashboardViewModel } from '../../lib/map-statistics-dashboard';
import {
  staffCompensationModeLabel,
  staffPayFrequencyLabel,
  staffPayoutStatusLabel,
} from '../../lib/staff-payout-ui';
import { formatMoneyMinor } from '../../lib/format-money';
import { Button, StatTile, Tooltip as AppTooltip } from '../ui';
import { DashboardSection } from './DashboardSection';
import { StatisticsRosterTable } from './StatisticsRosterTable';
import {
  AXIS_TICK,
  CHART_LEGEND_STYLE,
  CHART_MARGIN,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
  PIE_COLORS,
  SECTION_INFO,
} from './statistics-chart-config';
import styles from './StatisticsDashboard.module.scss';

interface DailyGoalsSummary {
  slotsCompleted: number;
  slotsAvailable: number;
  daysWithAllGoals: number;
  daysInRange: number;
}

interface Props {
  view: StatisticsDashboardViewModel;
  isProfile: boolean;
  isStudent: boolean;
  showLessonsBillingRoster: boolean;
  showAdminBillingRoster: boolean;
  showTeacherLessonsRoster: boolean;
  chartBoxClass: string;
  chartCardClass: string;
  chartGridClass: string;
  pieRadius: number;
  goals: DailyGoalsSummary | null | undefined;
  goalSlotPercent: number;
}

export function StatisticsDashboardCharts({
  view,
  isProfile,
  isStudent,
  showLessonsBillingRoster,
  showAdminBillingRoster,
  showTeacherLessonsRoster,
  chartBoxClass,
  chartCardClass,
  chartGridClass,
  pieRadius,
  goals,
  goalSlotPercent,
}: Props) {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [hoveredSectionEl, setHoveredSectionEl] = useState<HTMLElement | null>(null);

  const renderSectionInfo = (id: string) => (
    <>
      <Button
        type="button"
        variant="ghost"
        className={styles.sectionInfoBtn}
        aria-label="About this section"
        onMouseEnter={(event) => {
          setHoveredSectionId(id);
          setHoveredSectionEl(event.currentTarget);
        }}
        onMouseLeave={() => {
          setHoveredSectionId(null);
          setHoveredSectionEl(null);
        }}
        onFocus={(event) => {
          setHoveredSectionId(id);
          setHoveredSectionEl(event.currentTarget);
        }}
        onBlur={() => {
          setHoveredSectionId(null);
          setHoveredSectionEl(null);
        }}
      >
        <Info size={14} />
      </Button>
      <AppTooltip
        open={hoveredSectionId === id}
        targetEl={hoveredSectionEl}
        placement="top"
        content={SECTION_INFO[id]}
      />
    </>
  );

  const staffEarnings = view.staffEarnings;
  const hasLessonsTrend = view.lessonsTrend.length > 0;
  const hasVocabularyTrend = view.vocabularyTrend.some(
    (point) => point.added > 0 || point.known > 0 || point.reviewed > 0,
  );
  const hasLessonStatus = view.lessonStatusBreakdown.some((slice) => slice.value > 0);
  const hasVocabStatus = view.vocabStatusBreakdown.some((slice) => slice.value > 0);
  const hasPracticeTrend = view.practiceTrend.some(
    (point) =>
      point.vocabularyMinutes > 0 ||
      point.quizMinutes > 0 ||
      point.speakingMinutes > 0 ||
      point.gamesMinutes > 0,
  );
  const hasDailyGoalsTrend = view.dailyGoalsTrend.length > 0;

  return (
    <>
      {!isStudent && showLessonsBillingRoster && staffEarnings ? (
        <DashboardSection
          profile={isProfile}
          icon={<Coins size={16} />}
          title="My earnings"
          description="Accrued pay, recorded payouts, and outstanding balance for this period."
          className={chartCardClass}
        >
          <div className={styles.earningsGrid}>
            <StatTile label="Completed lessons" value={String(staffEarnings.completedLessons)} subtext={`${staffEarnings.lessonHours} hours`} />
            <StatTile
              label="Accrued"
              value={formatMoneyMinor(staffEarnings.accruedMinor, staffEarnings.currency)}
              subtext={staffCompensationModeLabel(staffEarnings.mode)}
            />
            <StatTile
              label="Paid"
              value={formatMoneyMinor(staffEarnings.paidMinor, staffEarnings.currency)}
              subtext={staffPayFrequencyLabel(staffEarnings.payFrequency)}
            />
            <StatTile
              label="Outstanding (net)"
              value={formatMoneyMinor(staffEarnings.outstandingMinor, staffEarnings.currency)}
              subtext={`Next pay ${new Date(staffEarnings.nextPayDate).toLocaleDateString()} · ${staffPayoutStatusLabel(staffEarnings.payoutStatus)}`}
            />
          </div>
          <div className={chartBoxClass}>
            {staffEarnings.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={staffEarnings.trend.map((point) => ({
                    label: point.label,
                    accrued: point.accruedMinor / 100,
                    paid: point.paidMinor / 100,
                  }))}
                  margin={CHART_MARGIN}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={36} />
                  <ChartTooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} />
                  <Legend wrapperStyle={CHART_LEGEND_STYLE} iconSize={10} />
                  <Line type="monotone" dataKey="accrued" stroke="var(--blue)" strokeWidth={2} name="Accrued" />
                  <Line type="monotone" dataKey="paid" stroke="var(--green)" strokeWidth={2} name="Paid" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>No earnings trend in selected range.</div>
            )}
          </div>
        </DashboardSection>
      ) : null}

      <div className={chartGridClass}>
        <DashboardSection
          profile={isProfile}
          icon={<TrendingUp size={16} />}
          title="Lessons trend"
          description={SECTION_INFO.lessonsTrend}
          aside={renderSectionInfo('lessonsTrend')}
          className={chartCardClass}
        >
          <div className={chartBoxClass}>
            {hasLessonsTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={view.lessonsTrend} margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                  <ChartTooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} />
                  <Line type="monotone" dataKey="value" stroke="var(--green)" strokeWidth={2} dot={{ r: 3 }} name="Lessons" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>No lesson data in selected range.</div>
            )}
          </div>
        </DashboardSection>

        {!isStudent ? (
          <StatisticsRosterTable
            roster={view.roster}
            studentScope={view.studentScope}
            showAdminBillingRoster={showAdminBillingRoster}
            showTeacherLessonsRoster={showTeacherLessonsRoster}
            isProfile={isProfile}
            chartCardClass={chartCardClass}
            renderSectionInfo={renderSectionInfo}
          />
        ) : null}

        {isStudent ? (
          <DashboardSection
            profile={isProfile}
            icon={<BookOpen size={16} />}
            title="Vocabulary activity"
            description={SECTION_INFO.vocabularyTrend}
            aside={renderSectionInfo('vocabularyTrend')}
            className={chartCardClass}
          >
            <div className={chartBoxClass}>
              {hasVocabularyTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={view.vocabularyTrend} margin={CHART_MARGIN} barGap={4} barCategoryGap="18%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                    <ChartTooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} />
                    <Legend wrapperStyle={CHART_LEGEND_STYLE} iconSize={10} />
                    <Bar dataKey="added" fill="var(--blue)" radius={[6, 6, 0, 0]} name="Added" />
                    <Bar dataKey="reviewed" fill="var(--purple)" radius={[6, 6, 0, 0]} name="Reviewed" />
                    <Bar dataKey="known" fill="var(--green)" radius={[6, 6, 0, 0]} name="Learned" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyChart}>No vocabulary activity in selected range.</div>
              )}
            </div>
          </DashboardSection>
        ) : null}

        <DashboardSection
          profile={isProfile}
          icon={<PieChartIcon size={16} />}
          title="Lesson status mix"
          description={SECTION_INFO.lessonStatusMix}
          aside={renderSectionInfo('lessonStatusMix')}
          className={chartCardClass}
        >
          <div className={chartBoxClass}>
            {hasLessonStatus ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={CHART_MARGIN}>
                  <ChartTooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} />
                  <Legend wrapperStyle={CHART_LEGEND_STYLE} iconSize={10} />
                  <Pie data={view.lessonStatusBreakdown} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={pieRadius}>
                    {view.lessonStatusBreakdown.map((entry, index) => (
                      <Cell key={entry.id} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>No lesson status data in selected range.</div>
            )}
          </div>
        </DashboardSection>

        {isStudent ? (
          <DashboardSection
            profile={isProfile}
            icon={<PieChartIcon size={16} />}
            title="Deck status mix"
            description={SECTION_INFO.vocabStatusMix}
            aside={renderSectionInfo('vocabStatusMix')}
            className={chartCardClass}
          >
            <div className={chartBoxClass}>
              {hasVocabStatus ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={CHART_MARGIN}>
                    <ChartTooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} />
                    <Legend wrapperStyle={CHART_LEGEND_STYLE} iconSize={10} />
                    <Pie data={view.vocabStatusBreakdown} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={pieRadius}>
                      {view.vocabStatusBreakdown.map((entry, index) => (
                        <Cell key={entry.id} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyChart}>No vocabulary cards yet.</div>
              )}
            </div>
          </DashboardSection>
        ) : null}

        {isStudent ? (
          <DashboardSection
            profile={isProfile}
            icon={<GraduationCap size={16} />}
            title="Practice by type"
            description={SECTION_INFO.practiceTrend}
            aside={renderSectionInfo('practiceTrend')}
            className={chartCardClass}
          >
            <div className={chartBoxClass}>
              {hasPracticeTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={view.practiceTrend} margin={CHART_MARGIN}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                    <ChartTooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} />
                    <Legend wrapperStyle={CHART_LEGEND_STYLE} iconSize={10} />
                    <Bar dataKey="vocabularyMinutes" stackId="practice" fill="var(--blue)" name="Vocabulary" />
                    <Bar dataKey="quizMinutes" stackId="practice" fill="var(--green)" name="Quiz" />
                    <Bar dataKey="speakingMinutes" stackId="practice" fill="var(--purple)" name="Speaking" />
                    <Bar dataKey="gamesMinutes" stackId="practice" fill="var(--purple)" name="Games" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyChart}>No practice sessions in selected range.</div>
              )}
            </div>
          </DashboardSection>
        ) : null}

        {isStudent ? (
          <>
            <DashboardSection
              profile={isProfile}
              icon={<Target size={16} />}
              title="Daily goals"
              description={SECTION_INFO.dailyGoalsSummary}
              aside={renderSectionInfo('dailyGoalsSummary')}
              className={chartCardClass}
            >
              <div className={styles.goalBlock}>
                {goals ? (
                  <>
                    <p className={styles.goalValue}>
                      {goals.slotsCompleted} / {goals.slotsAvailable} goal slots
                    </p>
                    <div className={styles.goalTrack} aria-label="Daily goals slot completion">
                      <span className={styles.goalFill} style={{ width: `${goalSlotPercent}%` }} />
                    </div>
                    <p className={styles.goalMeta}>
                      {goals.daysWithAllGoals} of {goals.daysInRange} days with all four goals
                      completed ({goalSlotPercent}% of slots)
                    </p>
                  </>
                ) : (
                  <p className={styles.goalMeta}>Daily goal data unavailable.</p>
                )}
              </div>
            </DashboardSection>

            <DashboardSection
              profile={isProfile}
              icon={<TrendingUp size={16} />}
              title="Daily goals trend"
              description={SECTION_INFO.dailyGoalsTrend}
              aside={renderSectionInfo('dailyGoalsTrend')}
              className={chartCardClass}
            >
              <div className={chartBoxClass}>
                {hasDailyGoalsTrend ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={view.dailyGoalsTrend} margin={CHART_MARGIN}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={32} domain={[0, 100]} allowDecimals={false} />
                      <ChartTooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} />
                      <Line
                        type="monotone"
                        dataKey="completionPercent"
                        stroke="var(--blue)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Completion %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.emptyChart}>No daily goal history in selected range.</div>
                )}
              </div>
            </DashboardSection>
          </>
        ) : null}
      </div>
    </>
  );
}
