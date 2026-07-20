import type { ScheduledLessonDto } from '@pkg/types';
import { TIME_ZONE } from '@pkg/types';
import {
  defaultCreateLessonStartTime,
  formatLessonWallClockInZone,
  getIanaForTimeZoneId,
  getTimeZoneLabelFromIana,
  ianaToTimeZoneId,
  lessonDateKeyInZone,
  lessonEndUtc,
  lessonStartUtc,
  moveLessonToViewerCalendarDay,
  viewerSlotToLessonWall,
} from './lessonTime';

const lesson = (overrides: Partial<ScheduledLessonDto> = {}): ScheduledLessonDto =>
  ({
    id: 1,
    date: '2026-05-20',
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    timezoneId: TIME_ZONE.kyiv.id,
    ...overrides,
  }) as ScheduledLessonDto;

describe('lessonTime', () => {
  it('ianaToTimeZoneId maps known iana', () => {
    expect(ianaToTimeZoneId('Europe/Kyiv')).toBe(TIME_ZONE.kyiv.id);
  });

  it('ianaToTimeZoneId defaults for empty', () => {
    expect(ianaToTimeZoneId('')).toBe(TIME_ZONE.kyiv.id);
  });

  it('getIanaForTimeZoneId returns iana string', () => {
    expect(getIanaForTimeZoneId(TIME_ZONE.kyiv.id)).toBe('Europe/Kyiv');
  });

  it('getTimeZoneLabelFromIana formats catalog entry', () => {
    expect(getTimeZoneLabelFromIana('Europe/Kyiv')).toContain('Kyiv');
  });

  it('lessonStartUtc and lessonDateKeyInZone respect lesson timezone', () => {
    const start = lessonStartUtc(lesson());
    expect(start).toBeInstanceOf(Date);
    expect(lessonDateKeyInZone(lesson(), 'Europe/Kyiv')).toBe('2026-05-20');
  });

  it('formatLessonWallClockInZone renders range in target zone', () => {
    const formatted = formatLessonWallClockInZone(
      { date: '2026-05-20', startTime: '10:00', duration: 45, timezoneId: TIME_ZONE.kyiv.id },
      'Europe/London',
    );
    expect(formatted.dateLabel).toMatch(/2026|May|20/);
    expect(formatted.timeRange).toMatch(/–/);
  });

  it('viewerSlotToLessonWall converts viewer slot to lesson wall clock', () => {
    const wall = viewerSlotToLessonWall(
      '2026-05-20',
      '12:00',
      60,
      'Europe/London',
      TIME_ZONE.kyiv.id,
    );
    expect(wall.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(wall.startTime).toMatch(/^\d{2}:\d{2}$/);
    expect(wall.endTime).toMatch(/^\d{2}:\d{2}$/);
  });

  it('lessonEndUtc is after lessonStartUtc by duration', () => {
    const l = lesson({ duration: 45 });
    expect(lessonEndUtc(l).getTime() - lessonStartUtc(l).getTime()).toBe(45 * 60_000);
  });

  it('defaultCreateLessonStartTime returns date and start time in viewer zone', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T10:17:00.000Z'));
    const slot = defaultCreateLessonStartTime('Europe/Kyiv', '2026-05-20');
    expect(slot.date).toBe('2026-05-20');
    expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/);
    jest.useRealTimers();
  });

  it('moveLessonToViewerCalendarDay shifts date in viewer zone', () => {
    const moved = moveLessonToViewerCalendarDay(
      lesson({ date: '2026-05-20', startTime: '10:00', duration: 60 }),
      '2026-05-21',
      'Europe/Kyiv',
    );
    expect(moved.date).toBe('2026-05-21');
    expect(moved.startTime).toMatch(/^\d{2}:\d{2}$/);
  });
});
