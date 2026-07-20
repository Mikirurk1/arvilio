'use client';

import { type FormEvent } from 'react';
import { UserPlus } from 'lucide-react';
import { Button, Field } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { formatTimeZoneOptionLabel } from '@pkg/types';
import { PROFICIENCY_LEVEL, TIME_ZONE } from '@pkg/types';
import type { AdminUserSummaryDto } from '@pkg/types';
import styles from './page.module.scss';

type CreatableRole = 'student' | 'teacher' | 'admin';

const ROLE_LABEL: Record<string, string> = {
  student: 'admin.role.student',
  teacher: 'admin.role.teacher',
  admin: 'admin.role.admin',
  super_admin: 'admin.role.superAdmin',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'admin.status.active',
  paused: 'admin.status.paused',
  leaved: 'admin.status.leaved',
  blocked: 'admin.status.blocked',
};

const ACCOUNT_STATUSES = ['active', 'paused', 'leaved', 'blocked'] as const;

export type CreateAccountFormValues = {
  email: string;
  displayName: string;
  phone: string;
  telegram: string;
  bio: string;
  nativeLanguageId: string;
  timezone: string;
  proficiencyLevel: '' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  status: (typeof ACCOUNT_STATUSES)[number];
  teacherId: string;
  role: CreatableRole;
};

interface Props {
  form: CreateAccountFormValues;
  setForm: React.Dispatch<React.SetStateAction<CreateAccountFormValues>>;
  formError: string | null;
  formSuccess: string | null;
  mutating: boolean;
  languages: Array<{ id: string; name: string }>;
  allowedCreatableRoles: CreatableRole[];
  assignableTeachers: Pick<AdminUserSummaryDto, 'id' | 'displayName' | 'role'>[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function CreateAccountForm({
  form, setForm, formError, formSuccess, mutating,
  languages, allowedCreatableRoles, assignableTeachers, onSubmit,
}: Props) {
  const t = useCampusT();
  return (
    <section
      className={styles.createCard}
      aria-label={t('admin.create.aria')}
      data-tour-anchor="admin-create-form"
    >
      <header className={styles.cardHeader}>
        <UserPlus size={16} />
        <div>
          <div className={styles.cardTitle}>{t('admin.create.title')}</div>
          <div className={styles.cardSub}>
            {t('admin.create.subtitle')}
          </div>
        </div>
      </header>
      <form onSubmit={onSubmit} noValidate>
        <fieldset className={styles.formSection}>
          <legend className={styles.sectionTitle}>{t('admin.create.basics')}</legend>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-email">
                {t('admin.field.email')}
              </label>
              <Field
                id="admin-create-email"
                type="email"
                className={styles.input}
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-role">
                {t('admin.field.role')}
              </label>
              <Field as="select"
                id="admin-create-role"
                className={styles.input}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as CreatableRole }))}
              >
                {allowedCreatableRoles.map((role) => (
                  <option key={role} value={role}>
                    {t(ROLE_LABEL[role])}
                  </option>
                ))}
              </Field>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-status">
                {t('admin.field.status')}
              </label>
              <Field as="select"
                id="admin-create-status"
                className={styles.input}
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as (typeof ACCOUNT_STATUSES)[number],
                  }))
                }
              >
                {ACCOUNT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(STATUS_LABEL[status])}
                  </option>
                ))}
              </Field>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-name">
                {t('admin.field.fullName')}
              </label>
              <Field
                id="admin-create-name"
                className={styles.input}
                autoComplete="name"
                placeholder={t('admin.field.fullNamePlaceholder')}
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              />
            </div>
            {form.role === 'student' ? (
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="admin-create-teacher">
                  {t('admin.field.assignedTeacher')}
                </label>
                <Field as="select"
                  id="admin-create-teacher"
                  className={styles.input}
                  value={form.teacherId}
                  onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
                >
                  <option value="">—</option>
                  {assignableTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.displayName} ({t(ROLE_LABEL[teacher.role] ?? 'admin.role.teacher')})
                    </option>
                  ))}
                </Field>
              </div>
            ) : null}
          </div>
        </fieldset>
        <fieldset className={styles.formSection}>
          <legend className={styles.sectionTitle}>{t('admin.create.details')}</legend>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-phone">
                {t('admin.field.phone')}
              </label>
              <Field
                id="admin-create-phone"
                type="tel"
                className={styles.input}
                autoComplete="tel"
                placeholder="+380 67 123 4567"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-telegram">
                {t('admin.field.telegram')}
              </label>
              <Field
                id="admin-create-telegram"
                className={styles.input}
                autoComplete="off"
                placeholder="@username"
                value={form.telegram}
                onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-native-language">
                {t('admin.field.nativeLanguage')}
              </label>
              <Field as="select"
                id="admin-create-native-language"
                className={styles.input}
                value={form.nativeLanguageId}
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
              <label className={styles.label} htmlFor="admin-create-timezone">
                {t('admin.field.timezone')}
              </label>
              <Field as="select"
                id="admin-create-timezone"
                className={styles.input}
                value={form.timezone}
                onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
              >
                {Object.values(TIME_ZONE).map((tz) => (
                  <option key={tz.id} value={tz.iana}>
                    {formatTimeZoneOptionLabel(tz)}
                  </option>
                ))}
              </Field>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-level">
                {t('admin.field.englishLevel')}
              </label>
              <Field as="select"
                id="admin-create-level"
                className={styles.input}
                value={form.proficiencyLevel}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    proficiencyLevel: e.target.value as typeof form.proficiencyLevel,
                  }))
                }
              >
                <option value="">—</option>
                {Object.values(PROFICIENCY_LEVEL).map((level) => (
                  <option key={level.id} value={level.code}>
                    {level.label}
                  </option>
                ))}
              </Field>
            </div>
          </div>
        </fieldset>
        <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="admin-create-bio">
            {t('admin.field.bio')}
          </label>
          <Field
            id="admin-create-bio"
            as="textarea"
            className={`${styles.input} ${styles.textarea}`}
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          />
        </div>
        <div className={styles.formFooter}>
          <Button type="submit" className={styles.submitBtn} loading={mutating} loadingLabel={t('admin.create.submitting')}>
            {t('admin.create.submit')}
          </Button>
          {formError ? <span className={styles.error}>{formError}</span> : null}
          {formSuccess ? <span className={styles.success}>{formSuccess}</span> : null}
        </div>
      </form>
    </section>
  );
}
