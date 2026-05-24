'use client';

import {
  ActionRow,
  BodyPortal,
  Button,
  Field,
  SegmentedControl,
  SettingsToggleRow,
  SurfaceCard,
} from '../../components/ui';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { ProfileNotificationPrefs } from '@pkg/types';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { toast } from '../../features/notifications';
import { useProfileStore } from '../../stores/profile-store';
import { useAuth } from '../../lib/auth-context';
import type { ProfileLinkedAccountDto } from '@pkg/types';
import { TelegramConnectButton } from '../../components/profile/TelegramConnectButton';
import { FACEBOOK_LINK_URL, GOOGLE_LINK_URL } from '../../lib/api';
import { ProfileAchievementsPanel } from '../../components/profile/ProfileAchievementsPanel';
import { StatisticsDashboard } from '../../components/statistics';
import { useProfileLiveStats } from '../../hooks/use-profile-live-stats';
import { useOptionalAuth } from '../../lib/auth-context';
import { filterLessonsForViewer } from '../../lib/live-statistics-dashboard';
import { useActiveUser } from '../../lib/active-user';
import {
  formatTimeZoneOptionLabel,
  PROFICIENCY_LEVEL,
  TIME_ZONE_ID_LIST,
  USER_ROLE,
  getTimeZoneById,
  type LinkedAccountLink,
  type ProficiencyLevelId,
  type UserRole,
} from '../../mocks';
import type { ProfileFormState } from '../../lib/profile-form';
import { selectLanguagesList, useLanguagesStore } from '../../stores/languages-store';
import styles from './page.module.scss';

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
  const isStudentViewer = viewerRole === USER_ROLE.student.id;
  const languages = useLanguagesStore(selectLanguagesList);
  const fetchLanguages = useLanguagesStore((s) => s.fetchLanguages);

  useEffect(() => {
    void fetchLanguages();
  }, [fetchLanguages]);

  const fieldsDisabled = loading || saving;

  return (
    <SurfaceCard className={styles.formCard}>
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Full name</label>
          <Field className={styles.input} value={form.name} disabled={fieldsDisabled} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <Field className={styles.input} value={form.email} disabled={fieldsDisabled} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Phone</label>
          <Field
            type="tel"
            className={styles.input}
            value={form.phone}
            placeholder="+380 67 123 4567"
            autoComplete="tel"
            disabled={fieldsDisabled}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Telegram</label>
          <Field className={styles.input} value={form.telegram} disabled={fieldsDisabled} onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Timezone</label>
          <Field as="select"
            className={styles.input}
            value={String(form.timezoneId)}
            disabled={fieldsDisabled}
            onChange={(e) =>
              setForm((f) => ({ ...f, timezoneId: Number(e.target.value) as ProfileFormState['timezoneId'] }))
            }
          >
            {TIME_ZONE_ID_LIST.map((id) => {
              const tz = getTimeZoneById(id);
              return tz ? (
                <option key={id} value={id}>
                  {formatTimeZoneOptionLabel(tz)}
                </option>
              ) : null;
            })}
          </Field>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Native language</label>
          <Field
            as="select"
            className={styles.input}
            value={form.nativeLanguageId}
            disabled={fieldsDisabled}
            onChange={(e) => setForm((f) => ({ ...f, nativeLanguageId: e.target.value }))}
          >
            <option value="">—</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </Field>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Proficiency</label>
          <Field as="select"
            className={styles.input}
            value={String(form.proficiencyLevelId)}
            readOnly={isStudentViewer}
            disabled={fieldsDisabled}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                proficiencyLevelId: Number(e.target.value) as ProficiencyLevelId,
              }))
            }
          >
            {(Object.keys(PROFICIENCY_LEVEL) as (keyof typeof PROFICIENCY_LEVEL)[]).map((key) => {
              const L = PROFICIENCY_LEVEL[key];
              return (
                <option key={L.id} value={L.id}>
                  {L.code} — {L.label}
                </option>
              );
            })}
          </Field>
        </div>
      </div>
      <div className={styles.fieldGroup} style={{ marginTop: 16 }}>
        <label className={styles.label}>Bio</label>
        <Field as="textarea" className={`${styles.input} ${styles.textarea}`} value={form.bio} disabled={fieldsDisabled} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} />
      </div>
      <div className={styles.formFooter}>
        {saveError ? (
          <span className={styles.savedMsg} style={{ color: 'var(--red, #c00)' }}>
            {saveError}
          </span>
        ) : null}
        {saved && !saveError ? (
          <span className={styles.savedMsg}>
            <Check size={14} /> Changes saved
          </span>
        ) : null}
        <Button type="button" className={styles.saveBtn} disabled={fieldsDisabled} onClick={onSave}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </SurfaceCard>
  );
}

