'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Shield, Trash2, UserPlus } from 'lucide-react';
import { AdaptiveSelect, Button, EmptyStateCard, Field, PageHeader } from '../../components/ui';
import { useActiveRoleKey, isAdminOrSuperKey } from '../../lib/active-user';
import { useOptionalAuth } from '../../lib/auth-context';
import type { AdminUserSummaryDto } from '@soenglish/shared-types';
import { selectLanguagesList, useLanguagesStore } from '../../stores/languages-store';
import { useAdminStore } from '../../stores/admin-store';
import { confirmDialog } from '../../features/confirm';
import { toast } from '../../features/notifications';
import { ApiError } from '../../lib/api';
import { formatTimeZoneOptionLabel } from '../../mocks';
import { PROFICIENCY_LEVEL, TIME_ZONE } from '@soenglish/shared-types';
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

const emptyForm = () => ({
  email: '',
  displayName: '',
  phone: '',
  telegram: '',
  bio: '',
  nativeLanguageId: '',
  timezone: TIME_ZONE.kyiv.iana as string,
  proficiencyLevel: '' as '' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
  status: 'active' as (typeof ACCOUNT_STATUSES)[number],
  teacherId: '',
  role: 'student' as CreatableRole,
});

const TEACHING_ROLES = new Set<AdminUserSummaryDto['role']>(['teacher', 'admin', 'super_admin']);

