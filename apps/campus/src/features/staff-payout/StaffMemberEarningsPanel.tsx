'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { defaultCustomStatsDateKeys, resolveStatsRangeBounds, utcDateKey } from '@pkg/types';
import type { PaymentCurrencyCode, StatsRange } from '@pkg/types';
import { RefreshCw } from 'lucide-react';
import { StatsRangeFilter } from '../../components/statistics/StatsRangeFilter';
import { Button, TabPanelCard, SectionHeader, StatTile } from '../../components/ui';
import { useStaffMemberEarnings } from '../../hooks/use-staff-member-earnings';
import { formatMoneyMinor } from '../../lib/format-money';
import { staffCompensationModeLabel } from '../../lib/staff-payout-ui';
import { useFinanceStore } from '../../stores/finance-store';
import { RecordStaffPayoutModal } from './RecordStaffPayoutModal';
import { StaffPayoutHistoryPanel } from './StaffPayoutHistoryPanel';
import { StaffPayoutStatusBadge } from './StaffPayoutStatusBadge';
import { majorInputToMinorPositive } from './money';
import styles from './staff-payout.module.scss';

const CHART_MARGIN = { top: 8, right: 12, left: 0, bottom: 4 };
const AXIS_TICK = { fontSize: 11, fill: 'var(--text-tertiary)' };
const tooltipStyle = {
  borderColor: 'var(--border)',
  borderRadius: 10,
  backgroundColor: 'var(--card)',
};

type StaffMemberEarningsPanelProps = {
  userId: string;
  staffDisplayName: string;
  onPayoutRecorded?: () => void;
};

export function StaffMemberEarningsPanel({
  userId,
  staffDisplayName,
  onPayoutRecorded,
}: StaffMemberEarningsPanelProps) {
  const recordPayout = useFinanceStore((s) => s.recordPayout);
  const [range, setRange] = useState<StatsRange>('month');
  const [customDateFrom, setCustomDateFrom] = useState(() => defaultCustomStatsDateKeys().from);
  const [customDateTo, setCustomDateTo] = useState(() => defaultCustomStatsDateKeys().to);
  const customDateMax = utcDateKey(new Date());
  const { earnings, loading, refreshing, error, refetch } = useStaffMemberEarnings({
    userId,
    range,
    rangeFrom: customDateFrom,
    rangeTo: customDateTo,
  });
  const [payoutRefreshToken, setPayoutRefreshToken] = useState(0);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [amountMajor, setAmountMajor] = useState('');
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [recording, setRecording] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resolvedBounds = useMemo(() => {
    if (range === 'custom' && customDateFrom && customDateTo) {
      return resolveStatsRangeBounds(range, new Date(), {
        from: customDateFrom,
        to: customDateTo,
      });
    }
    return resolveStatsRangeBounds(range, new Date());
  }, [customDateFrom, customDateTo, range]);

  const trendData = useMemo(
    () =>
      (earnings?.trend ?? []).map((point) => ({
        ...point,
        accrued: point.accruedMinor / 100,
        paid: point.paidMinor / 100,
      })),
    [earnings?.trend],
  );

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

  const onRecordPayout = async () => {
    if (!earnings) return;
    const amountMinor = majorInputToMinorPositive(amountMajor);
    if (amountMinor <= 0) {
      setFormError('Enter a positive payout amount.');
      return;
    }
    setRecording(true);
    setFormError(null);
    try {
      await recordPayout({
        userId,
        amountMinor,
        currency: earnings.currency as PaymentCurrencyCode,
        paidAt: new Date(`${paidAt}T12:00:00.000Z`).toISOString(),
        note: note.trim() || null,
        periodFrom: resolvedBounds.from,
        periodTo: resolvedBounds.to,
      });
      setAmountMajor('');
      setNote('');
      setShowRecordModal(false);
      refetch();
      setPayoutRefreshToken((value) => value + 1);
      onPayoutRecorded?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to record payout');
    } finally {
      setRecording(false);
    }
  };

  if (loading && !earnings) {
    return <p className={styles.formHint}>Loading earnings…</p>;
  }

  if (error && !earnings) {
    return <p className={styles.formError}>{error}</p>;
  }

  if (!earnings) {
    return <p className={styles.formHint}>No earnings data.</p>;
  }

  return (
    <div className={styles.earningsPanel}>
      <div className={styles.earningsToolbar}>
        <StatsRangeFilter
          range={range}
          onRangeChange={setRange}
          includeCustom
          customDateFrom={customDateFrom}
          customDateTo={customDateTo}
          customDateMax={customDateMax}
          onCustomDateFromChange={handleCustomDateFromChange}
          onCustomDateToChange={handleCustomDateToChange}
          ariaLabel="Earnings period"
        />
        <Button type="button" variant="ghost" disabled={refreshing}>
          <RefreshCw size={14} aria-hidden className={refreshing ? styles.spin : undefined} />
          {refreshing ? 'Refreshing…' : 'Live'}
        </Button>
      </div>

      <div className={styles.kpiGrid}>
        <StatTile
          label="Completed lessons"
          value={String(earnings.completedLessons)}
          subtext={`${earnings.lessonHours.toFixed(1)} h taught`}
        />
        <StatTile
          label="Accrued"
          value={formatMoneyMinor(earnings.accruedMinor, earnings.currency)}
          subtext={staffCompensationModeLabel(earnings.mode)}
        />
        <StatTile
          label="Paid"
          value={formatMoneyMinor(earnings.paidMinor, earnings.currency)}
          subtext="Recorded payouts"
        />
        <StatTile
          label="Outstanding"
          value={formatMoneyMinor(earnings.outstandingMinor, earnings.currency)}
          subtext={
            <>
              Next pay {new Date(earnings.nextPayDate).toLocaleDateString()} ·{' '}
              <StaffPayoutStatusBadge status={earnings.payoutStatus} />
            </>
          }
        />
      </div>

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
            <p className={styles.formHint}>No trend data for this period.</p>
          )}
        </div>
      </TabPanelCard>

      <StaffPayoutHistoryPanel
        title="Payout history"
        fixedUserId={userId}
        rangeFrom={resolvedBounds.from}
        rangeTo={resolvedBounds.to}
        refreshToken={payoutRefreshToken}
        action={
          <Button type="button" onClick={() => setShowRecordModal(true)}>
            Record payout
          </Button>
        }
      />

      <RecordStaffPayoutModal
        open={showRecordModal}
        staffDisplayName={staffDisplayName}
        currency={earnings.currency}
        outstandingLabel={formatMoneyMinor(earnings.outstandingMinor, earnings.currency)}
        values={{ amountMajor, paidAt, note }}
        onChange={(patch) => {
          if (patch.amountMajor !== undefined) setAmountMajor(patch.amountMajor);
          if (patch.paidAt !== undefined) setPaidAt(patch.paidAt);
          if (patch.note !== undefined) setNote(patch.note);
        }}
        onSubmit={() => void onRecordPayout()}
        onClose={() => {
          if (!recording) {
            setShowRecordModal(false);
            setFormError(null);
          }
        }}
        saving={recording}
        error={formError}
        paidAtMax={new Date().toISOString().slice(0, 10)}
      />
    </div>
  );
}
