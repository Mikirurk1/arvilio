'use client';

import {
  ActionRow,
  Button,
  Field,
  SegmentedControl,
  SettingsToggleRow,
  TabPanelCard,
} from '../../components/ui';
import { useEffect, useState, type HTMLAttributes, type ReactNode } from 'react';
import {
  defaultCustomStatsDateKeys,
  getLocaleMeta,
  isLocale,
  replaceLocaleInPath,
  SUPPORTED_LOCALES,
  utcDateKey,
  type Locale,
  type ProfileNotificationPrefs,
  type StatisticsStudentScope,
  type StatsRange,
} from '@pkg/types';
import { usePathname, useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useArvi } from '../../components/mascot/useArvi';
import { TOUR_REPLAY_EVENT } from '../../components/tour/ProductTour';
import {
  readLearningMode,
  setLearningMode,
  type LearningMode,
} from '../../components/tour/learning-mode';
import { useProfileStore } from '../../stores/profile-store';
import { useAuth } from '../../lib/auth-context';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import { apiClient } from '../../lib/api';
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
import { USER_ROLE } from '@pkg/types';
import type { UserRoleId } from '@pkg/types';
import type { ProfileFormState } from '../../lib/profile-form';
import { ChangePasswordModal } from './ChangePasswordModal';
import styles from './page.module.scss';

export { LinkedAccountsPanel, profileLinksToPanel } from './LinkedAccountsPanel';

