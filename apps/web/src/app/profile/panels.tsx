'use client';

import {
  ActionRow,
  Button,
  SegmentedControl,
  SettingsToggleRow,
  TabPanelCard,
} from '../../components/ui';
import { useEffect, useState, type ReactNode } from 'react';
import {
  defaultCustomStatsDateKeys,
  utcDateKey,
  type ProfileNotificationPrefs,
  type StatisticsStudentScope,
  type StatsRange,
} from '@pkg/types';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useProfileStore } from '../../stores/profile-store';
import { useAuth } from '../../lib/auth-context';
import { ProfileAchievementsPanel } from '../../components/profile/ProfileAchievementsPanel';
import { UnifiedProfilePanel } from '../../components/profile/UnifiedProfilePanel';
import {
  profileFormStateToUnified,
  unifiedToProfileFormState,
} from '../../components/profile/profile-form-adapters';
import type { ProfileFormContext } from '../../components/profile/unified-profile-types';
import { StatisticsDashboard } from '../../components/statistics';
import { useStatisticsDashboard } from '../../hooks/use-statistics-dashboard';
import { useActiveUser } from '../../lib/active-user';
import { USER_ROLE } from '../../mocks';
import type { UserRole } from '../../mocks';
import type { ProfileFormState } from '../../lib/profile-form';
import { ChangePasswordModal } from './ChangePasswordModal';
import styles from './page.module.scss';

export { LinkedAccountsPanel, profileLinksToPanel } from './LinkedAccountsPanel';

export function ProfileTabPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <TabPanelCard className={className}>{children}</TabPanelCard>;
}

export function ProfileDetailsPanel({
  form,
  setForm,
  saved,
  saving = false,
  saveError = null,
  loading = false,
  viewerRole,
  onSave,
}: {
  form: ProfileFormState;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormState>>;
  saved: boolean;
  saving?: boolean;
  saveError?: string | null;
  loading?: boolean;
  viewerRole: UserRole;
  onSave: () => void;
}) {
  const fieldsDisabled = loading || saving;
  const values = profileFormStateToUnified(form);

  const context: ProfileFormContext = {
    subjectKind: 'self',
    viewerRole,
    subjectRole: viewerRole,
    canEdit: !fieldsDisabled,
  };

  return (
    <ProfileTabPanel>
      <UnifiedProfilePanel
        values={values}
        onChange={(patch) => setForm((current) => unifiedToProfileFormState(current, patch))}
        context={context}
        loading={loading}
        saving={saving}
        disabled={fieldsDisabled}
        saved={saved}
        saveError={saveError}
        onSave={onSave}
        saveLabel="Save changes"
        idPrefix="my-profile"
      />
    </ProfileTabPanel>
  );
}

export function NotificationsPanel({
  notifications,
  setNotifications,
  saved = false,
  saving = false,
  saveError = null,
}: {
  notifications: ProfileNotificationPrefs;
  setNotifications: React.Dispatch<React.SetStateAction<ProfileNotificationPrefs>>;
  saved?: boolean;
  saving?: boolean;
  saveError?: string | null;
}) {
  return (
    <ProfileTabPanel>
      <h2 className={styles.sectionTitle}>Notifications</h2>
      {saveError ? <p className={styles.panelError} role="alert">{saveError}</p> : null}
      {saved && !saveError ? <p className={styles.savedMsg}><Check size={14} /> Preferences saved</p> : null}
      <p className={styles.panelHint}>
        Email is sent when SMTP is configured. Telegram messages are sent when you connect Telegram under
        Connections (server needs TELEGRAM_BOT_TOKEN in .env).
      </p>
      <div className={styles.notificationsList}>
        {[
          { key: 'lessonReminder', label: 'Lesson reminders', desc: 'Get notified 30 minutes before each lesson' },
          { key: 'streakAlert', label: 'Streak alerts', desc: 'Reminder to keep your daily streak alive' },
          { key: 'weeklyReport', label: 'Weekly report', desc: 'Summary of your progress every Monday' },
          { key: 'newVocab', label: 'New vocabulary', desc: 'Daily word of the day notification' },
          { key: 'teacherMessages', label: 'Teacher messages', desc: 'Notifications when your teacher sends a message' },
        ].map(({ key, label, desc }) => (
          <SettingsToggleRow
            key={key}
            className={styles.toggleRow}
            infoClassName={styles.toggleInfo}
            labelClassName={styles.toggleLabel}
            descriptionClassName={styles.toggleDesc}
            toggleClassName={styles.toggle}
            toggleOnClassName={styles.toggleOn}
            thumbClassName={styles.toggleThumb}
            label={label}
            description={desc}
            checked={notifications[key as keyof ProfileNotificationPrefs]}
            disabled={saving}
            onChange={(value) => setNotifications((n) => ({ ...n, [key]: value }))}
          />
        ))}
      </div>
    </ProfileTabPanel>
  );
}

