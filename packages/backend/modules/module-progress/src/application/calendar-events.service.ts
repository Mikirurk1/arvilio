import { Injectable } from '@nestjs/common';
import type { CalendarEventDto } from '@pkg/types';
import { hashPartyId } from '../domain/progress-id.util';
import { CalendarEventsRepository } from '../infrastructure/calendar-events.repository';

@Injectable()
export class CalendarEventsService {
  constructor(private readonly calendarEvents: CalendarEventsRepository) {}

  async listForUser(userId: string): Promise<CalendarEventDto[]> {
    const lessons = await this.calendarEvents.findScheduledLessonsForUser(userId);
    return lessons.map((lesson, index) => ({
      id: index + 1,
      title: lesson.title,
      date: lesson.date,
      time: lesson.startTime,
      duration: lesson.duration,
      teacherId: hashPartyId(lesson.teacher.id),
      teacherName: lesson.teacher.displayName,
      studentId: hashPartyId(lesson.student.id),
      studentName: lesson.student.displayName,
      statusId: lesson.status === 'COMPLETED' ? 2 : lesson.status === 'CANCELLED' ? 3 : 1,
    }));
  }
}