export default function AdminUsersPage() {
  const roleKey = useActiveRoleKey();
  const auth = useOptionalAuth();
  const canAccess = isAdminOrSuperKey(roleKey);
  const canCreateAdmin = roleKey === 'super_admin';
  const allowedCreatableRoles: CreatableRole[] = canCreateAdmin
    ? ['student', 'teacher', 'admin']
    : ['student'];

  const usersSlice = useAdminStore((s) => s.users);
  const mutating = useAdminStore((s) => s.mutating);
  const fetchUsers = useAdminStore((s) => s.fetchUsers);
  const createUser = useAdminStore((s) => s.createUser);
  const deleteUser = useAdminStore((s) => s.deleteUser);

  useEffect(() => {
    if (canAccess) void fetchUsers();
  }, [canAccess, fetchUsers]);

  const isLoading = usersSlice.status === 'loading' || usersSlice.status === 'idle';
  const isError = usersSlice.status === 'error';
  const error = usersSlice.error;

  const languages = useLanguagesStore(selectLanguagesList);
  const fetchLanguages = useLanguagesStore((s) => s.fetchLanguages);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (canAccess) void fetchLanguages();
  }, [canAccess, fetchLanguages]);

  const users = usersSlice.data ?? [];
  const assignableTeachers = useMemo(() => {
    const fromList = users.filter((u) => TEACHING_ROLES.has(u.role));
    const me = auth?.user;
    if (me && TEACHING_ROLES.has(me.role) && !fromList.some((u) => u.id === me.id)) {
      return [
        {
          id: me.id,
          email: me.email,
          displayName: me.displayName,
          role: me.role,
          status: me.status,
          createdAt: new Date(0).toISOString(),
        },
        ...fromList,
      ];
    }
    return fromList;
  }, [auth?.user, users]);

  if (!canAccess) {
    return (
      <div className={`${styles.page} container container--page`}>
        <EmptyStateCard
          title="No permission"
          description="Admin user management is available only for admins and super-admins."
        />
      </div>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    try {
      const result = await createUser({
        email: form.email.trim().toLowerCase(),
        role: form.role,
        displayName: form.displayName.trim() || null,
        phone: form.phone.trim() || null,
        telegram: form.telegram.trim() || null,
        bio: form.bio.trim() || null,
        nativeLanguageId: form.nativeLanguageId.trim() || null,
        timezone: form.timezone || null,
        proficiencyLevel: form.proficiencyLevel || null,
        status: form.status,
        teacherId: form.role === 'student' && form.teacherId ? form.teacherId : null,
      });
      const emailNote = result.welcomeEmailSent
        ? ' A welcome email with login credentials was sent.'
        : ' Welcome email was not sent (check SMTP / Mailtrap settings).';
      setFormSuccess(`Created ${ROLE_LABEL[form.role] ?? form.role} ${form.email}.${emailNote}`);
      setForm(emptyForm());
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to create user';
      setFormError(message);
    }
  };

  const onDelete = async (id: string, label: string, userRole: string) => {
    const lessonNote =
      userRole === 'student' || userRole === 'teacher'
        ? ' Their scheduled lessons will also be removed.'
        : '';
    const ok = await confirmDialog({
      title: 'Delete user?',
      message: `Delete ${label}? This cannot be undone.${lessonNote}`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteUser(id);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to delete user';
      toast.error('Could not delete user', message);
    }
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title="Account administration"
        subtitle={
          canCreateAdmin
            ? 'Create student, teacher and admin accounts. A temporary password is generated and emailed automatically. SUPER_ADMIN accounts use the CLI only.'
            : 'Create student accounts. Login credentials are emailed to the user.'
        }
      />

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
        <form onSubmit={onSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-email">
                Email *
              </label>
              <Field
                id="admin-create-email"
                type="email"
                className={styles.input}
                autoComplete="off"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-role">
                Role
              </label>
              <AdaptiveSelect
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
              </AdaptiveSelect>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-name">
                Full name
              </label>
              <Field
                id="admin-create-name"
                className={styles.input}
                autoComplete="off"
                placeholder="Optional — defaults from email"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-status">
                Account status
              </label>
              <AdaptiveSelect
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
              </AdaptiveSelect>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-phone">
                Phone
              </label>
              <Field
                id="admin-create-phone"
                type="tel"
                className={styles.input}
                autoComplete="off"
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
              <AdaptiveSelect
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
              </AdaptiveSelect>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-timezone">
                Timezone
              </label>
              <AdaptiveSelect
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
              </AdaptiveSelect>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="admin-create-level">
                English level
              </label>
              <AdaptiveSelect
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
              </AdaptiveSelect>
            </div>
            {form.role === 'student' ? (
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="admin-create-teacher">
                  Assigned teacher
                </label>
                <AdaptiveSelect
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
                </AdaptiveSelect>
              </div>
            ) : null}
          </div>
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
            <Button type="submit" className={styles.submitBtn} disabled={mutating}>
              {mutating ? 'Creating…' : 'Create account'}
            </Button>
            {formError ? <span className={styles.error}>{formError}</span> : null}
            {formSuccess ? <span className={styles.success}>{formSuccess}</span> : null}
          </div>
        </form>
      </section>

      <section className={styles.listCard} aria-label="Users">
        <header className={styles.cardHeader}>
          <Shield size={16} />
          <div>
            <div className={styles.cardTitle}>Existing accounts</div>
            <div className={styles.cardSub}>
              {canCreateAdmin
                ? 'Showing all non-SUPER_ADMIN accounts. To manage SUPER_ADMIN use the `super-admin` CLI.'
                : 'Showing students, teachers, and admins (admins can be assigned as teachers).'}
            </div>
          </div>
          <Button
            type="button"
            className={styles.refreshBtn}
            onClick={() => void fetchUsers(true)}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </header>
        {isLoading ? <div className={styles.muted}>Loading…</div> : null}
        {isError ? (
          <div className={styles.error}>
            Failed to load users: {error ?? 'unknown error'}
          </div>
        ) : null}
        {!isLoading && !isError && users.length === 0 ? (
          <div className={styles.muted}>No accounts yet.</div>
        ) : null}
        {users.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const canDelete =
                    user.role !== 'super_admin' &&
                    (canCreateAdmin || user.role === 'student');
                  return (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{user.displayName}</td>
                      <td>
                        <span className={`${styles.role} ${styles[`role_${user.role}`]}`}>
                          {ROLE_LABEL[user.role] ?? user.role}
                        </span>
                      </td>
                      <td>{STATUS_LABEL[user.status] ?? user.status}</td>
                      <td className={styles.created}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className={styles.rowActions}>
                        {canDelete ? (
                          <Button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => onDelete(user.id, user.email, user.role)}
                            disabled={mutating}
                            aria-label={`Delete ${user.email}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
