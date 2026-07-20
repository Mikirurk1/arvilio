'use client';

import { BookOpen, CheckCircle2, Clock3, Timer } from 'lucide-react';
import { EmptyStateCard, StatTile } from '../ui';
import { useStudentLiveStats } from '../../hooks/use-student-live-stats';
import styles from './ProfileLiveStatistics.module.scss';

export function StudentLiveStatistics({ studentId }: { studentId: string }) {
  const { loading, error, summary, overview, lessonHoursLabel } = useStudentLiveStats(studentId);

  if (loading) {
    return <p className={styles.muted}>Loading statistics from the server…</p>;
  }

  if (error) {
    return (
      <EmptyStateCard
        title="Could not load statistics"
        description={error ?? 'Check that the API is running and try again.'}
      />
    );
  }

  if (!summary) {
    return (
      <EmptyStateCard
        title="No statistics yet"
        description="Complete a lesson or add vocabulary to see activity here."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.note}>Figures below are loaded from the database for this student.</p>
      <div className={styles.grid}>
        <StatTile
          icon={<BookOpen size={16} />}
          label="Vocabulary cards"
          value={String(summary.vocabularyCount)}
          subtext={
            overview
              ? `${overview.masteredWords} mastered · ${overview.dueToday} due for review`
              : `${summary.reviewCount} to review`
          }
        />
        <StatTile
          icon={<CheckCircle2 size={16} />}
          label="Lessons completed"
          value={String(summary.lessonsCompleted)}
          subtext="All-time completed lessons"
        />
        <StatTile
          icon={<Timer size={16} />}
          label="Lesson hours"
          value={lessonHoursLabel}
          subtext="Sum of completed lesson durations"
        />
        <StatTile
          icon={<Clock3 size={16} />}
          label="Lessons today"
          value={String(summary.lessonsToday)}
          subtext={`${summary.lessonsThisWeek} scheduled this week`}
        />
      </div>
    </div>
  );
}