function providerTitle(provider: LinkedAccountLink['provider']): string {
  if (provider === 'google') return 'Google';
  if (provider === 'facebook') return 'Facebook';
  return 'Telegram';
}

export function profileLinksToPanel(
  rows: ProfileLinkedAccountDto[] | undefined,
  fallback: LinkedAccountLink[],
): LinkedAccountLink[] {
  if (!rows?.length) return fallback;
  return rows.map((row) => ({
    provider: row.provider,
    linked: row.linked,
    connectedAs: row.connectedAs ?? undefined,
    calendarConnected: row.calendarConnected,
  }));
}

export function LinkedAccountsPanel({
  links,
  canLink = false,
  accountEmail,
  onConnectionChange,
}: {
  links: LinkedAccountLink[];
  canLink?: boolean;
  accountEmail?: string;
  onConnectionChange?: () => void;
}) {
  return (
    <SurfaceCard className={styles.formCard}>
      <p className={styles.linkedIntro}>
        Link accounts for notifications. Google must use the same email as your SoEnglish account
        {accountEmail ? ` (${accountEmail})` : ''} and enables Calendar + Meet. When Telegram is connected,
        site alerts (lesson reminders, teacher messages, etc.) are also sent to this chat if enabled under
        Notifications.
      </p>
      {links.map((link) => {
        const isGoogle = link.provider === 'google';
        const isFacebook = link.provider === 'facebook';
        const isTelegram = link.provider === 'telegram';
        const calendarReady = isGoogle && link.calendarConnected;
        return (
        <div key={link.provider} className={styles.linkedRow}>
          <div>
            <div className={styles.linkedTitle}>{providerTitle(link.provider)}</div>
            {link.linked && link.connectedAs ? (
              <div className={styles.linkedMeta}>{link.connectedAs}</div>
            ) : !link.linked ? (
              <div className={styles.linkedMeta}>Not connected</div>
            ) : null}
            {isGoogle && link.linked && !calendarReady ? (
              <div className={styles.linkedMeta}>Calendar access missing — connect again</div>
            ) : null}
            {calendarReady ? (
              <div className={styles.linkedMeta}>Calendar &amp; Meet enabled</div>
            ) : null}
          </div>
          <div className={styles.linkedRowActions}>
            {isGoogle && canLink ? (
              <Button
                type="button"
                className={styles.linkedConnectBtn}
                onClick={() => {
                  window.location.href = GOOGLE_LINK_URL;
                }}
              >
                {link.linked ? 'Reconnect Google' : 'Connect Google'}
              </Button>
            ) : null}
            {isFacebook && canLink ? (
              <Button
                type="button"
                className={styles.linkedConnectBtn}
                onClick={() => {
                  window.location.href = FACEBOOK_LINK_URL;
                }}
              >
                {link.linked ? 'Reconnect Facebook' : 'Connect Facebook'}
              </Button>
            ) : null}
            {isTelegram && canLink ? (
              link.linked ? (
                <span className={`${styles.linkedBadge} ${styles.linkedBadgeOn}`}>Connected</span>
              ) : (
                <TelegramConnectButton onLinked={onConnectionChange} />
              )
            ) : null}
            {!canLink ? (
              <span
                className={`${styles.linkedBadge} ${link.linked ? styles.linkedBadgeOn : styles.linkedBadgeOff}`}
              >
                {link.linked ? 'Connected' : 'Disconnected'}
              </span>
            ) : null}
          </div>
        </div>
        );
      })}
    </SurfaceCard>
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
    <SurfaceCard className={styles.formCard}>
      {saveError ? (
        <p className={styles.panelHint} style={{ color: 'var(--red, #c00)' }}>
          {saveError}
        </p>
      ) : null}
      {saved && !saveError ? (
        <p className={styles.savedMsg}>
          <Check size={14} /> Preferences saved
        </p>
      ) : null}
      <p className={styles.panelHint}>
        Email is sent when SMTP is configured. Telegram messages are sent when you connect Telegram under
        Connections (server needs TELEGRAM_BOT_TOKEN in .env).
      </p>
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
    </SurfaceCard>
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
    <SurfaceCard className={styles.formCard}>
      <div className={styles.sectionLabel}>Theme</div>
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
      <div className={styles.sectionLabel} style={{ marginTop: 24 }}>
        Font size
      </div>
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
    </SurfaceCard>
  );
}

