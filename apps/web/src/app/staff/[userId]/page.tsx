'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Banknote, BarChart3, Settings2, UserRound } from 'lucide-react';
import {
  DEFAULT_STAFF_PAYOUT_DEFAULTS,
  defaultCustomStatsDateKeys,
  utcDateKey,
} from '@pkg/types';
import type { MyProfileDto, StaffCompensationProfileDto, StatsRange } from '@pkg/types';
import { StatisticsDashboard } from '../../../components/statistics/StatisticsDashboard';
import { EmptyStateCard, TabPanelCard, UserAvatar } from '../../../components/ui';
import { ProfileViewShell } from '../../../components/profile/ProfileViewShell';
import {
  StaffCompensationPanel,
  StaffMemberEarningsPanel,
  StaffPayoutStatusBadge,
  StaffProfilePanel,
} from '../../../features/staff-payout';
import { useStatisticsDashboard } from '../../../hooks/use-statistics-dashboard';
import { formatMoneyMinor } from '../../../lib/format-money';
import { staffCompensationModeLabel } from '../../../lib/staff-payout-ui';
import { useActiveRoleKey } from '../../../lib/active-user';
import { useOptionalAuth } from '../../../lib/auth-context';
import { canRoleAccessPathname } from '../../../lib/auth/route-policy';
import { useAdminStore } from '../../../stores/admin-store';
import { useFinanceStore } from '../../../stores/finance-store';
import styles from './page.module.scss';

const ROLE_LABEL: Record<string, string> = {
  teacher: 'Teacher',
  admin: 'Admin',
  super_admin: 'Super admin',
};

type StaffTab = 'profile' | 'compensation' | 'earnings' | 'statistics';

