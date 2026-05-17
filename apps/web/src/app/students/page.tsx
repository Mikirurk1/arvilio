'use client';

import { useEffect } from 'react';
import { EmptyStateCard, PageHeader } from '../../components/ui';
import { StudentSummaryCard } from '../../components/students';
import {
  canView,
  isTeacherAdminOrSuper,
  USER_ROLE,
  type MockStudent,
} from '../../mocks';
import { useActiveUser } from '../../lib/active-user';
import { mapBackendStudentToProfile } from '../../lib/student-profile';
import { useStudentsStore } from '../../stores/students-store';
import styles from './page.module.scss';

export default function StudentsPage() {
  const activeUser = useActiveUser();
  const list = useStudentsStore((s) => s.list);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);
  const allowedRoles = isTeacherAdminOrSuper(activeUser.role);

  useEffect(() => {
    if (allowedRoles) void fetchStudents();
  }, [allowedRoles, fetchStudents]);

  if (!allowedRoles || !canView('dashboard', activeUser.role)) {
    return (
      <div className={`${styles.page} container container--page`}>
        <EmptyStateCard
          title="No permission"
          description="Students section is available only for teacher, admin, and super admin roles."
        />
      </div>
    );
  }

  const rows = list.data ?? [];
  const students = rows.map((row) => mapBackendStudentToProfile(row));
  const isLoading = list.status === 'loading' || list.status === 'idle';
  const isError = list.status === 'error';

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title="Students"
        subtitle={
          activeUser.role === USER_ROLE.teacher.id
            ? 'Only students assigned to you'
            : 'All students and their assigned teachers'
        }
      />

      {isLoading ? <p className={styles.pageSub}>Loading students…</p> : null}
      {isError ? (
        <EmptyStateCard title="Could not load students" description={list.error ?? 'Unknown error'} />
      ) : null}

      {!isLoading && !isError && students.length === 0 ? (
        <EmptyStateCard
          title="No students in this scope"
          description={
            activeUser.role === USER_ROLE.teacher.id
              ? 'No students are currently assigned to you.'
              : 'No students found.'
          }
        />
      ) : null}

      {students.length > 0 ? (
        <div className={styles.grid}>
          {rows.map((row, index) => (
            <StudentSummaryCard
              key={row.id}
              student={students[index]!}
              profileId={row.id}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
