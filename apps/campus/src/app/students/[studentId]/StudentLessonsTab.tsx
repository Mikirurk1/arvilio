'use client';

import { useMemo, useState } from 'react';
import type { ScheduledLessonDto } from '@pkg/types';
import { EmptyStateCard, SegmentedControl, SurfaceCard } from '../../../components/ui';
import { LessonsListPanel } from '../../../components/lessons/LessonsListPanel';
import {
  filterStudentLessonsByKind,
  type LessonKindFilter,
} from '../../../lib/group-lessons-feature';
import { useCampusT } from '../../../lib/cms';
import styles from './page.module.scss';

export function StudentLessonsTab({
  lessons,
  groupLessonsEnabled = false,
}: {
  lessons: ScheduledLessonDto[];
  groupLessonsEnabled?: boolean;
}) {
  const t = useCampusT();
  const [kindFilter, setKindFilter] = useState<LessonKindFilter>('all');

  const filteredByKind = useMemo(
    () => filterStudentLessonsByKind(lessons, groupLessonsEnabled, kindFilter),
    [groupLessonsEnabled, kindFilter, lessons],
  );

  const kindFilterLabels = useMemo(
    () => ({
      individual: t('students.detail.lessons.filterIndividual'),
      group: t('students.detail.lessons.filterGroup'),
    }),
    [t],
  );

  const emptyFilterText = useMemo(() => {
    if (kindFilter === 'all') return t('students.detail.lessons.emptyFilter');
    return t('students.detail.lessons.emptyFilterKind', {
      kind: kindFilterLabels[kindFilter],
    });
  }, [kindFilter, kindFilterLabels, t]);

  if (!lessons.length) {
    return (
      <SurfaceCard className={styles.tabCard}>
        <EmptyStateCard
          title={t('students.detail.lessons.emptyTitle')}
          description={t('students.detail.lessons.emptyDesc')}
        />
      </SurfaceCard>
    );
  }
  return (
    <SurfaceCard className={styles.tabCard}>
      <h2 className={styles.tabSectionTitle}>{t('students.detail.lessons.title')}</h2>
      <p className={styles.tabIntro}>{t('students.detail.lessons.intro')}</p>
      {groupLessonsEnabled ? (
        <SegmentedControl
          className={styles.lessonsKindSwitcher}
          value={kindFilter}
          onValueChange={setKindFilter}
          ariaLabel={t('students.detail.lessons.filterAria')}
          options={[
            { value: 'all', label: t('students.detail.lessons.filterAll') },
            { value: 'individual', label: t('students.detail.lessons.filterIndividual') },
            { value: 'group', label: t('students.detail.lessons.filterGroup') },
          ]}
        />
      ) : null}
      <LessonsListPanel
        lessons={filteredByKind}
        defaultStatusFilter="all"
        showKindBadge={groupLessonsEnabled}
        emptyText={emptyFilterText}
      />
    </SurfaceCard>
  );
}