export function AppearancePanel({
  theme,
  setTheme,
  fontSize,
  setFontSize,
}: {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (next: 'light' | 'dark' | 'auto') => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (next: 'small' | 'medium' | 'large') => void;
}) {
  return (
    <ProfileTabPanel>
      <h2 className={styles.sectionTitle}>Theme</h2>
      <SegmentedControl
        value={theme}
        onValueChange={(next) => setTheme(next)}
        ariaLabel="Theme selector"
        className={styles.themeGrid}
        optionClassName={styles.themeCard}
        activeOptionClassName={styles.themeActive}
        options={(['light', 'dark', 'auto'] as const).map((themeItem) => ({
          value: themeItem,
          label: (
            <>
              <div className={`${styles.themePreview} ${styles[`theme${themeItem.charAt(0).toUpperCase() + themeItem.slice(1)}`]}`}>
                <div className={styles.themeBar} />
                <div className={styles.themeContent} />
              </div>
              <span className={styles.themeLabel}>{themeItem.charAt(0).toUpperCase() + themeItem.slice(1)}</span>
            </>
          ),
        }))}
      />
      <h2 className={`${styles.sectionTitle} ${styles.sectionTitleSpaced}`}>Font size</h2>
      <SegmentedControl
        value={fontSize}
        onValueChange={(next) => setFontSize(next as 'small' | 'medium' | 'large')}
        ariaLabel="Font size selector"
        className={styles.fontSizeRow}
        optionClassName={styles.fontBtn}
        activeOptionClassName={styles.fontActive}
        options={[
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ]}
      />
    </ProfileTabPanel>
  );
}

function formatLinkedProviderLabel(provider: string): string {
  if (provider === 'google') return 'Google';
  if (provider === 'facebook') return 'Facebook';
  if (provider === 'telegram') return 'Telegram';
  return provider;
}

export function AccountPanel() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const canChangePassword = user?.hasPassword ?? false;
  const linkedProviders = user?.linkedProviders ?? [];
  const passwordUnavailableHint =
    linkedProviders.length > 0
      ? `Your account signs in with ${linkedProviders.map(formatLinkedProviderLabel).join(', ')}. Set a password there or contact support.`
      : 'Password sign-in is not enabled for this account.';

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <ProfileTabPanel>
        {user ? (
          <div className={styles.accountSession}>
            <h2 className={styles.sectionTitle}>Session</h2>
            <ActionRow
              className={styles.accountItem}
              titleClassName={styles.accountItemTitle}
              descriptionClassName={styles.accountItemDesc}
              title="Log out"
              description="End your current session on this device"
              action={
                <Button
                  type="button"
                  className={styles.actionBtn}
                  loading={loggingOut}
                  loadingLabel="Logging out…"
                  disabled={loggingOut}
                  onClick={() => void handleLogout()}
                >
                  Log out
                </Button>
              }
            />
          </div>
        ) : null}
        <div className={styles.dangerSection}>
          <h2 className={styles.dangerSectionTitle}>Account actions</h2>
          <p className={styles.dangerSectionHint}>Sensitive changes for your sign-in credentials.</p>
          <ActionRow
            className={styles.accountItem}
            titleClassName={styles.accountItemTitle}
            descriptionClassName={styles.accountItemDesc}
            title="Change password"
            description={canChangePassword ? 'Update your login password' : passwordUnavailableHint}
            action={
              canChangePassword ? (
                <Button type="button" className={styles.actionBtn} onClick={() => setPasswordModalOpen(true)}>Change</Button>
              ) : null
            }
          />
        </div>
      </ProfileTabPanel>
    </>
  );
}

