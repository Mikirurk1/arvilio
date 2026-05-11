'use client';

import { useMemo, useState } from 'react';
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
import { getRoleStatisticsDashboard, type StatsRange, type UserRoleId } from '../../mocks';
import { Info } from 'lucide-react';
import { SectionHeader, StatTile, SurfaceCard, Tooltip as AppTooltip } from '../ui';
import styles from './StatisticsDashboard.module.scss';

const PIE_COLORS = ['var(--green)', 'var(--blue)', 'var(--purple)', 'var(--text-faint)'];
const tooltipStyle = {
  borderColor: 'var(--border)',
  borderRadius: 10,
  backgroundColor: 'var(--card)',
};
const tooltipLabelStyle = { color: 'var(--text-primary)' };
const tooltipItemStyle = { color: 'var(--text-secondary)' };
const legendStyle = { color: 'var(--text-secondary)' };

type StatisticsDashboardProps = {
  roleId: UserRoleId;
  currentUserId: number;
  subjectStudentId?: number;
};

export function StatisticsDashboard({ roleId, currentUserId, subjectStudentId }: StatisticsDashboardProps) {
  const [range, setRange] = useState<StatsRange>('week');
  const [hoveredKpiId, setHoveredKpiId] = useState<number | null>(null);
  const [hoveredKpiEl, setHoveredKpiEl] = useState<HTMLElement | null>(null);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [hoveredSectionEl, setHoveredSectionEl] = useState<HTMLElement | null>(null);
  const data = useMemo(
    () =>
      getRoleStatisticsDashboard({
        roleId,
        userId: currentUserId,
        subjectStudentId,
        rangePreset: range,
      }),
    [currentUserId, range, roleId, subjectStudentId],
  );

  const goalTarget =
    range === 'week'
      ? data.goals.weeklyMinutes
      : range === 'month'
        ? data.goals.monthlyMinutes
        : range === 'quarter'
          ? data.goals.quarterlyMinutes
          : data.goals.yearlyMinutes;
  const goalProgress = goalTarget > 0 ? Math.min(100, Math.round((data.goals.currentMinutes / goalTarget) * 100)) : 0;
  const hasTimeTrend = data.timeTrend.length > 0;
  const hasVocabularyTrend = data.vocabularyTrend.some((point) => point.added > 0 || point.known > 0);
  const hasStatusBreakdown = data.statusBreakdown.some((slice) => slice.value > 0);
  const kpiInfoById: Record<number, string> = {
    1: 'Number of completed lessons within the selected period.',
    2: 'Number of cancelled lessons within the selected period.',
    3: 'Total hours of all lessons in the selected period.',
    4: 'Share of completed lessons from all scheduled lessons in the selected period.',
    5: 'Count of quiz sessions completed in the selected period.',
    6: 'Count of vocabulary items added in the selected period.',
    7: 'Count of speaking practice sessions in the selected period.',
  };
  const sectionInfo: Record<string, string> = {
    lessonsTrend: 'Shows how many lessons happened in each bucket of the selected range.',
    vocabularyTrend: 'Compares vocabulary items added vs moved to known across the selected range.',
    statusMix: 'Distribution of lesson statuses: completed, planned, and cancelled.',
    goalsDeltas: 'Goal progress and key delta indicators against the previous period.',
  };

  const renderSectionInfo = (id: string) => (
    <>
      <button
        type="button"
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
      </button>
      <AppTooltip
        open={hoveredSectionId === id}
        targetEl={hoveredSectionEl}
        placement="top"
        content={sectionInfo[id]}
      />
    </>
  );

  return (
    <div className={styles.wrapper}>
      <SurfaceCard className={styles.rangeCard}>
        <SectionHeader
          title={data.title}
          action={
            <div className={styles.rangeSwitch} role="tablist" aria-label="Statistics range">
              {(['week', 'month', 'quarter', 'year'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.rangeBtn} ${range === value ? styles.rangeBtnActive : ''}`}
                  onClick={() => setRange(value)}
                >
                  {value === 'week'
                    ? 'Week'
                    : value === 'month'
                      ? 'Month'
                      : value === 'quarter'
                        ? 'Quarter'
                        : 'Year'}
                </button>
              ))}
            </div>
          }
        />
        <p className={styles.rangeNote}>
          {data.rangeLabel}: includes lessons by start date in this period.
        </p>
        <div className={styles.kpiGrid}>
          {data.kpis.map((kpi) => (
            <div key={kpi.id} className={styles.kpiWrap}>
              <button
                type="button"
                className={styles.kpiInfoBtn}
                aria-label={`About ${kpi.label}`}
                onMouseEnter={(event) => {
                  setHoveredKpiId(kpi.id);
                  setHoveredKpiEl(event.currentTarget);
                }}
                onMouseLeave={() => {
                  setHoveredKpiId(null);
                  setHoveredKpiEl(null);
                }}
                onFocus={(event) => {
                  setHoveredKpiId(kpi.id);
                  setHoveredKpiEl(event.currentTarget);
                }}
                onBlur={() => {
                  setHoveredKpiId(null);
                  setHoveredKpiEl(null);
                }}
              >
                <Info size={14} />
              </button>
              <StatTile
                label={kpi.label}
                value={kpi.value}
                subtext={kpi.deltaLabel}
                className={styles.kpiTile}
                subtextClassName={kpi.trend === 'up' ? styles.kpiUp : kpi.trend === 'down' ? styles.kpiDown : ''}
              />
              <AppTooltip
                open={hoveredKpiId === kpi.id}
                targetEl={hoveredKpiEl}
                placement="top"
                content={kpiInfoById[kpi.id] ?? 'Statistics metric for selected period.'}
              />
            </div>
          ))}
        </div>
      </SurfaceCard>

      <div className={styles.chartGrid}>
        <SurfaceCard className={styles.chartCard}>
          <SectionHeader title="Lessons trend" action={renderSectionInfo('lessonsTrend')} />
          <div className={styles.chartBox}>
            {hasTimeTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--text-faint)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-faint)" tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                  <Line type="monotone" dataKey="value" stroke="var(--green)" strokeWidth={2} dot={{ r: 3 }} name="Lessons" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>No lesson data in selected range.</div>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className={styles.chartCard}>
          <SectionHeader title="Vocabulary added vs known" action={renderSectionInfo('vocabularyTrend')} />
          <div className={styles.chartBox}>
            {hasVocabularyTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.vocabularyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--text-faint)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-faint)" tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                  <Legend wrapperStyle={legendStyle} />
                  <Bar dataKey="added" fill="var(--blue)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="known" fill="var(--green)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>No vocabulary transitions in selected range.</div>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className={styles.chartCard}>
          <SectionHeader title="Lesson status mix" action={renderSectionInfo('statusMix')} />
          <div className={styles.chartBox}>
            {hasStatusBreakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                  <Legend wrapperStyle={legendStyle} />
                  <Pie data={data.statusBreakdown} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={72}>
                    {data.statusBreakdown.map((entry, index) => (
                      <Cell key={entry.id} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>No lesson status data in selected range.</div>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className={styles.chartCard}>
          <SectionHeader title="Goal and deltas" action={renderSectionInfo('goalsDeltas')} />
          <div className={styles.goalBlock}>
            <p className={styles.goalValue}>
              {data.goals.currentMinutes} / {goalTarget} min
            </p>
            <div className={styles.goalTrack} aria-label="Goal progress">
              <span className={styles.goalFill} style={{ width: `${goalProgress}%` }} />
            </div>
            <p className={styles.goalMeta}>{goalProgress}% completed in selected range</p>
            <div className={styles.deltaGrid}>
              {data.deltas.map((delta) => (
                <div key={delta.id} className={styles.deltaTile}>
                  <p className={styles.deltaLabel}>{delta.label}</p>
                  <p className={styles.deltaValue}>{delta.value}</p>
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

