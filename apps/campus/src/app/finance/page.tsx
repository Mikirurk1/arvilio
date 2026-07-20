'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { defaultCustomStatsDateKeys, utcDateKey } from '@pkg/types';
import type { StatsRange, StaffFinanceStaffRowDto } from '@pkg/types';
import { RefreshCw } from 'lucide-react';
import {
  Button,
  EmptyStateCard,
  PageHeader,
  SectionHeader,
  StatTile,
  TabPanelCard,
} from '../../components/ui';
import { StatsRangeFilter } from '../../components/statistics/StatsRangeFilter';
import {
  RecordStaffPayoutModal,
  StaffPayoutHistoryPanel,
  StaffPayoutStatusBadge,
  majorInputToMinorPositive,
} from '../../features/staff-payout';
import staffPayoutStyles from '../../features/staff-payout/staff-payout.module.scss';
import { formatMoneyMinor } from '../../lib/format-money';
import { useOptionalAuth } from '../../lib/auth-context';
import { canRoleAccessPathname } from '../../lib/auth/route-policy';
import { useActiveRoleKey } from '../../lib/active-user';
import { staffCompensationModeLabel } from '../../lib/staff-payout-ui';
import { useCampusT } from '../../lib/cms';
import { useFinanceStore } from '../../stores/finance-store';
import styles from './page.module.scss';

const CHART_MARGIN = { top: 8, right: 12, left: 0, bottom: 4 };
const AXIS_TICK = { fontSize: 11, fill: 'var(--text-tertiary)' };
const tooltipStyle = {
  borderColor: 'var(--border)',
  borderRadius: 10,
  backgroundColor: 'var(--card)',
};

const ROLE_LABEL: Record<string, string> = {
  teacher: 'staff.role.teacher',
  admin: 'staff.role.admin',
  super_admin: 'staff.role.superAdmin',
};

