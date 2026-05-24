import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import type {
  CreateScheduledLessonRequestDto,
  ScheduledLessonBackendDto,
  UpdateScheduledLessonRequestDto,
} from '@pkg/types';
import { LessonAttachmentService } from './lesson-attachment.service';
import {
  GOOGLE_CALENDAR_REQUIRED_MESSAGE,
  GoogleCalendarService,
  type CreateMeetEventResult,
} from '../infrastructure/google-calendar.service';
import {
  addMinutes,
  cancelReasonFromDto,
  cancelReasonToDto,
  decodeLessonCursor,
  diffMinutes,
  encodeLessonCursor,
  mapLessonFileLinks,
  materialKindFromDto,
  materialKindToDto,
  recurrenceFromDto,
  recurrenceToDto,
  statusFromDto,
  statusToDto,
  studentResponseStatusFromDto,
  studentResponseStatusToDto,
} from '../shared/lessons-map.util';
import { assertLessonMembership } from '../domain/lessons-access.util';

const lessonInclude = {
  teacher: { select: { displayName: true } },
  student: { select: { displayName: true } },
  materials: { orderBy: { order: 'asc' as const } },
  fileAttachments: true,
  linkedWords: { select: { wordId: true } },
};

type LessonRecord = Awaited<ReturnType<LessonsService['fetchLesson']>>;

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleCalendar: GoogleCalendarService,
    private readonly lessonAttachments: LessonAttachmentService,
  ) {}

  async fetchLesson(id: string) {
    const existing = await this.prisma.scheduledLesson.findUnique({
      where: { id },
      select: { teacherId: true, studentId: true },
    });
    if (existing) {
      await this.autoCompletePastPlannedLessons(existing.teacherId);
      if (existing.studentId !== existing.teacherId) {
        await this.autoCompletePastPlannedLessons(existing.studentId);
      }
    }
    return this.prisma.scheduledLesson.findUnique({
      where: { id },
      include: lessonInclude,
    });
  }

  toDto(lesson: NonNullable<LessonRecord>): ScheduledLessonBackendDto {
    const attachments = lesson.fileAttachments ?? [];
    const fileLink = (attachmentId: string) => this.lessonAttachments.downloadPath(attachmentId);

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      notes: lesson.notes,
      lessonPlan: lesson.lessonPlan,
      date: lesson.date,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      duration: lesson.duration,
      timezone: lesson.timezone,
      teacherId: lesson.teacherId,
      teacherName: lesson.teacher.displayName,
      studentId: lesson.studentId,
      studentName: lesson.student.displayName,
      status: statusToDto(lesson.status),
      cancelReason: cancelReasonToDto(lesson.cancelReason),
      credited: lesson.credited,
      recurrence: recurrenceToDto(lesson.recurrence),
      weeklyDays: lesson.weeklyDays,
      seriesId: lesson.seriesId,
      order: lesson.order,
      googleMeetUrl: lesson.googleMeetUrl,
      googleCalendarEventId: lesson.googleCalendarEventId,
      meetCreatedAt: lesson.meetCreatedAt?.toISOString() ?? null,
      materials: lesson.materials.map((material) => ({
        id: material.id,
        kind: materialKindToDto(material.kind),
        text: material.text ?? '',
        files: material.files,
        fileLinks: mapLessonFileLinks(material.files, attachments, fileLink),
      })),
      homework: {
        text: lesson.homeworkText ?? '',
        files: lesson.homeworkFiles,
        fileLinks: mapLessonFileLinks(lesson.homeworkFiles, attachments, fileLink),
      },
      studentResponse: {
        text: lesson.studentResponseText ?? '',
        files: lesson.studentResponseFiles,
        fileLinks: mapLessonFileLinks(lesson.studentResponseFiles, attachments, fileLink),
        status: studentResponseStatusToDto(lesson.studentResponseStatus),
        homeworkChecked: lesson.homeworkChecked,
        teacherHomeworkFeedback: lesson.teacherHomeworkFeedback ?? '',
      },
      linkedWordIds: lesson.linkedWords.map((row) => row.wordId),
    };
  }

  /** Mark past PLANNED lessons as COMPLETED (not CANCELLED). */
  private async autoCompletePastPlannedLessons(userId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "ScheduledLesson"
      SET
        status = 'COMPLETED'::"LessonStatus",
        credited = true,
        "updatedAt" = NOW()
      WHERE status = 'PLANNED'::"LessonStatus"
        AND ("teacherId" = ${userId} OR "studentId" = ${userId})
        AND (
          (("date" || ' ' || "endTime" || ':00')::timestamp AT TIME ZONE timezone)
          < NOW()
        )
    `;
  }

  async listFor(userId: string): Promise<ScheduledLessonBackendDto[]> {
    await this.autoCompletePastPlannedLessons(userId);
    const lessons = await this.prisma.scheduledLesson.findMany({
      where: { OR: [{ teacherId: userId }, { studentId: userId }] },
      include: lessonInclude,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    return lessons.map((lesson) => this.toDto(lesson));
  }

  async listForPage(
    userId: string,
    limit = 25,
    cursor?: string,
    filterStudentId?: string,
  ): Promise<{
    items: ScheduledLessonBackendDto[];
    hasMore: boolean;
    nextCursor: string | null;
  }> {
    await this.autoCompletePastPlannedLessons(userId);
    const take = Math.min(Math.max(limit, 1), 100);
    const membership = filterStudentId
      ? {
          OR: [{ teacherId: userId, studentId: filterStudentId }, { studentId: filterStudentId }],
        }
      : { OR: [{ teacherId: userId }, { studentId: userId }] };
    const cursorRow = cursor ? decodeLessonCursor(cursor) : null;
    const cursorWhere = cursorRow
      ? {
          OR: [
            { date: { lt: cursorRow.date } },
            {
              AND: [{ date: cursorRow.date }, { startTime: { lt: cursorRow.startTime } }],
            },
            {
              AND: [
                { date: cursorRow.date },
                { startTime: cursorRow.startTime },
                { id: { lt: cursorRow.id } },
              ],
            },
          ],
        }
      : {};

    const lessons = await this.prisma.scheduledLesson.findMany({
      where: { AND: [membership, cursorWhere] },
      include: lessonInclude,
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }, { id: 'desc' }],
      take: take + 1,
    });

    const hasMore = lessons.length > take;
    const page = hasMore ? lessons.slice(0, take) : lessons;
    const items = page.map((lesson) => this.toDto(lesson));
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last ? encodeLessonCursor({ date: last.date, startTime: last.startTime, id: last.id }) : null;
    return { items, hasMore, nextCursor };
  }

  private async ensureMembership(
    lessonId: string,
    userId: string,
  ): Promise<NonNullable<LessonRecord>> {
    const lesson = await this.fetchLesson(lessonId);
    assertLessonMembership(lesson, userId);
    return lesson;
  }

  async create(actorUserId: string, body: CreateScheduledLessonRequestDto): Promise<ScheduledLessonBackendDto> {
    if (!body.title?.trim()) throw new BadRequestException('Title is required');
    if (!body.date) throw new BadRequestException('Date is required');
    if (!body.startTime) throw new BadRequestException('Start time is required');
    if (!body.studentId) throw new BadRequestException('Student id is required');

    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { role: true },
    });
    if (!actor || actor.role === 'STUDENT') {
      throw new ForbiddenException('This action requires teacher, admin, or super admin role');
    }

    const teacherId = body.teacherId ?? actorUserId;
    const teacher = await this.prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    const student = await this.prisma.user.findUnique({ where: { id: body.studentId } });
    if (!student) throw new BadRequestException('Student not found');

    const duration = body.duration ?? (body.endTime ? diffMinutes(body.startTime, body.endTime) : 55);
    const endTime = body.endTime ?? addMinutes(body.startTime, duration);
    const timezone = body.timezone ?? teacher.timezone ?? 'Europe/Kyiv';

    const needsCalendar = body.createMeetLink !== false;
    if (needsCalendar) {
      await this.googleCalendar.assertTeacherCalendarReady(teacherId);
    }

    const lesson = await this.prisma.scheduledLesson.create({
      data: {
        title: body.title.trim(),
        description: body.description ?? null,
        notes: body.notes ?? null,
        lessonPlan: body.lessonPlan ?? null,
        date: body.date,
        startTime: body.startTime,
        endTime,
        duration,
        timezone,
        teacherId,
        studentId: body.studentId,
        status: statusFromDto(body.status ?? 'planned'),
        recurrence: recurrenceFromDto(body.recurrence ?? 'none'),
        weeklyDays: body.weeklyDays ?? [],
        seriesId: body.seriesId ?? null,
      },
    });

    if (body.linkedWordIds?.length) {
      await Promise.all(
        body.linkedWordIds.map((wordId) =>
          this.prisma.studentWordCard.upsert({
            where: { userId_wordId: { userId: body.studentId, wordId } },
            update: { lessonId: lesson.id },
            create: {
              userId: body.studentId,
              wordId,
              lessonId: lesson.id,
              status: 'NEW',
              firstSeenAt: new Date(),
            },
          }),
        ),
      );
    }

    if (needsCalendar) {
      const meet = await this.googleCalendar.createMeetEvent({
        teacherId,
        summary: lesson.title,
        description: lesson.description ?? undefined,
        startDateTime: `${lesson.date}T${lesson.startTime}:00`,
        endDateTime: `${lesson.date}T${lesson.endTime}:00`,
        timezone,
        studentEmail: student.email,
      });
      if (!meet?.eventId) {
        await this.rollbackCreatedLesson(lesson.id);
        throw new BadRequestException(GOOGLE_CALENDAR_REQUIRED_MESSAGE);
      }
      await this.applyMeetToLesson(lesson.id, teacherId, meet);
    }

    if (
      body.materials !== undefined ||
      body.homework !== undefined ||
      body.studentResponse !== undefined
    ) {
      await this.applyLessonContentFields(lesson.id, body);
    }

    const full = await this.fetchLesson(lesson.id);
    if (!full) throw new NotFoundException('Lesson disappeared after creation');
    return this.toDto(full);
  }

  async ensureMeetLink(lessonId: string, actorUserId: string): Promise<ScheduledLessonBackendDto> {
    const lesson = await this.ensureMembership(lessonId, actorUserId);
    if (lesson.googleMeetUrl) {
      return this.toDto(lesson);
    }

    if (lesson.googleCalendarEventId) {
      const existingUrl = await this.googleCalendar.getEventMeetUrl(
        lesson.teacherId,
        lesson.googleCalendarEventId,
      );
      if (existingUrl) {
        await this.prisma.scheduledLesson.update({
          where: { id: lessonId },
          data: { googleMeetUrl: existingUrl, meetCreatedAt: lesson.meetCreatedAt ?? new Date() },
        });
        const refreshed = await this.fetchLesson(lessonId);
        if (!refreshed) throw new NotFoundException('Lesson not found');
        return this.toDto(refreshed);
      }
    }

    const [teacher, student] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: lesson.teacherId } }),
      this.prisma.user.findUnique({ where: { id: lesson.studentId } }),
    ]);
    if (!teacher) throw new BadRequestException('Teacher not found');

    const meet = await this.googleCalendar.createMeetEvent({
      teacherId: lesson.teacherId,
      summary: lesson.title,
      description: lesson.description ?? undefined,
      startDateTime: `${lesson.date}T${lesson.startTime}:00`,
      endDateTime: `${lesson.date}T${lesson.endTime}:00`,
      timezone: lesson.timezone,
      studentEmail: student?.email ?? null,
    });

    await this.applyMeetToLesson(lessonId, lesson.teacherId, meet);

    const full = await this.fetchLesson(lessonId);
    if (!full) throw new NotFoundException('Lesson not found');
    if (!full.googleMeetUrl) {
      throw new BadRequestException(
        'Could not create a Google Meet link. The assigned teacher must sign in with Google (with Calendar access), and GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET must be set on the server.',
      );
    }
    return this.toDto(full);
  }

  private async rollbackCreatedLesson(lessonId: string): Promise<void> {
    await this.prisma.scheduledLesson
      .delete({ where: { id: lessonId } })
      .catch(() => undefined);
  }

  /** Persist Calendar event id and resolve Meet URL (Google may return it asynchronously). */
  private async applyMeetToLesson(
    lessonId: string,
    teacherId: string,
    meet: CreateMeetEventResult | null,
  ): Promise<void> {
    if (!meet?.eventId) return;

    let meetUrl = meet.meetUrl?.trim() || null;
    if (!meetUrl) {
      meetUrl = await this.googleCalendar.getEventMeetUrl(teacherId, meet.eventId);
    }
    if (!meetUrl) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      meetUrl = await this.googleCalendar.getEventMeetUrl(teacherId, meet.eventId);
    }

    await this.prisma.scheduledLesson.update({
      where: { id: lessonId },
      data: {
        googleCalendarEventId: meet.eventId,
        ...(meetUrl ? { googleMeetUrl: meetUrl } : {}),
        googleConferenceId: meet.conferenceId,
        meetCreatedAt: new Date(),
      },
    });
  }

  private async applyLessonContentFields(
    lessonId: string,
    body: Pick<UpdateScheduledLessonRequestDto, 'materials' | 'homework' | 'studentResponse'>,
  ): Promise<void> {
    const updates: Prisma.ScheduledLessonUpdateInput = {};
    if (body.homework !== undefined) {
      if (body.homework.text !== undefined) updates['homeworkText'] = body.homework.text;
      if (body.homework.files !== undefined) updates['homeworkFiles'] = body.homework.files;
    }
    if (body.studentResponse !== undefined) {
      if (body.studentResponse.text !== undefined)
        updates['studentResponseText'] = body.studentResponse.text;
      if (body.studentResponse.files !== undefined)
        updates['studentResponseFiles'] = body.studentResponse.files;
      if (body.studentResponse.status !== undefined)
        updates['studentResponseStatus'] = studentResponseStatusFromDto(body.studentResponse.status);
      if (body.studentResponse.homeworkChecked !== undefined)
        updates['homeworkChecked'] = body.studentResponse.homeworkChecked;
      if (body.studentResponse.teacherHomeworkFeedback !== undefined)
        updates['teacherHomeworkFeedback'] = body.studentResponse.teacherHomeworkFeedback;
    }

    if (Object.keys(updates).length > 0) {
      await this.prisma.scheduledLesson.update({ where: { id: lessonId }, data: updates });
    }

    if (body.materials !== undefined) {
      await this.prisma.lessonMaterial.deleteMany({ where: { lessonId } });
      if (body.materials.length > 0) {
        await this.prisma.lessonMaterial.createMany({
          data: body.materials.map((material, index) => ({
            lessonId,
            kind: materialKindFromDto(material.kind),
            text: material.text ?? null,
            files: material.files ?? [],
            order: index,
          })),
        });
      }
    }
  }

  async update(
    lessonId: string,
    actorUserId: string,
    body: UpdateScheduledLessonRequestDto,
  ): Promise<ScheduledLessonBackendDto> {
    const lesson = await this.ensureMembership(lessonId, actorUserId);

    const updates: Prisma.ScheduledLessonUpdateInput = {};
    if (body.title !== undefined) updates['title'] = body.title;
    if (body.description !== undefined) updates['description'] = body.description;
    if (body.notes !== undefined) updates['notes'] = body.notes;
    if (body.lessonPlan !== undefined) updates['lessonPlan'] = body.lessonPlan;
    if (body.date !== undefined) updates['date'] = body.date;
    if (body.startTime !== undefined) updates['startTime'] = body.startTime;
    if (body.endTime !== undefined) updates['endTime'] = body.endTime;
    if (body.duration !== undefined) updates['duration'] = body.duration;
    if (body.timezone !== undefined) updates['timezone'] = body.timezone;
    if (body.status !== undefined) updates['status'] = statusFromDto(body.status);
    if (body.recurrence !== undefined) updates['recurrence'] = recurrenceFromDto(body.recurrence);
    if (body.weeklyDays !== undefined) updates['weeklyDays'] = body.weeklyDays;
    if (body.seriesId !== undefined) updates['seriesId'] = body.seriesId;
    if (body.cancelReason !== undefined) {
      updates['cancelReason'] = body.cancelReason ? cancelReasonFromDto(body.cancelReason) : null;
    }
    if (body.credited !== undefined) updates['credited'] = body.credited;

    await this.prisma.scheduledLesson.update({ where: { id: lessonId }, data: updates });

    await this.applyLessonContentFields(lessonId, body);

    if (body.linkedWordIds) {
      await this.prisma.studentWordCard.updateMany({
        where: { lessonId, userId: lesson.studentId, wordId: { notIn: body.linkedWordIds } },
        data: { lessonId: null },
      });
      await Promise.all(
        body.linkedWordIds.map((wordId) =>
          this.prisma.studentWordCard.upsert({
            where: { userId_wordId: { userId: lesson.studentId, wordId } },
            update: { lessonId },
            create: {
              userId: lesson.studentId,
              wordId,
              lessonId,
              status: 'NEW',
              firstSeenAt: new Date(),
            },
          }),
        ),
      );
    }

    const full = await this.fetchLesson(lessonId);
    if (!full) throw new NotFoundException('Lesson disappeared after update');

    const scheduleChanged =
      body.date !== undefined ||
      body.startTime !== undefined ||
      body.endTime !== undefined ||
      body.duration !== undefined ||
      body.timezone !== undefined;

    if (scheduleChanged && full.googleCalendarEventId) {
      const student = await this.prisma.user.findUnique({
        where: { id: full.studentId },
        select: { email: true },
      });
      await this.googleCalendar.updateEvent({
        teacherId: full.teacherId,
        eventId: full.googleCalendarEventId,
        summary: full.title,
        description: full.description ?? undefined,
        startDateTime: `${full.date}T${full.startTime}:00`,
        endDateTime: `${full.date}T${full.endTime}:00`,
        timezone: full.timezone,
        studentEmail: student?.email ?? null,
      });
    }

    return this.toDto(full);
  }

  async remove(lessonId: string, actorUserId: string): Promise<void> {
    const lesson = await this.ensureMembership(lessonId, actorUserId);
    if (lesson.googleCalendarEventId) {
      await this.googleCalendar.deleteEvent(lesson.teacherId, lesson.googleCalendarEventId);
    }
    await this.prisma.scheduledLesson.delete({ where: { id: lessonId } });
  }
}
