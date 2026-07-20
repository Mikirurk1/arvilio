import { FileText, GraduationCap, Phone, UserRound } from 'lucide-react';
import { Field } from '../ui';
import {
  PROFICIENCY_LEVEL,
  TIME_ZONE_ID_LIST,
  USER_ACCOUNT_STATUS_ID_LIST,
  formatTimeZoneOptionLabel,
  getTimeZoneById,
  getUserAccountStatusById,
  type ProficiencyLevelId,
  type UserAccountStatusId,
} from '@pkg/types';
import { useCampusT } from '../../lib/cms';
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
  const t = useCampusT();

  return (
    <section className={styles.profileSection}>
      <header className={styles.profileSectionHeader}>
        <span className={styles.profileSectionIcon} aria-hidden>
          <UserRound size={16} />
        </span>
        <div>
          <h4 className={styles.profileSectionTitle}>{t('profile.section.identity')}</h4>
          <p className={styles.profileSectionText}>
            {t('profile.section.identityHint')}
          </p>
        </div>
      </header>
      <div className={styles.profileSectionBody}>
        {isFieldVisible('displayName', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-name`}>
              {t('profile.field.fullName')}
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
              {t('profile.field.email')}
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
  const t = useCampusT();

  return (
    <section className={styles.profileSection}>
      <header className={styles.profileSectionHeader}>
        <span className={styles.profileSectionIcon} aria-hidden>
          <Phone size={16} />
        </span>
        <div>
          <h4 className={styles.profileSectionTitle}>{t('profile.section.contact')}</h4>
          <p className={styles.profileSectionText}>
            {t('profile.section.contactHint')}
          </p>
        </div>
      </header>
      <div className={styles.profileSectionBody}>
        {isFieldVisible('phone', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-phone`}>
              {t('profile.field.phone')}
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
              {t('profile.field.telegram')}
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
              {t('profile.field.timezone')}
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
                    {formatTimeZoneOptionLabel(tz)}
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
  const t = useCampusT();

  return (
    <section className={styles.profileSection}>
      <header className={styles.profileSectionHeader}>
        <span className={styles.profileSectionIcon} aria-hidden>
          <GraduationCap size={16} />
        </span>
        <div>
          <h4 className={styles.profileSectionTitle}>{t('profile.section.learning')}</h4>
          <p className={styles.profileSectionText}>
            {t('profile.section.learningHint')}
          </p>
        </div>
      </header>
      <div className={styles.profileSectionBody}>
        {isFieldVisible('nativeLanguage', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-native-language`}>
              {t('profile.field.nativeLanguage')}
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
              {resolvedContext.subjectKind === 'student' ? t('profile.field.level') : t('profile.field.proficiency')}
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
  const t = useCampusT();

  return (
    <section className={styles.profileSection}>
      <header className={styles.profileSectionHeader}>
        <span className={styles.profileSectionIcon} aria-hidden>
          <FileText size={16} />
        </span>
        <div>
          <h4 className={styles.profileSectionTitle}>{t('profile.section.accountBio')}</h4>
          <p className={styles.profileSectionText}>
            {t('profile.section.accountBioHint')}
          </p>
        </div>
      </header>
      <div className={styles.profileSectionBody}>
        {isFieldVisible('studentStatus', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-student-status`}>
              {t('profile.field.status')}
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
              {t('profile.field.status')}
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
              {t('profile.field.bio')}
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
                  ? t('profile.field.bioPlaceholderStaff')
                  : t('profile.field.bioPlaceholder')
              }
              onChange={(event) => patch({ bio: event.target.value })}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
