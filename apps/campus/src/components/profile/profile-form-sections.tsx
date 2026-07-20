import { FileText, GraduationCap, Phone, UserRound } from 'lucide-react';
import { Field } from '../ui';
import {
  PROFICIENCY_LEVEL,
  TIME_ZONE_ID_LIST,
  USER_ACCOUNT_STATUS_ID_LIST,
  formatTimeZoneOptionLabel as formatMockTimeZoneLabel,
  getTimeZoneById,
  getUserAccountStatusById,
  type ProficiencyLevelId,
  type UserAccountStatusId,
} from '../../mocks';
import { isFieldVisible } from './profile-field-policy';
import { fieldDisabled } from './profile-section-utils';
import type { ProfileFormContext, UnifiedProfileFormValues } from './unified-profile-types';
import styles from './ProfileForm.module.scss';

export { SchoolSection } from './SchoolSection';

const STAFF_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'leaved', label: 'Left' },
  { value: 'blocked', label: 'Blocked' },
] as const;

interface SectionProps {
  values: UnifiedProfileFormValues;
  resolvedContext: ProfileFormContext;
  fieldsDisabled: boolean;
  idPrefix: string;
  patch: (next: Partial<UnifiedProfileFormValues>) => void;
}

export function IdentitySection({ values, resolvedContext, fieldsDisabled, idPrefix, patch }: SectionProps) {
  return (
    <section className={styles.profileSection}>
      <header className={styles.profileSectionHeader}>
        <span className={styles.profileSectionIcon} aria-hidden>
          <UserRound size={16} />
        </span>
        <div>
          <h4 className={styles.profileSectionTitle}>Identity</h4>
          <p className={styles.profileSectionText}>
            Name and login email shown across the platform.
          </p>
        </div>
      </header>
      <div className={styles.profileSectionBody}>
        {isFieldVisible('displayName', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-name`}>
              Full name
            </label>
            <Field
              id={`${idPrefix}-name`}
              className={styles.input}
              value={values.displayName}
              disabled={fieldDisabled('displayName', resolvedContext, fieldsDisabled)}
              onChange={(event) => patch({ displayName: event.target.value })}
            />
          </div>
        ) : null}

        {isFieldVisible('email', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-email`}>
              Email
            </label>
            <Field
              id={`${idPrefix}-email`}
              className={styles.input}
              value={values.email}
              disabled={fieldDisabled('email', resolvedContext, fieldsDisabled)}
              onChange={(event) => patch({ email: event.target.value })}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ContactSection({ values, resolvedContext, fieldsDisabled, idPrefix, patch }: SectionProps) {
  return (
    <section className={styles.profileSection}>
      <header className={styles.profileSectionHeader}>
        <span className={styles.profileSectionIcon} aria-hidden>
          <Phone size={16} />
        </span>
        <div>
          <h4 className={styles.profileSectionTitle}>Contact & timezone</h4>
          <p className={styles.profileSectionText}>
            How admins, teachers, and students reach this person.
          </p>
        </div>
      </header>
      <div className={styles.profileSectionBody}>
        {isFieldVisible('phone', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-phone`}>
              Phone
            </label>
            <Field
              id={`${idPrefix}-phone`}
              type="tel"
              className={styles.input}
              value={values.phone}
              placeholder="+380 67 123 4567"
              disabled={fieldDisabled('phone', resolvedContext, fieldsDisabled)}
              onChange={(event) => patch({ phone: event.target.value })}
            />
          </div>
        ) : null}

        {isFieldVisible('telegram', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-telegram`}>
              Telegram
            </label>
            <Field
              id={`${idPrefix}-telegram`}
              className={styles.input}
              value={values.telegram}
              placeholder="@username"
              disabled={fieldDisabled('telegram', resolvedContext, fieldsDisabled)}
              onChange={(event) => patch({ telegram: event.target.value })}
            />
          </div>
        ) : null}

        {isFieldVisible('timezone', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-timezone`}>
              Timezone
            </label>
            <Field
              as="select"
              id={`${idPrefix}-timezone`}
              className={styles.input}
              value={String(values.timezoneId)}
              disabled={fieldDisabled('timezone', resolvedContext, fieldsDisabled)}
              onChange={(event) =>
                patch({
                  timezoneId: Number(event.target.value) as UnifiedProfileFormValues['timezoneId'],
                })
              }
            >
              {TIME_ZONE_ID_LIST.map((id) => {
                const tz = getTimeZoneById(id);
                return tz ? (
                  <option key={id} value={id}>
                    {formatMockTimeZoneLabel(tz)}
                  </option>
                ) : null;
              })}
            </Field>
          </div>
        ) : null}
      </div>
    </section>
  );
}

interface LearningSectionProps extends SectionProps {
  languages: Array<{ id: string; name: string }>;
}

export function LearningSection({ values, resolvedContext, fieldsDisabled, idPrefix, patch, languages }: LearningSectionProps) {
  return (
    <section className={styles.profileSection}>
      <header className={styles.profileSectionHeader}>
        <span className={styles.profileSectionIcon} aria-hidden>
          <GraduationCap size={16} />
        </span>
        <div>
          <h4 className={styles.profileSectionTitle}>Learning</h4>
          <p className={styles.profileSectionText}>
            Native language and current proficiency level.
          </p>
        </div>
      </header>
      <div className={styles.profileSectionBody}>
        {isFieldVisible('nativeLanguage', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-native-language`}>
              Native language
            </label>
            <Field
              as="select"
              id={`${idPrefix}-native-language`}
              className={styles.input}
              value={values.nativeLanguageId}
              disabled={fieldDisabled('nativeLanguage', resolvedContext, fieldsDisabled)}
              onChange={(event) => patch({ nativeLanguageId: event.target.value })}
            >
              <option value="">—</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </Field>
          </div>
        ) : null}

        {isFieldVisible('proficiency', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-proficiency`}>
              {resolvedContext.subjectKind === 'student' ? 'Level' : 'Proficiency'}
            </label>
            <Field
              as="select"
              id={`${idPrefix}-proficiency`}
              className={styles.input}
              value={String(values.proficiencyLevelId)}
              readOnly={fieldDisabled('proficiency', resolvedContext, fieldsDisabled)}
              disabled={fieldsDisabled}
              onChange={(event) =>
                patch({
                  proficiencyLevelId: Number(event.target.value) as ProficiencyLevelId,
                })
              }
            >
              {(Object.keys(PROFICIENCY_LEVEL) as (keyof typeof PROFICIENCY_LEVEL)[]).map(
                (key) => {
                  const level = PROFICIENCY_LEVEL[key];
                  return (
                    <option key={level.id} value={level.id}>
                      {level.code} — {level.label}
                    </option>
                  );
                },
              )}
            </Field>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function AccountSection({ values, resolvedContext, fieldsDisabled, idPrefix, patch }: SectionProps) {
  return (
    <section className={styles.profileSection}>
      <header className={styles.profileSectionHeader}>
        <span className={styles.profileSectionIcon} aria-hidden>
          <FileText size={16} />
        </span>
        <div>
          <h4 className={styles.profileSectionTitle}>Account & bio</h4>
          <p className={styles.profileSectionText}>
            Access state and optional notes for internal reference.
          </p>
        </div>
      </header>
      <div className={styles.profileSectionBody}>
        {isFieldVisible('studentStatus', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-student-status`}>
              Status
            </label>
            <Field
              as="select"
              id={`${idPrefix}-student-status`}
              className={styles.input}
              value={String(values.studentStatusId ?? '')}
              disabled={fieldDisabled('studentStatus', resolvedContext, fieldsDisabled)}
              onChange={(event) =>
                patch({
                  studentStatusId: Number(event.target.value) as UserAccountStatusId,
                })
              }
            >
              {USER_ACCOUNT_STATUS_ID_LIST.map((id) => (
                <option key={id} value={id}>
                  {getUserAccountStatusById(id)?.name ?? '—'}
                </option>
              ))}
            </Field>
          </div>
        ) : null}

        {isFieldVisible('staffStatus', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-staff-status`}>
              Account status
            </label>
            <Field
              as="select"
              id={`${idPrefix}-staff-status`}
              className={styles.input}
              value={values.staffStatus ?? 'active'}
              disabled={fieldDisabled('staffStatus', resolvedContext, fieldsDisabled)}
              onChange={(event) =>
                patch({
                  staffStatus: event.target.value as UnifiedProfileFormValues['staffStatus'],
                })
              }
            >
              {STAFF_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Field>
          </div>
        ) : null}

        {isFieldVisible('bio', resolvedContext) ? (
          <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
            <label className={styles.label} htmlFor={`${idPrefix}-bio`}>
              Bio
            </label>
            <Field
              as="textarea"
              id={`${idPrefix}-bio`}
              className={`${styles.input} ${styles.textarea}`}
              rows={4}
              value={values.bio}
              disabled={fieldDisabled('bio', resolvedContext, fieldsDisabled)}
              placeholder={
                resolvedContext.subjectKind === 'staff'
                  ? 'Short internal note about this staff member…'
                  : 'Tell us a bit about yourself…'
              }
              onChange={(event) => patch({ bio: event.target.value })}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