export function AchievementsPanel({
  achievements,
}: {
  achievements: Array<{ icon: ReactNode; label: string; description?: string; unlocked: boolean }>;
}) {
  return <ProfileAchievementsPanel achievements={achievements} />;
}

export function ProfileStatisticsPanel() {
  const activeUser = useActiveUser();
  const [range, setRange] = useState<StatsRange>('week');
  const [customDateFrom, setCustomDateFrom] = useState(() => defaultCustomStatsDateKeys().from);
  const [customDateTo, setCustomDateTo] = useState(() => defaultCustomStatsDateKeys().to);
  const customDateMax = utcDateKey(new Date());
  const isStaffViewer =
    activeUser.role === USER_ROLE.teacher.id ||
    activeUser.role === USER_ROLE.admin.id ||
    activeUser.role === USER_ROLE.superAdmin.id;
  const isAdmin = activeUser.role === USER_ROLE.admin.id;
  const isSuperAdmin = activeUser.role === USER_ROLE.superAdmin.id;
  const canPickStudentScope = isAdmin || isSuperAdmin;
  const [studentScope, setStudentScope] = useState<StatisticsStudentScope | undefined>(() =>
    isAdmin ? 'my_students' : undefined,
  );
  const [allStudentsRosterView, setAllStudentsRosterView] = useState<'lessons_billing' | 'activity'>('lessons_billing');
  const statisticsFocus = allStudentsRosterView === 'activity' ? 'learning' : 'operations';

  const { dashboard, loading, refreshing, error } = useStatisticsDashboard({
    range,
    rangeFrom: range === 'custom' ? customDateFrom : undefined,
    rangeTo: range === 'custom' ? customDateTo : undefined,
    studentScope: canPickStudentScope ? studentScope : undefined,
    statisticsFocus: isStaffViewer ? statisticsFocus : undefined,
  });

  const handleCustomDateFromChange = (value: string) => {
    setCustomDateFrom(value);
    if (value && customDateTo && value > customDateTo) setCustomDateTo(value);
  };

  const handleCustomDateToChange = (value: string) => {
    setCustomDateTo(value);
    if (value && customDateFrom && value < customDateFrom) setCustomDateFrom(value);
  };

  useEffect(() => {
    if (isSuperAdmin && dashboard?.studentScope && studentScope === undefined) {
      setStudentScope(dashboard.studentScope);
    }
  }, [dashboard?.studentScope, isSuperAdmin, studentScope]);

  const resolvedStudentScope = studentScope ?? dashboard?.studentScope ?? (isAdmin ? 'my_students' : 'all');

  return (
    <ProfileTabPanel className={styles.statisticsPanel}>
      <StatisticsDashboard
        variant="profile"
        profileIntro={
          isStaffViewer
            ? activeUser.role === USER_ROLE.teacher.id
              ? 'Lessons and speaking reviews for your students.'
              : 'Switch roster view or student scope to compare operations vs learning activity.'
            : 'Key metrics and trends for the period you select. Hover info icons for definitions.'
        }
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
        studentScope={canPickStudentScope ? resolvedStudentScope : undefined}
        onStudentScopeChange={canPickStudentScope ? setStudentScope : undefined}
        allStudentsRosterView={allStudentsRosterView}
        onAllStudentsRosterViewChange={setAllStudentsRosterView}
      />
    </ProfileTabPanel>
  );
}
