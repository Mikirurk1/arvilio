'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Users, UserCheck, GraduationCap } from 'lucide-react';
import { PageHeader } from '../../components/ui';
import { useActiveRoleKey } from '../../lib/active-user';
import { useOptionalAuth } from '../../lib/auth-context';
import type { AdminUserSummaryDto } from '@pkg/types';
import { selectLanguagesList, useLanguagesStore } from '../../stores/languages-store';
import { useAdminStore } from '../../stores/admin-store';
import { confirmDialog } from '../../features/confirm';
import { toast } from '../../features/notifications';
import { ApiError } from '../../lib/api';
import { TIME_ZONE } from '@pkg/types';
import { CreateAccountForm, type CreateAccountFormValues } from './CreateAccountForm';
import { UsersTable } from './UsersTable';
import { StudentImportPanel } from '../../features/student-import/StudentImportPanel';
import styles from './page.module.scss';

type CreatableRole = 'student' | 'teacher' | 'admin';

const TEACHING_ROLES = new Set<AdminUserSummaryDto['role']>(['teacher', 'admin', 'super_admin']);

const ROLE_LABEL: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
  super_admin: 'Super admin',
};

const emptyForm = (): CreateAccountFormValues => ({
  email: '',
  displayName: '',
  phone: '',
  telegram: '',
  bio: '',
  nativeLanguageId: '',
  timezone: TIME_ZONE.kyiv.iana as string,
  proficiencyLevel: '',
  status: 'active',
  teacherId: '',
  role: 'student',
});

export default function AdminUsersPage() {
  const roleKey = useActiveRoleKey();
  const auth = useOptionalAuth();
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
    void fetchUsers();
  }, [fetchUsers]);

  const isLoading = usersSlice.status === 'loading' || usersSlice.status === 'idle';
  const isError = usersSlice.status === 'error';
  const error = usersSlice.error;

  const languages = useLanguagesStore(selectLanguagesList);
  const fetchLanguages = useLanguagesStore((s) => s.fetchLanguages);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    void fetchLanguages();
  }, [fetchLanguages]);

  const users = usersSlice.data ?? [];
  const studentCount = users.filter((user) => user.role === 'student').length;
  const teacherCount = users.filter((user) =>
    user.role === 'teacher' || user.role === 'admin' || user.role === 'super_admin',
  ).length;
  const activeCount = users.filter((user) => user.status === 'active').length;
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
      title: 'Delete this account?',
      message: `Are you sure you want to delete ${label}? This cannot be undone.${lessonNote}`,
      confirmLabel: 'Delete account',
      cancelLabel: 'Cancel',
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

      <section className={styles.metricsGrid} aria-label="Accounts overview">
        <article className={styles.metricCard}>
          <span className={styles.metricIcon} aria-hidden>
            <Users size={16} />
          </span>
          <p className={styles.metricLabel}>All accounts</p>
          <p className={styles.metricValue}>{users.length}</p>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricIcon} aria-hidden>
            <GraduationCap size={16} />
          </span>
          <p className={styles.metricLabel}>Students</p>
          <p className={styles.metricValue}>{studentCount}</p>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricIcon} aria-hidden>
            <UserCheck size={16} />
          </span>
          <p className={styles.metricLabel}>Active accounts</p>
          <p className={styles.metricValue}>{activeCount}</p>
          <p className={styles.metricSub}>
            {teacherCount} teaching users (teachers and admins)
          </p>
        </article>
      </section>

      <CreateAccountForm
        form={form}
        setForm={setForm}
        formError={formError}
        formSuccess={formSuccess}
        mutating={mutating}
        languages={languages}
        allowedCreatableRoles={allowedCreatableRoles}
        assignableTeachers={assignableTeachers}
        onSubmit={onSubmit}
      />

      <StudentImportPanel />

      <UsersTable
        users={users}
        isLoading={isLoading}
        isError={isError}
        error={error}
        canCreateAdmin={canCreateAdmin}
        mutating={mutating}
        onDelete={(id, label, role) => void onDelete(id, label, role)}
        onRefresh={() => void fetchUsers(true)}
      />
    </div>
  );
}