export default function StaffMemberPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId ?? '';
  const auth = useOptionalAuth();
  const viewerRoleKey = useActiveRoleKey();
  const canLoadFinance = Boolean(auth.user) && canRoleAccessPathname('/staff', viewerRoleKey);
  const usersSlice = useAdminStore((s) => s.users);
  const fetchUsers = useAdminStore((s) => s.fetchUsers);
  const fetchDefaults = useFinanceStore((s) => s.fetchDefaults);
  const fetchCompensationProfile = useFinanceStore((s) => s.fetchCompensationProfile);
  const updateCompensationProfile = useFinanceStore((s) => s.updateCompensationProfile);
  const fetchStaffUserProfile = useFinanceStore((s) => s.fetchStaffUserProfile);
  const updateStaffUserProfile = useFinanceStore((s) => s.updateStaffUserProfile);
  const fetchOverview = useFinanceStore((s) => s.fetchOverview);
  const defaultsSlice = useFinanceStore((s) => s.defaults);

  const [tab, setTab] = useState<StaffTab>('profile');
  const [visitedTabs, setVisitedTabs] = useState(() => new Set<string>(['profile']));
  const [userProfile, setUserProfile] = useState<MyProfileDto | null>(null);
  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [userProfileSaving, setUserProfileSaving] = useState(false);
  const [userProfileFeedback, setUserProfileFeedback] = useState<string | null>(null);
  const [compensationDraft, setCompensationDraft] = useState<StaffCompensationProfileDto>({ userId });
  const [compensationLoading, setCompensationLoading] = useState(true);
  const [compensationSaving, setCompensationSaving] = useState(false);
  const [compensationFeedback, setCompensationFeedback] = useState<string | null>(null);
  const [financeRow, setFinanceRow] = useState<{
    displayName: string;
    role: string;
    completedLessons: number;
    accruedMinor: number;
    outstandingMinor: number;
    currency: string;
    mode: string;
    payoutStatus: 'ok' | 'due' | 'overdue';
  } | null>(null);

  const [range, setRange] = useState<StatsRange>('month');
  const [customDateFrom, setCustomDateFrom] = useState(() => defaultCustomStatsDateKeys().from);
  const [customDateTo, setCustomDateTo] = useState(() => defaultCustomStatsDateKeys().to);
  const customDateMax = utcDateKey(new Date());
  const [allStudentsRosterView, setAllStudentsRosterView] = useState<
    'lessons_billing' | 'activity'
  >('lessons_billing');
  const statisticsFocus = allStudentsRosterView === 'activity' ? 'learning' : 'operations';

  const userSummary = useMemo(
    () => usersSlice.data?.find((user) => user.id === userId),
    [userId, usersSlice.data],
  );

  useEffect(() => {
    if (!canLoadFinance) return;
    void fetchUsers();
    void fetchDefaults().catch(() => undefined);
    void fetchOverview({ range: 'month' })
      .then((overview) => {
        const row = overview.staff.find((entry) => entry.userId === userId);
        if (row) {
          setFinanceRow({
            displayName: row.displayName,
            role: row.role,
            completedLessons: row.completedLessons,
            accruedMinor: row.accruedMinor,
            outstandingMinor: row.outstandingMinor,
            currency: row.currency,
            mode: row.mode,
            payoutStatus: row.payoutStatus,
          });
        }
      })
      .catch(() => undefined);
  }, [canLoadFinance, fetchDefaults, fetchOverview, fetchUsers, userId]);

  useEffect(() => {
    if (!canLoadFinance || !userId) return;
    setUserProfileLoading(true);
    void fetchStaffUserProfile(userId)
      .then(setUserProfile)
      .catch(() => setUserProfile(null))
      .finally(() => setUserProfileLoading(false));
  }, [canLoadFinance, fetchStaffUserProfile, userId]);

  useEffect(() => {
    if (!canLoadFinance || !userId) return;
    setCompensationLoading(true);
    void fetchCompensationProfile(userId)
      .then((profile) => setCompensationDraft({ ...profile, userId }))
      .catch(() => setCompensationDraft({ userId }))
      .finally(() => setCompensationLoading(false));
  }, [canLoadFinance, fetchCompensationProfile, userId]);

  const statisticsEnabled = visitedTabs.has('statistics') && Boolean(userId);
  const { dashboard, loading, refreshing, error } = useStatisticsDashboard({
    range,
    staffUserId: userId,
    statisticsFocus,
    rangeFrom: range === 'custom' ? customDateFrom : undefined,
    rangeTo: range === 'custom' ? customDateTo : undefined,
    enabled: statisticsEnabled,
  });

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

  const onSaveUserProfile = async () => {
    if (!userProfile) return;
    setUserProfileSaving(true);
    setUserProfileFeedback(null);
    try {
      const saved = await updateStaffUserProfile({
        userId: userProfile.id,
        displayName: userProfile.displayName,
        timezone: userProfile.timezone,
        phone: userProfile.phone,
        telegram: userProfile.telegram,
        bio: userProfile.bio,
        status: userProfile.status,
      });
      setUserProfile(saved);
      setUserProfileFeedback('Profile saved.');
    } catch (err) {
      setUserProfileFeedback(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setUserProfileSaving(false);
    }
  };

  const refreshFinanceRow = () => {
    void fetchOverview({ range: 'month' })
      .then((overview) => {
        const row = overview.staff.find((entry) => entry.userId === userId);
        if (row) {
          setFinanceRow({
            displayName: row.displayName,
            role: row.role,
            completedLessons: row.completedLessons,
            accruedMinor: row.accruedMinor,
            outstandingMinor: row.outstandingMinor,
            currency: row.currency,
            mode: row.mode,
            payoutStatus: row.payoutStatus,
          });
        }
      })
      .catch(() => undefined);
  };

  const onSaveCompensation = async () => {
    setCompensationSaving(true);
    setCompensationFeedback(null);
    try {
      const saved = await updateCompensationProfile(compensationDraft);
      setCompensationDraft(saved);
      setCompensationFeedback('Compensation profile saved.');
    } catch (err) {
      setCompensationFeedback(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setCompensationSaving(false);
    }
  };

  if (!userId) {
    return (
      <EmptyStateCard title="Staff member not found" description="Missing user id in URL." />
    );
  }

  if (
    usersSlice.status === 'success' &&
    userSummary?.role === 'student'
  ) {
    return (
      <EmptyStateCard
        title="Not a staff member"
        description="This user is not a teacher or admin."
      />
    );
  }

  const displayName =
    userProfile?.displayName ?? userSummary?.displayName ?? financeRow?.displayName ?? 'Staff member';
  const roleKey = userProfile?.role ?? userSummary?.role ?? financeRow?.role ?? 'teacher';
  const roleLabel = ROLE_LABEL[roleKey] ?? roleKey;
  const defaults = defaultsSlice.data ?? DEFAULT_STAFF_PAYOUT_DEFAULTS;

  const profilePanel = (
    <TabPanelCard className={styles.panel}>
      <StaffProfilePanel
        profile={userProfile}
        roleLabel={roleLabel}
        onChange={setUserProfile}
        loading={userProfileLoading}
        saving={userProfileSaving}
        feedback={userProfileFeedback}
        onSave={() => void onSaveUserProfile()}
      />
    </TabPanelCard>
  );

  const compensationPanel = (
    <TabPanelCard className={styles.panel}>
      <StaffCompensationPanel
        userId={userId}
        defaults={defaults}
        draft={compensationDraft}
        onChange={setCompensationDraft}
        loading={compensationLoading}
        saving={compensationSaving}
        feedback={compensationFeedback}
        onSave={() => void onSaveCompensation()}
      />
    </TabPanelCard>
  );

  const statisticsPanel = (
    <TabPanelCard className={styles.statisticsPanel}>
      <StatisticsDashboard
        variant="profile"
        profileIntro={`Lesson and student activity for ${displayName}. Scope is their assigned students.`}
        dashboard={dashboard}
        loading={loading}
        refreshing={refreshing}
        error={error}
        range={range}
        onRangeChange={setRange}
        customDateFrom={customDateFrom}
        customDateTo={customDateTo}
        customDateMax={customDateMax}
        onCustomDateFromChange={handleCustomDateFromChange}
        onCustomDateToChange={handleCustomDateToChange}
        allStudentsRosterView={allStudentsRosterView}
        onAllStudentsRosterViewChange={setAllStudentsRosterView}
      />
    </TabPanelCard>
  );

  return (
    <ProfileViewShell<StaffTab>
      back={
        <Link href="/staff" className={styles.backLink} aria-label="Back to staff">
          <ArrowLeft size={18} aria-hidden />
        </Link>
      }
      title="Staff profile"
      subtitle="Profile, compensation, earnings, and teaching statistics"
      avatar={
        <UserAvatar
          name={displayName}
          size="xl"
          email={userProfile?.email ?? userSummary?.email}
        />
      }
      name={displayName}
      meta={roleLabel}
      metaExtra={userProfile?.email ?? userSummary?.email ?? ''}
      badges={[
        { label: roleLabel, variant: 'blue' },
        financeRow
          ? { label: staffCompensationModeLabel(financeRow.mode), variant: 'green' }
          : { label: 'Compensation', variant: 'green' },
        financeRow
          ? { label: <StaffPayoutStatusBadge status={financeRow.payoutStatus} /> }
          : { label: 'Payout status' },
      ]}
      stats={[
        {
          value: String(financeRow?.completedLessons ?? '—'),
          label: 'Lessons (month)',
          icon: <BarChart3 size={15} aria-hidden />,
          iconTone: 'blue',
        },
        {
          value: financeRow
            ? formatMoneyMinor(financeRow.accruedMinor, financeRow.currency)
            : '—',
          label: 'Accrued',
          icon: <Banknote size={15} aria-hidden />,
          iconTone: 'green',
        },
        {
          value: financeRow
            ? formatMoneyMinor(financeRow.outstandingMinor, financeRow.currency)
            : '—',
          label: 'Outstanding',
          icon: <Settings2 size={15} aria-hidden />,
          iconTone: 'amber',
        },
      ]}
      achievements={[]}
      tab={tab}
      onTabChange={(next) => {
        setTab(next);
        setVisitedTabs((prev) => new Set(prev).add(next));
      }}
      keepMountedTabs={false}
      tabs={[
        { value: 'profile', label: 'Profile', panel: profilePanel },
        { value: 'compensation', label: 'Compensation', panel: compensationPanel },
        {
          value: 'earnings',
          label: 'Earnings & payouts',
          panel: (
            <StaffMemberEarningsPanel
              userId={userId}
              staffDisplayName={displayName}
              onPayoutRecorded={refreshFinanceRow}
            />
          ),
        },
        { value: 'statistics', label: 'Statistics', panel: statisticsPanel },
      ]}
    />
  );
}
