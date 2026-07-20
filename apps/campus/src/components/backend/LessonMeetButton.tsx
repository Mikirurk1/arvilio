'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Video } from 'lucide-react';
import type { VideoMeetingProviderId } from '@pkg/types';
import { Button } from '../ui';
import { useCampusT } from '../../lib/cms';
import { useLessonsStore } from '../../stores/lessons-store';
import styles from './backend-panels.module.scss';

type Props = {
  /** Backend scheduled-lesson UUID — refreshes meet URL from store when prop is empty. */
  lessonBackendId?: string | null;
  /** Meeting URL from lesson context (set automatically when the lesson is created). */
  meetUrl?: string | null;
  /** Provider key for label / branding (defaults to Google for legacy lessons). */
  provider?: VideoMeetingProviderId | null;
  fallbackClassName?: string;
};

export function LessonVideoButton({
  lessonBackendId,
  meetUrl: meetUrlProp,
  provider,
  fallbackClassName,
}: Props) {
  const t = useCampusT();
  const backendLessons = useLessonsStore((s) => s.backendLessons);
  const fetchScheduledLessons = useLessonsStore((s) => s.fetchScheduledLessons);

  useEffect(() => {
    if (!lessonBackendId || meetUrlProp) return;
    void fetchScheduledLessons(true);
  }, [fetchScheduledLessons, lessonBackendId, meetUrlProp]);

  const fromStore = useMemo(() => {
    if (!lessonBackendId || !backendLessons.data) return null;
    const lesson = backendLessons.data.find(
      (lesson) => lesson.id === lessonBackendId,
    );
    if (!lesson) return null;
    return {
      url: lesson.videoMeetingUrl ?? lesson.googleMeetUrl ?? null,
      provider:
        (lesson.videoProvider as VideoMeetingProviderId | null | undefined) ??
        null,
    };
  }, [lessonBackendId, backendLessons.data]);

  const meetUrl = meetUrlProp ?? fromStore?.url ?? null;
  const activeProvider: VideoMeetingProviderId =
    provider ?? fromStore?.provider ?? 'google';
  const providerLabel =
    activeProvider === 'google'
      ? t('lessonDetail.video.joinGoogle')
      : activeProvider === 'zoom'
        ? t('lessonDetail.video.joinZoom')
        : activeProvider === 'livekit'
          ? t('lessonDetail.video.openMeeting')
          : t('lessonDetail.video.joinMeeting');

  if (meetUrl) {
    return (
      <Link
        className={fallbackClassName}
        href={meetUrl}
        target="_blank"
        rel="noreferrer noopener"
      >
        <Video size={17} />
        {providerLabel}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      className={fallbackClassName}
      disabled
      title={t('lessonDetail.video.pendingTitle')}
    >
      <Video size={17} />
      {t('lessonDetail.video.joinPending')}
      <span className={styles.subtitle} style={{ marginLeft: 6 }}>
        {t('lessonDetail.video.pending')}
      </span>
    </Button>
  );
}

/** Backward-compat alias for callers still importing `LessonMeetButton`. */
export const LessonMeetButton = LessonVideoButton;
