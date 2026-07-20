import type { ScheduledLessonDto } from '@pkg/types';
import { lessonStartUtc } from '../../lib/lessonTime';

export type StudentColor = 'Blue' | 'Green' | 'Amber' | 'Purple';
export const STUDENT_COLOR_PALETTE: StudentColor[] = ['Blue', 'Green', 'Amber', 'Purple'];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const START_HOUR = 0;
export const END_HOUR = 24;
export const MINUTES_PER_DAY = (END_HOUR - START_HOUR) * 60;
export const PX_PER_MINUTE = 1.2;
export const DAY_COLUMN_HEIGHT = MINUTES_PER_DAY * PX_PER_MINUTE;
export const HOUR_MARKS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

export type ResizeState = {
  lessonId: number;
  edge: 'top' | 'bottom';
  originY: number;
  snapshot: ScheduledLessonDto;
  initialDuration: number;
  viewerDate: string;
  initialViewerStartMinutes: number;
};

export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isDateBeforeToday(dateStr: string): boolean {
  return dateStr < toDateString(new Date());
}

export function isLessonInPast(lesson: ScheduledLessonDto): boolean {
  return lessonStartUtc(lesson).getTime() < Date.now();
}

export function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export type WeekEventLayout = {
  columnIndex: number;
  columnsTotal: number;
};

export function buildWeekEventLayout(lessons: ScheduledLessonDto[]): Record<number, WeekEventLayout> {
  const sorted = [...lessons].sort((a, b) => {
    const diff = toMinutes(a.startTime) - toMinutes(b.startTime);
    if (diff !== 0) return diff;
    return a.duration - b.duration;
  });

  const layout: Record<number, WeekEventLayout> = {};
  const groupEvents: ScheduledLessonDto[] = [];
  let groupMaxColumnCount = 0;
  const active: Array<{ lesson: ScheduledLessonDto; columnIndex: number; endMinutes: number }> = [];
  const groupAssignment = new Map<number, number>();

  sorted.forEach((lesson, index) => {
    const startMinutes = toMinutes(lesson.startTime);
    const endMinutes = startMinutes + lesson.duration;

    for (let i = active.length - 1; i >= 0; i -= 1) {
      if (active[i].endMinutes <= startMinutes) active.splice(i, 1);
    }

    const startsNewGroup = active.length === 0 && index > 0 && groupEvents.length > 0;
    if (startsNewGroup) {
      const columnsTotal = Math.max(1, groupMaxColumnCount);
      groupEvents.forEach((gl) => {
        layout[gl.id] = { columnIndex: groupAssignment.get(gl.id) ?? 0, columnsTotal };
      });
      groupEvents.length = 0;
      groupAssignment.clear();
      groupMaxColumnCount = 0;
    }

    const usedColumns = new Set(active.map((item) => item.columnIndex));
    let columnIndex = 0;
    while (usedColumns.has(columnIndex)) columnIndex += 1;

    active.push({ lesson, columnIndex, endMinutes });
    groupEvents.push(lesson);
    groupAssignment.set(lesson.id, columnIndex);
    groupMaxColumnCount = Math.max(groupMaxColumnCount, active.length);
  });

  if (groupEvents.length > 0) {
    const columnsTotal = Math.max(1, groupMaxColumnCount);
    groupEvents.forEach((gl) => {
      layout[gl.id] = { columnIndex: groupAssignment.get(gl.id) ?? 0, columnsTotal };
    });
  }

  return layout;
}