function formatLinkedProviderLabel(provider: string): string {
  if (provider === 'google') return 'Google';
  if (provider === 'facebook') return 'Facebook';
  if (provider === 'telegram') return 'Telegram';
  return provider;
}

function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const changePassword = useProfileStore((s) => s.changePassword);
  const passwordMutating = useProfileStore((s) => s.passwordMutating);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFormError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !passwordMutating) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, passwordMutating]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!currentPassword.trim()) {
      setFormError('Enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('New passwords do not match.');
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated', 'Use your new password next time you sign in.');
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  return (
    <BodyPortal>
      <div
        className={styles.passwordModalBackdrop}
        onClick={() => {
          if (!passwordMutating) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
          className={styles.passwordModal}
          onClick={(event) => event.stopPropagation()}
        >
          <header className={styles.passwordModalHead}>
            <div className={styles.passwordModalHeadText}>
              <h3 id="change-password-title" className={styles.passwordModalTitle}>
                Change password
              </h3>
              <p className={styles.passwordModalText}>
                Enter your current password, then choose a new one (at least 8 characters).
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className={styles.passwordModalClose}
              aria-label="Close"
              disabled={passwordMutating}
              onClick={onClose}
            >
              <X size={16} aria-hidden />
            </Button>
          </header>

          <form className={styles.passwordModalForm} onSubmit={(event) => void handleSubmit(event)}>
            {formError ? <p className={styles.passwordModalError}>{formError}</p> : null}

            <div className={styles.passwordModalFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="current-password">
                  Current password
                </label>
                <Field
                  id="current-password"
                  type="password"
                  className={styles.input}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  disabled={passwordMutating}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="new-password">
                  New password
                </label>
                <Field
                  id="new-password"
                  type="password"
                  className={styles.input}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={passwordMutating}
                  minLength={8}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="confirm-password">
                  Confirm new password
                </label>
                <Field
                  id="confirm-password"
                  type="password"
                  className={styles.input}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={passwordMutating}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <footer className={styles.passwordModalActions}>
              <Button
                type="button"
                variant="ghost"
                className={styles.passwordModalCancel}
                disabled={passwordMutating}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={styles.passwordModalSubmit}
                loading={passwordMutating}
                loadingLabel="Saving…"
              >
                Update password
              </Button>
            </footer>
          </form>
        </div>
      </div>
    </BodyPortal>
  );
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
      <SurfaceCard className={styles.formCard}>
      {user ? (
        <div className={styles.accountSession}>
          <div className={styles.sectionLabel}>Session</div>
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
                disabled={loggingOut}
                onClick={() => void handleLogout()}
              >
                {loggingOut ? 'Logging out…' : 'Log out'}
              </Button>
            }
          />
        </div>
      ) : null}
      <div className={styles.dangerSection}>
        <div className={styles.sectionLabel}>Account actions</div>
        <ActionRow
          className={styles.accountItem}
          titleClassName={styles.accountItemTitle}
          descriptionClassName={styles.accountItemDesc}
          title="Change password"
          description={
            canChangePassword ? 'Update your login password' : passwordUnavailableHint
          }
          action={
            canChangePassword ? (
              <Button
                type="button"
                className={styles.actionBtn}
                onClick={() => setPasswordModalOpen(true)}
              >
                Change
              </Button>
            ) : null
          }
        />
      </div>
    </SurfaceCard>
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
  const auth = useOptionalAuth();
  const { loading, error, lessons, cards, isStudent } = useProfileLiveStats();
  const viewerLessons = filterLessonsForViewer(lessons, activeUser.role, auth?.user?.id ?? null);

  const title =
    activeUser.role === USER_ROLE.student.id
      ? 'Student statistics'
      : activeUser.role === USER_ROLE.teacher.id
        ? 'Teacher statistics'
        : activeUser.role === USER_ROLE.admin.id
          ? 'Admin statistics'
          : 'Statistics';

  return (
    <StatisticsDashboard
      roleId={activeUser.role}
      currentUserId={activeUser.id}
      liveLessons={viewerLessons}
      liveCards={isStudent ? cards : []}
      liveTitle={title}
      loading={loading}
      error={error}
    />
  );
}
