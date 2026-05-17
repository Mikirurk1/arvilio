'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Video } from 'lucide-react';
import { useLessonsStore } from '../../stores/lessons-store';
import styles from './backend-panels.module.scss';

type Props = {
  /** Backend scheduled-lesson UUID — refreshes meet URL from store when prop is empty. */
  lessonBackendId?: string | null;
  /** Meet URL from lesson context (set automatically when the lesson is created). */
  meetUrl?: string | null;
  fallbackClassName?: string;
};

export function LessonMeetButton({
  lessonBackendId,
  meetUrl: meetUrlProp,
  fallbackClassName,
}: Props) {
  const backendLessons = useLessonsStore((s) => s.backendLessons);
  const fetchScheduledLessons = useLessonsStore((s) => s.fetchScheduledLessons);

  useEffect(() => {
    if (!lessonBackendId || meetUrlProp) return;
    void fetchScheduledLessons(true);
  }, [fetchScheduledLessons, lessonBackendId, meetUrlProp]);

  const meetUrlFromStore = useMemo(() => {
    if (!lessonBackendId || !backendLessons.data) return null;
    return backendLessons.data.find((lesson) => lesson.id === lessonBackendId)?.googleMeetUrl ?? null;
  }, [lessonBackendId, backendLessons.data]);

  const meetUrl = meetUrlProp ?? meetUrlFromStore;

  if (meetUrl) {
    return (
      <Link
        className={fallbackClassName}
        href={meetUrl}
        target="_blank"
        rel="noreferrer noopener"
      >
        <Video size={17} />
        Join Google Meet
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={fallbackClassName}
      disabled
      title="Meet is created when the lesson is saved. The teacher must be signed in with Google Calendar connected."
    >
      <Video size={17} />
      Join lesson call
      <span className={styles.subtitle} style={{ marginLeft: 6 }}>
        (Meet pending)
      </span>
    </button>
  );
}
