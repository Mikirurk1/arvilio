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
import { useFinanceStore } from '../../stores/finance-store';
import styles from './page.module.scss';

const CHART_MARGIN = { top: 8, right: 12, left: 0, bottom: 4 };
const AXIS_TICK = { fontSize: 11, fill: 'var(--text-tertiary)' };
const tooltipStyle = {
  borderColor: 'var(--border)',
  borderRadius: 10,
  backgroundColor: 'var(--card)',
};

export default function FinancePage() {
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
      setFormError('Enter a positive payout amount.');
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
      setFormError(error instanceof Error ? error.message : 'Failed to record payout');
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.header}
        title="Staff finance"
        subtitle="Track accrued pay, record manual payouts, and monitor outstanding balances for teachers and admins."
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
          ariaLabel="Finance period"
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => void load()}
          disabled={overviewSlice.status === 'loading'}
        >
          <RefreshCw size={14} aria-hidden />
          Refresh
        </Button>
      </div>

      {overviewSlice.status === 'error' ? (
        <EmptyStateCard
          title="Could not load finance data"
          description={overviewSlice.error ?? 'Unknown error'}
        />
      ) : null}

      {overview ? (
        <>
          <div className={styles.kpiGrid}>
            <StatTile
              label="Accrued"
              value={formatMoneyMinor(overview.totalAccruedMinor, overview.currency)}
              subtext={overview.rangeLabel}
            />
            <StatTile
              label="Paid"
              value={formatMoneyMinor(overview.totalPaidMinor, overview.currency)}
              subtext="Recorded payouts in period"
            />
            <StatTile
              label="Outstanding"
              value={formatMoneyMinor(overview.totalOutstandingMinor, overview.currency)}
              subtext="Accrued minus paid (net)"
            />
          </div>

          <div className={styles.chartGrid}>
            <TabPanelCard>
              <SectionHeader title="Accrued vs paid trend" />
              <div className={styles.chartBox}>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={CHART_MARGIN}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                      <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
                      <ChartTooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Line type="monotone" dataKey="accrued" stroke="var(--blue)" strokeWidth={2} name="Accrued" />
                      <Line type="monotone" dataKey="paid" stroke="var(--green)" strokeWidth={2} name="Paid" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.hint}>No trend data for this period.</p>
                )}
              </div>
            </TabPanelCard>

            <TabPanelCard>
              <SectionHeader title="Staff breakdown (accrued)" />
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
                      <Bar dataKey="accrued" fill="var(--purple)" radius={[6, 6, 0, 0]} name="Accrued" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.hint}>No staff rows.</p>
                )}
              </div>
            </TabPanelCard>
          </div>

          <TabPanelCard>
            <SectionHeader title="Staff balances" />
            <div className={staffPayoutStyles.staffTableWrap}>
              <table className={staffPayoutStyles.staffTable}>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                    <th scope="col">Mode</th>
                    <th scope="col">Lessons</th>
                    <th scope="col">Accrued</th>
                    <th scope="col">Paid</th>
                    <th scope="col">Outstanding</th>
                    <th scope="col">Next pay</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
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
                      <td>{row.role}</td>
                      <td>{staffCompensationModeLabel(row.mode)}</td>
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
                          onClick={() => {
                            setSelectedStaff(row);
                            setFormError(null);
                          }}
                        >
                          Record payout
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
        <p className={styles.hint}>Loading finance overview…</p>
      ) : null}
    </div>
  );
}
