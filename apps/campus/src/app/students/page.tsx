'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmptyStateCard, PageHeader, SegmentedControl } from '../../components/ui';
import { StudentSummaryCard } from '../../components/students';
import { USER_ROLE } from '../../mocks';
import { useSchoolGroupLessons } from '../../hooks/use-school-group-lessons';
import {
  resolveStudentsPageSubtitle,
  resolveStudentsPageView,
} from '../../lib/group-lessons-feature';
import { useActiveUser } from '../../lib/active-user';
import { mapBackendStudentToProfile } from '../../lib/student-profile';
import { useStudentsStore } from '../../stores/students-store';
import { StudentsGroupsPanel } from './StudentsGroupsPanel';
import styles from './page.module.scss';

type StudentsView = 'students' | 'groups';

export default function StudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeUser = useActiveUser();
  const list = useStudentsStore((s) => s.list);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);
  const { enabled: groupLessonsEnabled } = useSchoolGroupLessons();

  const viewFromUrl: StudentsView = resolveStudentsPageView(
    groupLessonsEnabled,
    searchParams.get('view'),
  );
  const [view, setView] = useState<StudentsView>(viewFromUrl);

  useEffect(() => {
    setView(viewFromUrl);
  }, [viewFromUrl]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const rows = list.data ?? [];
  const students = rows.map((row) => mapBackendStudentToProfile(row));
  const isLoading = list.status === 'loading' || list.status === 'idle';
  const isError = list.status === 'error';

  const pageTitle = groupLessonsEnabled ? 'Students & Groups' : 'Students';
  const pageSubtitle = resolveStudentsPageSubtitle(
    groupLessonsEnabled,
    activeUser.role === USER_ROLE.teacher.id,
  );

  const switcherOptions = useMemo(
    () =>
      [
        { value: 'students' as const, label: 'Students' },
        { value: 'groups' as const, label: 'Groups' },
      ] as const,
    [],
  );

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={pageTitle}
        subtitle={pageSubtitle}
      />

      {groupLessonsEnabled ? (
        <SegmentedControl
          className={styles.viewSwitcher}
          value={view}
          onValueChange={(next) => {
            setView(next);
            router.replace(next === 'groups' ? '/students?view=groups' : '/students', {
              scroll: false,
            });
          }}
          options={switcherOptions}
          ariaLabel="Students page view"
        />
      ) : null}

      <div className={styles.viewShell}>
        <div className={styles.viewPane} hidden={view !== 'students'}>
          {isLoading ? <p className={styles.loadingHint}>Loading students…</p> : null}
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
                  avatarUrl={row.avatarUrl}
                  color={row.displayColor}
                />
              ))}
            </div>
          ) : null}
        </div>

        {groupLessonsEnabled ? (
          <div className={styles.viewPane} hidden={view !== 'groups'}>
            <StudentsGroupsPanel />
          </div>
        ) : null}
      </div>
    </div>
  );
}