export default function FinancePage() {
  const t = useCampusT();
  const auth = useOptionalAuth();
  const roleKey = useActiveRoleKey();
  const currentUserId = auth?.user?.id;
  const canLoadFinance = Boolean(auth.user) && canRoleAccessPathname('/finance', roleKey);
  const overviewSlice = useFinanceStore((s) => s.overview);
  const fetchOverview = useFinanceStore((s) => s.fetchOverview);
  const recordPayout = useFinanceStore((s) => s.recordPayout);
  const [range, setRange] = useState<StatsRange>('month');
  const [customDateFrom, setCustomDateFrom] = useState(() => defaultCustomStatsDateKeys().from);
  const [customDateTo, setCustomDateTo] = useState(() => defaultCustomStatsDateKeys().to);
  const customDateMax = utcDateKey(new Date());
  const [selectedStaff, setSelectedStaff] = useState<StaffFinanceStaffRowDto | null>(null);
  const [amountMajor, setAmountMajor] = useState('');
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [recording, setRecording] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [payoutHistoryRefreshToken, setPayoutHistoryRefreshToken] = useState(0);

  const load = useCallback(async () => {
    await fetchOverview({
      range,
      rangeFrom: range === 'custom' ? customDateFrom : undefined,
      rangeTo: range === 'custom' ? customDateTo : undefined,
    });
  }, [customDateFrom, customDateTo, fetchOverview, range]);

  const handleCustomDateFromChange = (value: string) => {
    setCustomDateFrom(value);
    if (value && customDateTo && value > customDateTo) {
      setCustomDateTo(value);
    }
  };

  const handleCustomDateToChange = (value: string) => {
    setCustomDateTo(value);
    if (value && customDateFrom && value < customDateFrom) {
      setCustomDateFrom(value);
    }
  };

  useEffect(() => {
    if (!canLoadFinance) return;
    void load();
  }, [canLoadFinance, load]);

  const overview = overviewSlice.data;
  const staffRows = useMemo(
    () =>
      overview?.staff.filter((row) => row.userId !== currentUserId) ?? [],
    [currentUserId, overview?.staff],
  );
  const trendData = useMemo(
    () =>
      (overview?.trend ?? []).map((point) => ({
        ...point,
        accrued: point.accruedMinor / 100,
        paid: point.paidMinor / 100,
      })),
    [overview?.trend],
  );

  const onRecordPayout = async () => {
    if (!selectedStaff) return;
    const amountMinor = majorInputToMinorPositive(amountMajor);
    if (amountMinor <= 0) {
      setFormError(t('finance.error.positiveAmount'));
      return;
    }
    setRecording(true);
    setFormError(null);
    try {
      await recordPayout({
        userId: selectedStaff.userId,
        amountMinor,
        currency: selectedStaff.currency,
        paidAt: new Date(`${paidAt}T12:00:00.000Z`).toISOString(),
        note: note.trim() || null,
        periodFrom: overview?.rangeBounds.from ?? null,
        periodTo: overview?.rangeBounds.to ?? null,
      });
      setAmountMajor('');
      setNote('');
      setSelectedStaff(null);
      setFormError(null);
      await load();
      setPayoutHistoryRefreshToken((value) => value + 1);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('finance.error.recordFailed'));
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.header}
        title={t('finance.title')}
        subtitle={t('finance.subtitle')}
      />

      <div className={styles.rangeRow}>
        <StatsRangeFilter
          range={range}
          onRangeChange={setRange}
          includeCustom
          customDateFrom={customDateFrom}
          customDateTo={customDateTo}
          customDateMax={customDateMax}
          onCustomDateFromChange={handleCustomDateFromChange}
          onCustomDateToChange={handleCustomDateToChange}
          ariaLabel={t('finance.periodAria')}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => void load()}
          disabled={overviewSlice.status === 'loading'}
        >
          <RefreshCw size={14} aria-hidden />
          {t('finance.refresh')}
        </Button>
      </div>

      {overviewSlice.status === 'error' ? (
        <EmptyStateCard
          title={t('finance.loadError')}
          description={overviewSlice.error ?? t('finance.unknownError')}
        />
      ) : null}

      {overview ? (
        <>
          <div className={styles.kpiGrid} data-tour-anchor="finance-overview">
            <StatTile
              label={t('finance.kpi.accrued')}
              value={formatMoneyMinor(overview.totalAccruedMinor, overview.currency)}
              subtext={overview.rangeLabel}
            />
            <StatTile
              label={t('finance.kpi.paid')}
              value={formatMoneyMinor(overview.totalPaidMinor, overview.currency)}
              subtext={t('finance.kpi.paidSubtext')}
            />
            <StatTile
              label={t('finance.kpi.outstanding')}
              value={formatMoneyMinor(overview.totalOutstandingMinor, overview.currency)}
              subtext={t('finance.kpi.outstandingSubtext')}
            />
          </div>

          <div className={styles.chartGrid}>
            <TabPanelCard>
              <SectionHeader title={t('finance.chart.trendTitle')} />
              <div className={styles.chartBox}>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={CHART_MARGIN}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                      <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
                      <ChartTooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Line type="monotone" dataKey="accrued" stroke="var(--blue)" strokeWidth={2} name={t('finance.chart.accrued')} />
                      <Line type="monotone" dataKey="paid" stroke="var(--green)" strokeWidth={2} name={t('finance.chart.paid')} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.hint}>{t('finance.chart.noTrend')}</p>
                )}
              </div>
            </TabPanelCard>

            <TabPanelCard>
              <SectionHeader title={t('finance.chart.breakdownTitle')} />
              <div className={styles.chartBox}>
                {staffRows.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={staffRows.map((row) => ({
                        name: row.displayName.split(' ')[0] ?? row.displayName,
                        accrued: row.accruedMinor / 100,
                      }))}
                      margin={CHART_MARGIN}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                      <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
                      <ChartTooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="accrued" fill="var(--purple)" radius={[6, 6, 0, 0]} name={t('finance.chart.accrued')} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.hint}>{t('finance.chart.noStaff')}</p>
                )}
              </div>
            </TabPanelCard>
          </div>

          <TabPanelCard>
            <div data-tour-anchor="finance-payout-defaults">
              <SectionHeader title={t('finance.table.title')} />
            </div>
            <div className={staffPayoutStyles.staffTableWrap}>
              <table className={staffPayoutStyles.staffTable}>
                <thead>
                  <tr>
                    <th scope="col">{t('finance.table.name')}</th>
                    <th scope="col">{t('finance.table.role')}</th>
                    <th scope="col">{t('finance.table.mode')}</th>
                    <th scope="col">{t('finance.table.lessons')}</th>
                    <th scope="col">{t('finance.table.accrued')}</th>
                    <th scope="col">{t('finance.table.paid')}</th>
                    <th scope="col">{t('finance.table.outstanding')}</th>
                    <th scope="col">{t('finance.table.nextPay')}</th>
                    <th scope="col">{t('finance.table.status')}</th>
                    <th scope="col">{t('finance.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {staffRows.map((row) => (
                    <tr key={row.userId}>
                      <td>
                        <Link
                          href={`/staff/${row.userId}`}
                          className={staffPayoutStyles.staffNameLink}
                        >
                          {row.displayName}
                        </Link>
                      </td>
                      <td>{t(ROLE_LABEL[row.role] ?? 'staff.role.teacher')}</td>
                      <td>{staffCompensationModeLabel(row.mode, t)}</td>
                      <td>{row.completedLessons}</td>
                      <td>{formatMoneyMinor(row.accruedMinor, row.currency)}</td>
                      <td>{formatMoneyMinor(row.paidMinor, row.currency)}</td>
                      <td>{formatMoneyMinor(row.outstandingMinor, row.currency)}</td>
                      <td>{new Date(row.nextPayDate).toLocaleDateString()}</td>
                      <td>
                        <StaffPayoutStatusBadge status={row.payoutStatus} />
                      </td>
                      <td>
                        <Button
                          type="button"
                          variant="ghost"
                          data-tour-anchor="finance-record-payout"
                          onClick={() => {
                            setSelectedStaff(row);
                            setFormError(null);
                          }}
                        >
                          {t('finance.table.recordPayout')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPanelCard>

          {selectedStaff ? (
            <RecordStaffPayoutModal
              open
              staffDisplayName={selectedStaff.displayName}
              currency={selectedStaff.currency}
              outstandingLabel={formatMoneyMinor(
                selectedStaff.outstandingMinor,
                selectedStaff.currency,
              )}
              values={{ amountMajor, paidAt, note }}
              onChange={(patch) => {
                if (patch.amountMajor !== undefined) setAmountMajor(patch.amountMajor);
                if (patch.paidAt !== undefined) setPaidAt(patch.paidAt);
                if (patch.note !== undefined) setNote(patch.note);
              }}
              onSubmit={() => void onRecordPayout()}
              onClose={() => {
                if (!recording) {
                  setSelectedStaff(null);
                  setFormError(null);
                }
              }}
              saving={recording}
              error={formError}
              paidAtMax={new Date().toISOString().slice(0, 10)}
            />
          ) : null}

          <StaffPayoutHistoryPanel
            rangeFrom={overview.rangeBounds.from}
            rangeTo={overview.rangeBounds.to}
            periodLabel={overview.rangeLabel}
            refreshToken={payoutHistoryRefreshToken}
            staffOptions={staffRows.map((row) => ({
              userId: row.userId,
              displayName: row.displayName,
            }))}
          />
        </>
      ) : overviewSlice.status === 'loading' ? (
        <p className={styles.hint}>{t('finance.loading')}</p>
      ) : null}
    </div>
  );
}
