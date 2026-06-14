'use client';

import type { MyProfileDto } from '@pkg/types';
import { TIME_ZONE, formatTimeZoneOptionLabel } from '@pkg/types';
import { FileText, Phone, UserRound } from 'lucide-react';
import { Field } from '../../components/ui';
import styles from './staff-payout.module.scss';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'leaved', label: 'Left' },
  { value: 'blocked', label: 'Blocked' },
] as const;

type StaffProfileFieldsProps = {
  profile: MyProfileDto;
  onChange: (next: MyProfileDto) => void;
  disabled?: boolean;
};

export function StaffProfileFields({ profile, onChange, disabled = false }: StaffProfileFieldsProps) {
  const patch = (next: Partial<MyProfileDto>) => onChange({ ...profile, ...next });

  return (
    <div className={styles.compensationSections}>
      <section className={styles.compensationSection}>
        <header className={styles.compensationSectionHeader}>
          <span className={styles.compensationSectionIcon} aria-hidden>
            <UserRound size={16} />
          </span>
          <div>
            <h4 className={styles.compensationSectionTitle}>Identity</h4>
            <p className={styles.compensationSectionText}>
              Name and login email shown across the platform.
            </p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="staff-profile-name">
              Full name
            </label>
            <Field
              id="staff-profile-name"
              className={styles.input}
              value={profile.displayName}
              disabled={disabled}
              onChange={(event) => patch({ displayName: event.target.value })}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="staff-profile-email">
              Email
            </label>
            <Field
              id="staff-profile-email"
              className={styles.input}
              value={profile.email}
              disabled
            />
          </div>
        </div>
      </section>

      <section className={styles.compensationSection}>
        <header className={styles.compensationSectionHeader}>
          <span className={styles.compensationSectionIcon} aria-hidden>
            <Phone size={16} />
          </span>
          <div>
            <h4 className={styles.compensationSectionTitle}>Contact & timezone</h4>
            <p className={styles.compensationSectionText}>
              How admins and students reach this staff member for lessons.
            </p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="staff-profile-phone">
              Phone
            </label>
            <Field
              id="staff-profile-phone"
              type="tel"
              className={styles.input}
              value={profile.phone ?? ''}
              disabled={disabled}
              placeholder="+380 67 123 4567"
              onChange={(event) => patch({ phone: event.target.value || null })}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="staff-profile-telegram">
              Telegram
            </label>
            <Field
              id="staff-profile-telegram"
              className={styles.input}
              value={profile.telegram ?? ''}
              disabled={disabled}
              placeholder="@username"
              onChange={(event) => patch({ telegram: event.target.value || null })}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="staff-profile-timezone">
              Timezone
            </label>
            <Field
              as="select"
              id="staff-profile-timezone"
              className={styles.input}
              value={profile.timezone}
              disabled={disabled}
              onChange={(event) => patch({ timezone: event.target.value })}
            >
              {Object.values(TIME_ZONE).map((tz) => (
                <option key={tz.id} value={tz.iana}>
                  {formatTimeZoneOptionLabel(tz)}
                </option>
              ))}
            </Field>
          </div>
        </div>
      </section>

      <section className={styles.compensationSection}>
        <header className={styles.compensationSectionHeader}>
          <span className={styles.compensationSectionIcon} aria-hidden>
            <FileText size={16} />
          </span>
          <div>
            <h4 className={styles.compensationSectionTitle}>Account & bio</h4>
            <p className={styles.compensationSectionText}>
              Access state and optional public notes for internal reference.
            </p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="staff-profile-status">
              Account status
            </label>
            <Field
              as="select"
              id="staff-profile-status"
              className={styles.input}
              value={profile.status}
              disabled={disabled}
              onChange={(event) =>
                patch({
                  status: event.target.value as MyProfileDto['status'],
                })
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Field>
          </div>

          <div className={[styles.fieldGroup, styles.fieldGroupWide].join(' ')}>
            <label className={styles.label} htmlFor="staff-profile-bio">
              Bio
            </label>
            <Field
              as="textarea"
              id="staff-profile-bio"
              className={`${styles.input} ${styles.textarea}`}
              rows={4}
              value={profile.bio ?? ''}
              disabled={disabled}
              placeholder="Short internal note about this staff member…"
              onChange={(event) => patch({ bio: event.target.value || null })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function statusLabel(status: MyProfileDto['status']): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function timezoneLabel(iana: string): string {
  const entry = Object.values(TIME_ZONE).find((tz) => tz.iana === iana);
  return entry ? formatTimeZoneOptionLabel(entry) : iana;
}

export function staffProfileSummaryItems(profile: MyProfileDto, roleLabel: string) {
  return {
    roleLabel,
    statusLabel: statusLabel(profile.status),
    timezoneLabel: timezoneLabel(profile.timezone),
    phone: profile.phone?.trim() || '—',
    telegram: profile.telegram?.trim() || '—',
    bioPreview: profile.bio?.trim() || '—',
  };
}
