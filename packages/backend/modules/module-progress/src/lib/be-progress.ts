import { Controller, Get, Module } from '@nestjs/common';
import { LESSON_STATUS, CalendarEventDto } from '@soenglish/shared-types';

const calendarEvents: CalendarEventDto[] = [
  {
    id: 1,
    title: 'Grammar: Conditionals',
    date: '2026-04-20',
    time: '10:00',
    duration: 55,
    teacherId: 2,
    teacherName: 'Sarah Mitchell',
    studentId: 1,
    studentName: 'Mykola K.',
    statusId: LESSON_STATUS.completed.id,
  },
  {
    id: 2,
    title: 'Speaking: Project Proposal',
    date: '2026-04-22',
    time: '14:00',
    duration: 55,
    teacherId: 2,
    teacherName: 'Sarah Mitchell',
    studentId: 1,
    studentName: 'Mykola K.',
    statusId: LESSON_STATUS.completed.id,
  },
  {
    id: 3,
    title: 'Vocabulary: Finance Terms',
    date: '2026-04-24',
    time: '11:00',
    duration: 55,
    teacherId: 2,
    teacherName: 'Sarah Mitchell',
    studentId: 1,
    studentName: 'Mykola K.',
    statusId: LESSON_STATUS.completed.id,
  },
  {
    id: 4,
    title: 'Listening: Podcast',
    date: '2026-04-26',
    time: '09:00',
    duration: 55,
    teacherId: 2,
    teacherName: 'Sarah Mitchell',
    studentId: 1,
    studentName: 'Mykola K.',
    statusId: LESSON_STATUS.planned.id,
  },
  {
    id: 5,
    title: 'Grammar: Passive Voice',
    date: '2026-04-28',
    time: '15:00',
    duration: 55,
    teacherId: 2,
    teacherName: 'Sarah Mitchell',
    studentId: 3,
    studentName: 'Anna V.',
    statusId: LESSON_STATUS.completed.id,
  },
  {
    id: 6,
    title: 'Speaking: Job Interview',
    date: '2026-04-29',
    time: '13:00',
    duration: 55,
    teacherId: 2,
    teacherName: 'Sarah Mitchell',
    studentId: 3,
    studentName: 'Anna V.',
    statusId: LESSON_STATUS.completed.id,
  },
  {
    id: 7,
    title: 'Vocabulary: Idioms',
    date: '2026-04-30',
    time: '10:00',
    duration: 55,
    teacherId: 2,
    teacherName: 'Sarah Mitchell',
    studentId: 4,
    studentName: 'Dmytro S.',
    statusId: LESSON_STATUS.planned.id,
  },
  {
    id: 8,
    title: 'Grammar: Conditionals',
    date: '2026-05-02',
    time: '11:00',
    duration: 55,
    teacherId: 2,
    teacherName: 'Sarah Mitchell',
    studentId: 1,
    studentName: 'Mykola K.',
    statusId: LESSON_STATUS.completed.id,
  },
  {
    id: 9,
    title: 'Speaking: Business Meeting',
    date: '2026-05-05',
    time: '14:00',
    duration: 55,
    teacherId: 2,
    teacherName: 'Sarah Mitchell',
    studentId: 4,
    studentName: 'Dmytro S.',
    statusId: LESSON_STATUS.completed.id,
  },
];

@Controller('calendar')
export class ProgressController {
  @Get('events')
  getCalendarEvents(): CalendarEventDto[] {
    return calendarEvents;
  }
}

@Module({
  controllers: [ProgressController],
})
export class ProgressModule {}
