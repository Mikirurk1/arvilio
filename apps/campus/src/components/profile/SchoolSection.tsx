'use client';

import type { StudentLessonFormat } from '@pkg/types';
import { GraduationCap } from 'lucide-react';
import { Field } from '../ui';
import { useCampusT } from '../../lib/cms';
import { isAdminOrSuper } from '../../lib/roles';
import { isFieldVisible } from './profile-field-policy';
import { LessonFormatField } from './LessonFormatField';
import { UserColorPicker } from './UserColorPicker';
import type { ProfileFormContext, UnifiedProfileFormValues } from './unified-profile-types';
import { fieldDisabled } from './profile-section-utils';
import styles from './ProfileForm.module.scss';

interface SchoolSectionProps {
  values: UnifiedProfileFormValues;
  resolvedContext: ProfileFormContext;
  fieldsDisabled: boolean;
  idPrefix: string;
  patch: (next: Partial<UnifiedProfileFormValues>) => void;
  teacherOptions: Array<{ id: string; displayName: string }>;
}

export function SchoolSection({ values, resolvedContext, fieldsDisabled, idPrefix, patch, teacherOptions }: SchoolSectionProps) {
  const t = useCampusT();
  const canAssignTeacher = isAdminOrSuper(resolvedContext.viewerRole);
  return (
    <section className={styles.profileSection}>
      <header className={styles.profileSectionHeader}>
        <span className={styles.profileSectionIcon} aria-hidden>
          <GraduationCap size={16} />
        </span>
        <div>
          <h4 className={styles.profileSectionTitle}>{t('profile.school.title')}</h4>
          <p className={styles.profileSectionText}>
            {t('profile.school.hint')}
          </p>
        </div>
      </header>
      <div className={styles.profileSectionBody}>
        {isFieldVisible('assignedTeacher', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-teacher`}>
              {t('profile.school.assignedTeacher')}
            </label>
            <Field
              as="select"
              id={`${idPrefix}-teacher`}
              className={styles.input}
              value={values.assignedTeacherId ?? ''}
              disabled={fieldDisabled('assignedTeacher', resolvedContext, fieldsDisabled)}
              onChange={(event) =>
                patch({ assignedTeacherId: event.target.value || null })
              }
            >
              <option value="">—</option>
              {teacherOptions.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.displayName}
                </option>
              ))}
            </Field>
          </div>
        ) : null}

        {isFieldVisible('scheduleType', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`${idPrefix}-schedule`}>
              {t('profile.school.scheduleType')}
            </label>
            <Field
              as="select"
              id={`${idPrefix}-schedule`}
              className={styles.input}
              value={String(values.scheduleType ?? false)}
              disabled={fieldDisabled('scheduleType', resolvedContext, fieldsDisabled)}
              onChange={(event) =>
                patch({ scheduleType: event.target.value === 'true' })
              }
            >
              <option value="true">{t('profile.school.scheduleFixed')}</option>
              <option value="false">{t('profile.school.scheduleFlexible')}</option>
            </Field>
          </div>
        ) : null}

        {isFieldVisible('lessonFormat', resolvedContext) ? (
          <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
            <label className={styles.label}>{t('profile.school.lessonFormat')}</label>
            <p className={styles.fieldHint}>
              {canAssignTeacher
                ? t('profile.school.lessonFormatHintAdmin')
                : t('profile.school.lessonFormatHintViewer')}
            </p>
            <LessonFormatField
              value={values.lessonFormat}
              readOnly={fieldDisabled('lessonFormat', resolvedContext, fieldsDisabled)}
              onChange={(lessonFormat: StudentLessonFormat) => patch({ lessonFormat })}
            />
          </div>
        ) : null}

        {isFieldVisible('userColor', resolvedContext) ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('profile.school.userColor')}</label>
            <UserColorPicker
              value={values.userColor ?? ''}
              disabled={fieldDisabled('userColor', resolvedContext, fieldsDisabled)}
              onChange={(userColor) => patch({ userColor })}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
