'use client';

import { useMemo, useState } from 'react';
import type { ScheduledLessonDto } from '@pkg/types';
import { EmptyStateCard, SegmentedControl, SurfaceCard } from '../../../components/ui';
import { LessonsListPanel } from '../../../components/lessons/LessonsListPanel';
import {
  filterStudentLessonsByKind,
  type LessonKindFilter,
} from '../../../lib/group-lessons-feature';
import styles from './page.module.scss';

export function StudentLessonsTab({
  lessons,
  groupLessonsEnabled = false,
}: {
  lessons: ScheduledLessonDto[];
  groupLessonsEnabled?: boolean;
}) {
  const [kindFilter, setKindFilter] = useState<LessonKindFilter>('all');

  const filteredByKind = useMemo(
    () => filterStudentLessonsByKind(lessons, groupLessonsEnabled, kindFilter),
    [groupLessonsEnabled, kindFilter, lessons],
  );

  if (!lessons.length) {
    return (
      <SurfaceCard className={styles.tabCard}>
        <EmptyStateCard title="No lessons yet" description="Plan a lesson in the Schedule tab." />
      </SurfaceCard>
    );
  }
  return (
    <SurfaceCard className={styles.tabCard}>
      <h2 className={styles.tabSectionTitle}>Lessons</h2>
      <p className={styles.tabIntro}>
        Browse all lessons for this student. Individual and group lessons may use different billing
        rules.
      </p>
      {groupLessonsEnabled ? (
        <SegmentedControl
          className={styles.lessonsKindSwitcher}
          value={kindFilter}
          onValueChange={setKindFilter}
          ariaLabel="Filter lessons by format"
          options={[
            { value: 'all', label: 'All' },
            { value: 'individual', label: 'Individual' },
            { value: 'group', label: 'Group' },
          ]}
        />
      ) : null}
      <LessonsListPanel
        lessons={filteredByKind}
        defaultStatusFilter="all"
        showKindBadge={groupLessonsEnabled}
        emptyText={
          kindFilter === 'all'
            ? 'No lessons match your filters.'
            : `No ${kindFilter} lessons for this student.`
        }
      />
    </SurfaceCard>
  );
}
