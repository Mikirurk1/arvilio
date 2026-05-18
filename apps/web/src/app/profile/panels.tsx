'use client';

import { ActionRow, AdaptiveSelect, Button, Field, SegmentedControl, SettingsToggleRow, SurfaceCard } from '../../components/ui';
import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import type { ProfileLinkedAccountDto } from '@soenglish/shared-types';
import { TelegramConnectButton } from '../../components/profile/TelegramConnectButton';
import { FACEBOOK_LINK_URL, GOOGLE_LINK_URL } from '../../lib/api';
import { ProfileAchievementsPanel } from '../../components/profile/ProfileAchievementsPanel';
import { StatisticsDashboard } from '../../components/statistics';
import {
  formatTimeZoneOptionLabel,
  PROFICIENCY_LEVEL,
  TIME_ZONE_ID_LIST,
  USER_ROLE,
  getTimeZoneById,
  type LinkedAccountLink,
  type ProficiencyLevelId,
  type TimeZoneId,
  type UserRole,
} from '../../mocks';
import styles from './page.module.scss';

type ProfileFormState = {
  name: string;
  email: string;
  telegram: string;
  phone: string;
  timezoneId: TimeZoneId;
  nativeLanguage: string;
  proficiencyLevelId: ProficiencyLevelId;
  bio: string;
};

type NotificationsState = {
  lessonReminder: boolean;
  streakAlert: boolean;
  weeklyReport: boolean;
  newVocab: boolean;
  teacherMessages: boolean;
};

export function ProfileDetailsPanel({
  form,
  setForm,
  saved,
  viewerRole,
  onSave,
}: {
  form: ProfileFormState;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormState>>;
  saved: boolean;
  viewerRole: UserRole;
  onSave: () => void;
}) {
  const isStudentViewer = viewerRole === USER_ROLE.student.id;

  return (
    <SurfaceCard className={styles.formCard}>
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Full name</label>
          <Field className={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <Field className={styles.input} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Phone</label>
          <Field
            type="tel"
            className={styles.input}
            value={form.phone}
            placeholder="+380 67 123 4567"
            autoComplete="tel"
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Telegram</label>
          <Field className={styles.input} value={form.telegram} onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Timezone</label>
          <AdaptiveSelect
            className={styles.input}
            value={String(form.timezoneId)}
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
          </AdaptiveSelect>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Native language</label>
          <AdaptiveSelect className={styles.input} value={form.nativeLanguage} onChange={(e) => setForm((f) => ({ ...f, nativeLanguage: e.target.value }))}>
            <option>Ukrainian</option>
            <option>Russian</option>
            <option>Polish</option>
            <option>German</option>
            <option>French</option>
          </AdaptiveSelect>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Proficiency</label>
          <AdaptiveSelect
            className={styles.input}
            value={String(form.proficiencyLevelId)}
            readOnly={isStudentViewer}
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
          </AdaptiveSelect>
        </div>
      </div>
      <div className={styles.fieldGroup} style={{ marginTop: 16 }}>
        <label className={styles.label}>Bio</label>
        <Field as="textarea" className={`${styles.input} ${styles.textarea}`} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} />
      </div>
      <div className={styles.formFooter}>
        {saved && (
          <span className={styles.savedMsg}>
            <Check size={14} /> Changes saved
          </span>
        )}
        <Button type="button" className={styles.saveBtn} onClick={onSave}>
          Save changes
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
}: {
  notifications: NotificationsState;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationsState>>;
}) {
  return (
    <SurfaceCard className={styles.formCard}>
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
          checked={notifications[key as keyof NotificationsState]}
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

export function AccountPanel() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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
          description="Update your login password"
          action={<Button type="button" className={styles.actionBtn}>Change</Button>}
        />
        <ActionRow
          className={styles.accountItem}
          titleClassName={styles.accountItemTitle}
          descriptionClassName={styles.accountItemDesc}
          title="Export my data"
          description="Download your learning history and vocabulary"
          action={<Button type="button" className={styles.actionBtn}>Export</Button>}
        />
        <ActionRow
          className={`${styles.accountItem} ${styles.dangerItem}`}
          titleClassName={styles.accountItemTitle}
          descriptionClassName={styles.accountItemDesc}
          title={<span style={{ color: 'var(--rose)' }}>Delete account</span>}
          description="Permanently delete all your data. This cannot be undone."
          action={<Button type="button" className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>Delete</Button>}
        />
      </div>
    </SurfaceCard>
  );
}

export function AchievementsPanel({
  achievements,
}: {
  achievements: Array<{ icon: ReactNode; label: string; description?: string; unlocked: boolean }>;
}) {
  return <ProfileAchievementsPanel achievements={achievements} />;
}

export function ProfileStatisticsPanel({
  roleId,
  userId,
}: {
  roleId: UserRole;
  userId: number;
}) {
  return <StatisticsDashboard roleId={roleId} currentUserId={userId} subjectStudentId={roleId === USER_ROLE.student.id ? userId : undefined} />;
}
