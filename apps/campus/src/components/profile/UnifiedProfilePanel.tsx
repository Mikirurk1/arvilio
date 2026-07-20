'use client';

import { useEffect } from 'react';
import { Check, Save, UserRound } from 'lucide-react';
import { Badge, Button } from '../ui';
import { useCampusT } from '../../lib/cms';
import { selectLanguagesList, useLanguagesStore } from '../../stores/languages-store';
import { useSchoolGroupLessons } from '../../hooks/use-school-group-lessons';
import { isFieldVisible, sectionHasVisibleFields } from './profile-field-policy';
import { buildProfileSummary, profileIntro } from './profile-form-adapters';
import type { ProfileFormContext, UnifiedProfileFormValues } from './unified-profile-types';
import {
  AccountSection,
  ContactSection,
  IdentitySection,
  LearningSection,
  SchoolSection,
} from './profile-form-sections';
import styles from './ProfileForm.module.scss';

const IDENTITY_FIELDS = ['displayName', 'email'] as const;
const CONTACT_FIELDS = ['phone', 'telegram', 'timezone'] as const;
const LEARNING_FIELDS = ['nativeLanguage', 'proficiency'] as const;
const SCHOOL_FIELDS = [
  'assignedTeacher',
  'scheduleType',
  'lessonFormat',
  'userColor',
] as const;
const ACCOUNT_FIELDS = ['studentStatus', 'staffStatus', 'bio'] as const;

export type UnifiedProfilePanelProps = {
  values: UnifiedProfileFormValues;
  onChange: (patch: Partial<UnifiedProfileFormValues>) => void;
  context: ProfileFormContext;
  loading?: boolean;
  saving?: boolean;
  disabled?: boolean;
  saved?: boolean;
  saveError?: string | null;
  feedback?: string | null;
  onSave: () => void;
  saveLabel?: string;
  idPrefix?: string;
  teacherOptions?: Array<{ id: string; displayName: string }>;
};

export function UnifiedProfilePanel({
  values,
  onChange,
  context,
  loading = false,
  saving = false,
  disabled = false,
  saved = false,
  saveError = null,
  feedback = null,
  onSave,
  saveLabel = 'Save profile',
  idPrefix = 'profile',
  teacherOptions = [],
}: UnifiedProfilePanelProps) {
  const t = useCampusT();
  const languages = useLanguagesStore(selectLanguagesList);
  const fetchLanguages = useLanguagesStore((s) => s.fetchLanguages);
  const { enabled: groupLessonsFromHook } = useSchoolGroupLessons();

  const resolvedContext: ProfileFormContext = {
    ...context,
    groupLessonsEnabled: context.groupLessonsEnabled ?? groupLessonsFromHook,
  };

  const fieldsDisabled = disabled || saving;

  useEffect(() => {
    if (
      isFieldVisible('nativeLanguage', resolvedContext) ||
      isFieldVisible('proficiency', resolvedContext)
    ) {
      void fetchLanguages();
    }
  }, [fetchLanguages, resolvedContext]);

  if (loading) {
    return <p className={styles.profileLoading}>{t('common.loading')}</p>;
  }

  const summary = buildProfileSummary(values, resolvedContext, t);
  const intro = profileIntro(resolvedContext, t);

  const patch = (next: Partial<UnifiedProfileFormValues>) => onChange(next);

  const renderIdentitySection = sectionHasVisibleFields([...IDENTITY_FIELDS], resolvedContext);
  const renderContactSection = sectionHasVisibleFields([...CONTACT_FIELDS], resolvedContext);
  const renderLearningSection = sectionHasVisibleFields([...LEARNING_FIELDS], resolvedContext);
  const renderSchoolSection = sectionHasVisibleFields([...SCHOOL_FIELDS], resolvedContext);
  const renderAccountSection = sectionHasVisibleFields([...ACCOUNT_FIELDS], resolvedContext);

  return (
    <div className={styles.profilePanel}>
      <section className={styles.profileSummary} aria-label={t('profile.overviewAria')}>
        <div className={styles.profileSummaryIntro}>
          <span className={styles.profileSummaryIcon} aria-hidden>
            <UserRound size={18} />
          </span>
          <div>
            <h3 className={styles.profileSummaryTitle}>{summary.title}</h3>
            <p className={styles.profileSummaryText}>{summary.subtitle}</p>
          </div>
        </div>
        {summary.items.length > 0 ? (
          <dl className={styles.profileSummaryGrid}>
            {summary.items.map((item) => (
              <div key={item.label} className={styles.profileSummaryItem}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      <p className={styles.profileIntro}>{intro}</p>

      <div className={styles.profileSections}>
        {renderIdentitySection ? (
          <IdentitySection
            values={values} resolvedContext={resolvedContext}
            fieldsDisabled={fieldsDisabled} idPrefix={idPrefix} patch={patch}
          />
        ) : null}
        {renderContactSection ? (
          <ContactSection
            values={values} resolvedContext={resolvedContext}
            fieldsDisabled={fieldsDisabled} idPrefix={idPrefix} patch={patch}
          />
        ) : null}
        {renderLearningSection ? (
          <LearningSection
            values={values} resolvedContext={resolvedContext}
            fieldsDisabled={fieldsDisabled} idPrefix={idPrefix} patch={patch}
            languages={languages}
          />
        ) : null}
        {renderSchoolSection ? (
          <SchoolSection
            values={values} resolvedContext={resolvedContext}
            fieldsDisabled={fieldsDisabled} idPrefix={idPrefix} patch={patch}
            teacherOptions={teacherOptions}
          />
        ) : null}
        {renderAccountSection ? (
          <AccountSection
            values={values} resolvedContext={resolvedContext}
            fieldsDisabled={fieldsDisabled} idPrefix={idPrefix} patch={patch}
          />
        ) : null}
      </div>

      <footer className={styles.profileFooter}>
        <div className={styles.profileFooterMeta}>
          {saveError ? (
            <p className={styles.profileError} role="alert">
              {saveError}
            </p>
          ) : null}
          {feedback ? <p className={styles.profileFeedback}>{feedback}</p> : null}
          {saved && !saveError ? (
            resolvedContext.subjectKind === 'student' ? (
              <Badge variant="green">{t('profile.saved')}</Badge>
            ) : (
              <span className={styles.profileSaved}>
                <Check size={14} aria-hidden /> {t('profile.changesSaved')}
              </span>
            )
          ) : null}
        </div>
        <Button
          type="button"
          variant={resolvedContext.subjectKind === 'self' ? 'primary' : undefined}
          onClick={onSave}
          disabled={!resolvedContext.canEdit || fieldsDisabled}
          loading={saving}
          loadingLabel={t('profile.saving')}
        >
          {resolvedContext.subjectKind === 'staff' ? (
            <>
              <Save size={14} aria-hidden />
              {saveLabel ?? t('profile.saveProfile')}
            </>
          ) : (
            saveLabel ?? t('profile.saveProfile')
          )}
        </Button>
      </footer>
    </div>
  );
}
