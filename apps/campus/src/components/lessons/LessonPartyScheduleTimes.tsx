'use client';

import { USER_ROLE, type UserRoleId } from '@pkg/types';
import {
  formatLessonWallClockInZone,
  getIanaForTimeZoneId,
  getTimeZoneLabelFromIana,
  type LessonWallClock,
} from '../../lib/lessonTime';
import { useViewerTimezone } from '../../hooks/use-viewer-timezone';
import styles from './LessonPartyScheduleTimes.module.scss';

type Props = {
  wall: LessonWallClock;
  role: UserRoleId;
  teacherTimezoneIana?: string | null;
  studentTimezoneIana?: string | null;
  teacherName?: string;
  studentName?: string;
  className?: string;
};

export function LessonPartyScheduleTimes({
  wall,
  role,
  teacherTimezoneIana,
  studentTimezoneIana,
  teacherName,
  studentName,
  className,
}: Props) {
  const viewer = useViewerTimezone();
  const lessonIana = getIanaForTimeZoneId(wall.timezoneId);
  const teacherIana = teacherTimezoneIana?.trim() || lessonIana;
  const studentIana = studentTimezoneIana?.trim() || viewer.iana;
  const isStudent = role === USER_ROLE.student.id;

  const primaryIana = isStudent ? studentIana : teacherIana;
  const secondaryIana = isStudent ? teacherIana : studentIana;
  const primary = formatLessonWallClockInZone(wall, primaryIana);
  const secondary =
    secondaryIana !== primaryIana
      ? formatLessonWallClockInZone(wall, secondaryIana)
      : null;

  const primaryHeading = isStudent ? 'Your time' : 'Lesson time';
  const secondaryHeading = isStudent
    ? `Teacher${teacherName ? ` · ${teacherName}` : ''}`
    : `Student${studentName ? ` · ${studentName}` : ''}`;

  return (
    <div className={`${styles.root} ${className ?? ''}`.trim()}>
      <p className={styles.primary}>
        <strong>{primaryHeading}:</strong> {primary.dateLabel}, {primary.timeRange}{' '}
        <span className={styles.zoneTag}>({getTimeZoneLabelFromIana(primaryIana)})</span>
      </p>
      {secondary ? (
        <p className={styles.secondary}>
          {secondaryHeading}: {secondary.dateLabel}, {secondary.timeRange}{' '}
          <span className={styles.zoneTag}>({getTimeZoneLabelFromIana(secondaryIana)})</span>
        </p>
      ) : null}
    </div>
  );
}