export function ProfileTabPanel({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <TabPanelCard className={className} {...rest}>
      {children}
    </TabPanelCard>
  );
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
  viewerRole: UserRoleId;
  onSave: () => void;
}) {
  const t = useCampusT();
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
        saveLabel={t('profile.saveChanges')}
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
  const t = useCampusT();

  return (
    <ProfileTabPanel>
      <h2 className={styles.sectionTitle}>{t('profile.notif.title')}</h2>
      {saveError ? <p className={styles.panelError} role="alert">{saveError}</p> : null}
      {saved && !saveError ? <p className={styles.savedMsg}><Check size={14} /> {t('profile.notif.saved')}</p> : null}
      <p className={styles.panelHint}>
        {t('profile.notif.hint')}
      </p>
      <div className={styles.notificationsList}>
        {[
          { key: 'lessonReminder', label: t('profile.notif.lessonReminder'), desc: t('profile.notif.lessonReminderDesc') },
          { key: 'streakAlert', label: t('profile.notif.streakAlert'), desc: t('profile.notif.streakAlertDesc') },
          { key: 'weeklyReport', label: t('profile.notif.weeklyReport'), desc: t('profile.notif.weeklyReportDesc') },
          { key: 'newVocab', label: t('profile.notif.newVocab'), desc: t('profile.notif.newVocabDesc') },
          { key: 'teacherMessages', label: t('profile.notif.teacherMessages'), desc: t('profile.notif.teacherMessagesDesc') },
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
  const t = useCampusT();
  const themeLabels = {
    light: t('profile.appearance.light'),
    dark: t('profile.appearance.dark'),
    auto: t('profile.appearance.auto'),
  } as const;
  const fontLabels = {
    small: t('profile.appearance.small'),
    medium: t('profile.appearance.medium'),
    large: t('profile.appearance.large'),
  } as const;

  return (
    <ProfileTabPanel>
      <h2 className={styles.sectionTitle}>{t('profile.appearance.theme')}</h2>
      <SegmentedControl
        value={theme}
        onValueChange={(next) => setTheme(next)}
        ariaLabel={t('profile.appearance.themeAria')}
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
              <span className={styles.themeLabel}>{themeLabels[themeItem]}</span>
            </>
          ),
        }))}
      />
      <h2 className={`${styles.sectionTitle} ${styles.sectionTitleSpaced}`}>{t('profile.appearance.fontSize')}</h2>
      <SegmentedControl
        value={fontSize}
        onValueChange={(next) => setFontSize(next as 'small' | 'medium' | 'large')}
        ariaLabel={t('profile.appearance.fontAria')}
        className={styles.fontSizeRow}
        optionClassName={styles.fontBtn}
        activeOptionClassName={styles.fontActive}
        options={[
          { value: 'small', label: fontLabels.small },
          { value: 'medium', label: fontLabels.medium },
          { value: 'large', label: fontLabels.large },
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
  const t = useCampusT();
  const { locale, setLocale } = useCampusI18n();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const profileMutating = useProfileStore((s) => s.profileMutating);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { wave } = useArvi();
  const [loggingOut, setLoggingOut] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [replayingTour, setReplayingTour] = useState(false);
  const [localeSaving, setLocaleSaving] = useState(false);
  const [learningMode, setLearningModeState] = useState<LearningMode>('on');
  const canChangePassword = user?.hasPassword ?? false;
  const linkedProviders = user?.linkedProviders ?? [];
  const passwordUnavailableHint =
    linkedProviders.length > 0
      ? t('profile.account.passwordOauthHint', {
          providers: linkedProviders.map(formatLinkedProviderLabel).join(', '),
        })
      : t('profile.account.passwordDisabled');

  useEffect(() => {
    setLearningModeState(readLearningMode());
  }, []);

  const handleLearningModeChange = (enabled: boolean) => {
    const next: LearningMode = enabled ? 'on' : 'off';
    setLearningMode(next);
    setLearningModeState(next);
  };

  const handleLocaleChange = async (next: string) => {
    if (!isLocale(next) || next === locale || localeSaving) return;
    setLocaleSaving(true);
    try {
      await updateProfile({ locale: next as Locale });
      setLocale(next as Locale);
      router.replace(replaceLocaleInPath(pathname || '/profile', next as Locale));
    } finally {
      setLocaleSaving(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    wave(1_400);
    try {
      await new Promise((r) => setTimeout(r, 600));
      await logout();
      router.replace(replaceLocaleInPath('/login', locale));
    } finally {
      setLoggingOut(false);
    }
  };

  const handleReplayTour = async () => {
    if (replayingTour) return;
    setReplayingTour(true);
    try {
      await apiClient.post('/onboarding/tour/reset');
      window.dispatchEvent(new Event(TOUR_REPLAY_EVENT));
    } finally {
      setReplayingTour(false);
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setExportDone(false);
    try {
      const data = await apiClient.get<unknown>('/gdpr/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
    } finally {
      setExporting(false);
    }
  };

  const handleEraseAccount = async () => {
    if (!confirm(t('profile.account.deleteConfirm'))) return;
    setErasing(true);
    try {
      await apiClient.delete('/gdpr/me');
      await logout();
      router.replace(replaceLocaleInPath('/login', locale));
    } finally {
      setErasing(false);
    }
  };

  return (
    <>
      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <ProfileTabPanel>
        {user ? (
          <div className={styles.accountSession}>
            <h2 className={styles.sectionTitle}>{t('profile.account.session')}</h2>
            <ActionRow
              className={styles.accountItem}
              titleClassName={styles.accountItemTitle}
              descriptionClassName={styles.accountItemDesc}
              title={t('profile.locale')}
              description={t('profile.localeDescription')}
              action={
                <Field
                  id="profile-locale"
                  as="select"
                  value={locale}
                  disabled={localeSaving || profileMutating}
                  onChange={(e) => void handleLocaleChange(e.target.value)}
                  aria-label={t('profile.locale')}
                >
                  {SUPPORTED_LOCALES.map((code) => (
                    <option key={code} value={code}>
                      {getLocaleMeta(code).nativeName}
                    </option>
                  ))}
                </Field>
              }
            />
            <ActionRow
              className={styles.accountItem}
              titleClassName={styles.accountItemTitle}
              descriptionClassName={styles.accountItemDesc}
              title={t('profile.account.learningModeTitle')}
              description={t('profile.account.learningModeDesc')}
              action={
                <SettingsToggleRow
                  className={styles.toggleRow}
                  infoClassName={styles.toggleInfo}
                  labelClassName={styles.toggleLabel}
                  toggleClassName={styles.toggle}
                  toggleOnClassName={styles.toggleOn}
                  thumbClassName={styles.toggleThumb}
                  label={t('profile.account.learningModeTitle')}
                  checked={learningMode === 'on'}
                  onChange={handleLearningModeChange}
                />
              }
            />
            <ActionRow
              className={styles.accountItem}
              titleClassName={styles.accountItemTitle}
              descriptionClassName={styles.accountItemDesc}
              title={t('profile.account.replayTitle')}
              description={t('profile.account.replayDesc')}
              action={
                <Button
                  type="button"
                  className={styles.actionBtn}
                  loading={replayingTour}
                  loadingLabel={t('profile.account.starting')}
                  disabled={replayingTour}
                  onClick={() => void handleReplayTour()}
                >
                  {t('tour.replay')}
                </Button>
              }
            />
            <ActionRow
              className={styles.accountItem}
              titleClassName={styles.accountItemTitle}
              descriptionClassName={styles.accountItemDesc}
              title={t('profile.account.logoutTitle')}
              description={t('profile.account.logoutDesc')}
              action={
                <Button
                  type="button"
                  className={styles.actionBtn}
                  loading={loggingOut}
                  loadingLabel={t('profile.account.loggingOut')}
                  disabled={loggingOut}
                  onClick={() => void handleLogout()}
                >
                  {t('profile.account.logoutTitle')}
                </Button>
              }
            />
          </div>
        ) : null}
        <div className={styles.dangerSection}>
          <h2 className={styles.dangerSectionTitle}>{t('profile.account.actions')}</h2>
          <p className={styles.dangerSectionHint}>{t('profile.account.actionsHint')}</p>
          <ActionRow
            className={styles.accountItem}
            titleClassName={styles.accountItemTitle}
            descriptionClassName={styles.accountItemDesc}
            title={t('profile.account.changePassword')}
            description={canChangePassword ? t('profile.account.changePasswordDesc') : passwordUnavailableHint}
            action={
              canChangePassword ? (
                <Button type="button" className={styles.actionBtn} onClick={() => setPasswordModalOpen(true)}>{t('profile.account.change')}</Button>
              ) : null
            }
          />
          <ActionRow
            className={styles.accountItem}
            titleClassName={styles.accountItemTitle}
            descriptionClassName={styles.accountItemDesc}
            title={t('profile.account.exportTitle')}
            description={exportDone ? t('profile.account.exportDone') : t('profile.account.exportDesc')}
            action={
              <Button
                type="button"
                className={styles.actionBtn}
                loading={exporting}
                loadingLabel={t('profile.account.exporting')}
                disabled={exporting}
                onClick={() => void handleExport()}
              >
                {t('profile.account.export')}
              </Button>
            }
          />
          <ActionRow
            className={styles.accountItem}
            titleClassName={styles.accountItemTitle}
            descriptionClassName={styles.accountItemDesc}
            title={t('profile.account.deleteTitle')}
            description={t('profile.account.deleteDesc')}
            action={
              <Button
                type="button"
                variant="danger"
                className={styles.actionBtn}
                loading={erasing}
                loadingLabel={t('profile.account.deleting')}
                disabled={erasing}
                onClick={() => void handleEraseAccount()}
              >
                {t('profile.account.delete')}
              </Button>
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
  const t = useCampusT();
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
              ? t('profile.stats.introTeacher')
              : t('profile.stats.introAdmin')
            : t('profile.stats.introStudent')
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
