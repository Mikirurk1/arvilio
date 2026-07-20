'use client';

import { type FormEvent } from 'react';
import { UserPlus } from 'lucide-react';
import { Button, Field } from '../../components/ui';
import { formatTimeZoneOptionLabel } from '../../mocks';
import { PROFICIENCY_LEVEL, TIME_ZONE } from '@pkg/types';
import type { AdminUserSummaryDto } from '@pkg/types';
import styles from './page.module.scss';

type CreatableRole = 'student' | 'teacher' | 'admin';

const ROLE_LABEL: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
  super_admin: 'Super admin',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  leaved: 'Left',
  blocked: 'Blocked',
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
  return (
    <section className={styles.createCard} aria-label="Create account">
      <header className={styles.cardHeader}>
        <UserPlus size={16} />
        <div>
          <div className={styles.cardTitle}>Create account</div>
          <div className={styles.cardSub}>
            Only email is required. Role defaults to Student. Password is generated and sent by email.
          </div>
        </div>
      </header>
      <form onSubmit={onSubmit} noValidate>
        <fieldset className={styles.formSection}>
          <legend className={styles.sectionTitle}>Account basics</legend>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-email">
                Email *
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
                Role
              </label>
              <Field as="select"
                id="admin-create-role"
                className={styles.input}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as CreatableRole }))}
              >
                {allowedCreatableRoles.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABEL[role]}
                  </option>
                ))}
              </Field>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-status">
                Account status
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
                    {STATUS_LABEL[status]}
                  </option>
                ))}
              </Field>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-name">
                Full name
              </label>
              <Field
                id="admin-create-name"
                className={styles.input}
                autoComplete="name"
                placeholder="Optional — defaults from email"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              />
            </div>
            {form.role === 'student' ? (
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="admin-create-teacher">
                  Assigned teacher
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
                      {teacher.displayName} ({ROLE_LABEL[teacher.role] ?? teacher.role})
                    </option>
                  ))}
                </Field>
              </div>
            ) : null}
          </div>
        </fieldset>
        <fieldset className={styles.formSection}>
          <legend className={styles.sectionTitle}>Profile details</legend>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-phone">
                Phone
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
                Telegram
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
                Native language
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
                Timezone
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
                English level
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
            Bio
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
          <Button type="submit" className={styles.submitBtn} loading={mutating} loadingLabel="Creating…">
            Create account
          </Button>
          {formError ? <span className={styles.error}>{formError}</span> : null}
          {formSuccess ? <span className={styles.success}>{formSuccess}</span> : null}
        </div>
      </form>
    </section>
  );
}
