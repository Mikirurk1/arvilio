import type { CalendarEventDto, ScheduledLessonDto } from '@soenglish/shared-types';
import { LESSON_STATUS, TIME_ZONE } from '@soenglish/shared-types';
import { getStudentScheduledLessons, mockScheduledLessons } from './lessons';

export function scheduledLessonToCalendarEvent(
  lesson: ScheduledLessonDto,
): CalendarEventDto {
  return {
    id: lesson.id,
    title: lesson.title,
    date: lesson.date,
    time: lesson.startTime,
    duration: lesson.duration,
    teacherId: lesson.teacherId,
    teacherName: lesson.teacherName,
    studentId: lesson.studentId,
    studentName: lesson.studentName,
    statusId:
      lesson.statusId === LESSON_STATUS.completed.id
        ? LESSON_STATUS.completed.id
        : LESSON_STATUS.planned.id,
  };
}

export function calendarEventToScheduledLesson(
  eventItem: CalendarEventDto,
): ScheduledLessonDto {
  const [hh, mm] = eventItem.time.split(':').map(Number);
  const endMinutes = hh * 60 + mm + eventItem.duration;
  const endHour = Math.floor(endMinutes / 60);
  const endMin = endMinutes % 60;
  return {
    id: eventItem.id,
    title: eventItem.title,
    date: eventItem.date,
    startTime: eventItem.time,
    endTime: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
    timezoneId: TIME_ZONE.kyiv.id,
    duration: eventItem.duration,
    teacherId: eventItem.teacherId,
    teacherName: eventItem.teacherName,
    studentId: eventItem.studentId,
    studentName: eventItem.studentName,
    statusId:
      eventItem.statusId === LESSON_STATUS.completed.id
        ? LESSON_STATUS.completed.id
        : LESSON_STATUS.planned.id,
    credited: eventItem.statusId === LESSON_STATUS.completed.id,
    order: 1,
    recurrence: 'none',
    weeklyDays: [],
  };
}

export const mockCalendarEvents: CalendarEventDto[] = mockScheduledLessons.map(
  scheduledLessonToCalendarEvent,
);

export function getStudentCalendarEvents(
  studentId: number,
): CalendarEventDto[] {
  return getStudentScheduledLessons(studentId).map(
    scheduledLessonToCalendarEvent,
  );
}
