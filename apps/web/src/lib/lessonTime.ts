import { addHours, addMinutes } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import type { ScheduledLessonDto, TimeZoneId } from '@pkg/types';
import { formatTimeZoneOptionLabel, getTimeZoneById, TIME_ZONE } from '@pkg/types';

const IANA_TO_TIME_ZONE_ID: Record<string, TimeZoneId> = Object.values(TIME_ZONE).reduce(
  (acc, zone) => {
    acc[zone.iana] = zone.id;
    return acc;
  },
  {} as Record<string, TimeZoneId>,
);

export function getIanaForTimeZoneId(id: TimeZoneId | undefined): string {
  const resolved = id ?? TIME_ZONE.kyiv.id;
  return getTimeZoneById(resolved)?.iana ?? 'Europe/Kyiv';
}

export function ianaToTimeZoneId(iana: string | null | undefined): TimeZoneId {
  const normalized = iana?.trim();
  if (!normalized) return TIME_ZONE.kyiv.id;
  return IANA_TO_TIME_ZONE_ID[normalized] ?? TIME_ZONE.kyiv.id;
}

export function getTimeZoneLabelFromIana(iana: string): string {
  const entry = Object.values(TIME_ZONE).find((zone) => zone.iana === iana);
  return entry ? formatTimeZoneOptionLabel(entry) : iana.replace(/_/g, ' ');
}

export type LessonWallClock = {
  date: string;
  startTime: string;
  duration: number;
  timezoneId: TimeZoneId;
};

export function formatLessonWallClockInZone(
  wall: LessonWallClock,
  targetIana: string,
): { dateLabel: string; timeRange: string } {
  const sourceIana = getIanaForTimeZoneId(wall.timezoneId);
  const start = toDate(`${wall.date}T${wall.startTime}:00`, { timeZone: sourceIana });
  const end = addMinutes(start, wall.duration);
  return {
    dateLabel: formatInTimeZone(start, targetIana, 'EEE, d MMM yyyy'),
    timeRange: `${formatInTimeZone(start, targetIana, 'HH:mm')}–${formatInTimeZone(end, targetIana, 'HH:mm')}`,
  };
}

/** Default Start time when opening Create lesson: one hour from now in the viewer zone. */
export function defaultCreateLessonStartTime(
  viewerIana: string,
  date: string,
): { date: string; startTime: string } {
  const instant = addHours(new Date(), 1);
  return {
    date,
    startTime: formatInTimeZone(instant, viewerIana, 'HH:mm'),
  };
}

export function lessonStartUtc(lesson: ScheduledLessonDto): Date {
  const iana = getIanaForTimeZoneId(lesson.timezoneId);
  return toDate(`${lesson.date}T${lesson.startTime}:00`, { timeZone: iana });
}

export function lessonEndUtc(lesson: ScheduledLessonDto): Date {
  return addMinutes(lessonStartUtc(lesson), lesson.duration);
}

export function lessonDateKeyInZone(lesson: ScheduledLessonDto, viewerIana: string): string {
  return formatInTimeZone(lessonStartUtc(lesson), viewerIana, 'yyyy-MM-dd');
}

export function lessonStartTimeInZone(lesson: ScheduledLessonDto, viewerIana: string): string {
  return formatInTimeZone(lessonStartUtc(lesson), viewerIana, 'HH:mm');
}

export function lessonEndTimeInZone(lesson: ScheduledLessonDto, viewerIana: string): string {
  return formatInTimeZone(lessonEndUtc(lesson), viewerIana, 'HH:mm');
}

/** Interpret calendar grid slot (viewer wall clock) and persist as wall clock in the lesson zone. */
export function viewerSlotToLessonWall(
  viewerDate: string,
  viewerStartTime: string,
  duration: number,
  viewerIana: string,
  lessonTimezoneId: TimeZoneId,
): { date: string; startTime: string; endTime: string } {
  const utc = toDate(`${viewerDate}T${viewerStartTime}:00`, { timeZone: viewerIana });
  const lessonIana = getIanaForTimeZoneId(lessonTimezoneId);
  const date = formatInTimeZone(utc, lessonIana, 'yyyy-MM-dd');
  const startTime = formatInTimeZone(utc, lessonIana, 'HH:mm');
  const endUtc = addMinutes(utc, duration);
  const endTime = formatInTimeZone(endUtc, lessonIana, 'HH:mm');
  return { date, startTime, endTime };
}

/** Move to another calendar day in the viewer's zone while keeping the same viewer-local clock time. */
export function moveLessonToViewerCalendarDay(
  lesson: ScheduledLessonDto,
  newViewerDateStr: string,
  viewerIana: string,
): { date: string; startTime: string; endTime: string } {
  const start = lessonStartUtc(lesson);
  const oldViewerTime = formatInTimeZone(start, viewerIana, 'HH:mm');
  return viewerSlotToLessonWall(newViewerDateStr, oldViewerTime, lesson.duration, viewerIana, lesson.timezoneId);
}
