import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LessonBalanceService, PaymentSettingsService } from '@be/billing';
import { PrismaService } from '@be/prisma';
import type {
  CreateScheduledLessonRequestDto,
  ScheduledLessonBackendDto,
  UpdateScheduledLessonRequestDto,
} from '@pkg/types';
import { LessonAttachmentService } from './lesson-attachment.service';
import {
  GoogleCalendarService,
} from '../infrastructure/google-calendar.service';
import { VideoMeetingProviderResolver } from '../infrastructure/video-providers/video-meeting-provider.resolver';
import { LiveKitService, type LiveKitTokenResult } from '../infrastructure/livekit.service';
import type {
  CreateVideoMeetingResult,
  VideoMeetingProviderKey,
} from '../infrastructure/video-providers/video-meeting-provider.interface';
import {
  addMinutes,
  cancelReasonFromDto,
  cancelReasonToDto,
  decodeLessonCursor,
  diffMinutes,
  encodeLessonCursor,
  groupBillingModeFromDto,
  groupBillingModeToDto,
  groupSplitModeFromDto,
  groupSplitModeToDto,
  lessonKindFromDto,
  lessonKindToDto,
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
import { assertLessonMembership, isLessonMember, lessonMembershipWhere } from '../domain/lessons-access.util';
import {
  assertGroupCreateRules,
  assertGroupLessonsEnabledForSchool,
  assertParticipantLessonFormats,
  groupBillingCreateData,
  groupBillingFromSnapshot,
  groupBillingUpdateData,
  participantRoleForBilling,
  resolveLessonKind,
  resolveParticipantIds,
} from '../shared/group-lesson.util';
import { billingSnapshotFromGroup } from '../shared/student-group-map.util';
import type { GroupLessonBillingDto } from '@pkg/types';
import { mapLibraryMaterialRow } from '@be/materials';

const lessonInclude = {
  teacher: { select: { displayName: true } },
  student: { select: { displayName: true } },
  participants: {
    orderBy: { sortOrder: 'asc' as const },
    include: { user: { select: { displayName: true, email: true } } },
  },
  materials: {
    orderBy: { order: 'asc' as const },
    include: {
      libraryMaterial: {
        include: {
          coverAttachment: { select: { id: true, fileName: true, mimeType: true } },
          assets: {
            include: {
              fileAttachment: {
                select: {
                  id: true,
                  fileName: true,
                  mimeType: true,
                  previewStorageKey: true,
                },
              },
            },
          },
        },
      },
    },
  },
  fileAttachments: true,
  linkedWords: { select: { wordId: true } },
};

type LessonRecord = Awaited<ReturnType<LessonsService['fetchLesson']>>;
const TEACHING_ROLES = new Set(['TEACHER', 'ADMIN', 'SUPER_ADMIN']);

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleCalendar: GoogleCalendarService,
    private readonly videoProviders: VideoMeetingProviderResolver,
    private readonly livekit: LiveKitService,
    private readonly lessonAttachments: LessonAttachmentService,
    private readonly lessonBalance: LessonBalanceService,
    private readonly paymentSettings: PaymentSettingsService,
  ) {}

  /**
   * Issue a LiveKit access token for the current user to join the lesson's
   * built-in video room. Throws if the lesson uses a different provider.
   */
  async issueLiveKitToken(
    lessonId: string,
    actorUserId: string,
  ): Promise<LiveKitTokenResult> {
    const lesson = await this.ensureMembership(lessonId, actorUserId);
    if (lesson.videoProvider && lesson.videoProvider !== 'livekit') {
      throw new BadRequestException(
        'This lesson does not use the built-in video provider.',
      );
    }

    // Allow joining only within a ±5-minute window around the lesson
    const WINDOW_MS = 5 * 60 * 1000;
    const [h, m] = lesson.startTime.split(':').map(Number);
    const [eh, em] = lesson.endTime.split(':').map(Number);
    // Build UTC timestamps using the lesson date (wall-clock, timezone-naive comparison is fine
    // because we only need a rough ±5 min gate; exact tz math would require a tz library)
    const lessonDate = lesson.date; // yyyy-MM-dd
    const startMs = new Date(`${lessonDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`).getTime();
    const endMs = new Date(`${lessonDate}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`).getTime();
    const now = Date.now();
    if (now < startMs - WINDOW_MS) {
      throw new BadRequestException('The lesson has not started yet. You can join up to 5 minutes before it begins.');
    }
    if (now > endMs + WINDOW_MS) {
      throw new BadRequestException('The lesson has already ended.');
    }
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { displayName: true },
    });
    const roomName = this.livekit.roomNameFor(lessonId);
    const token = await this.livekit.createAccessToken({
      roomName,
      identity: actorUserId,
      displayName: actor?.displayName ?? undefined,
      isHost: lesson.teacherId === actorUserId,
    });
    if (!token) {
      throw new BadRequestException(
        'LiveKit is not configured on the server.',
      );
    }
    return token;
  }

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
      const extraParticipants = await this.prisma.scheduledLessonParticipant.findMany({
        where: { scheduledLessonId: id },
        select: { userId: true },
      });
      for (const row of extraParticipants) {
        if (row.userId !== existing.teacherId && row.userId !== existing.studentId) {
          await this.autoCompletePastPlannedLessons(row.userId);
        }
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
    const primaryParticipant = lesson.participants?.find((row) => row.userId === lesson.studentId);

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
      videoProvider: (lesson.videoProvider ?? null) as VideoMeetingProviderKey | null,
      videoMeetingUrl: lesson.videoMeetingUrl ?? lesson.googleMeetUrl ?? null,
      videoMeetingExternalId: lesson.videoMeetingExternalId,
      videoMeetingStartedAt: lesson.videoMeetingStartedAt?.toISOString() ?? null,
      videoMeetingEndedAt: lesson.videoMeetingEndedAt?.toISOString() ?? null,
      googleMeetUrl: lesson.googleMeetUrl,
      googleCalendarEventId: lesson.googleCalendarEventId,
      meetCreatedAt: lesson.meetCreatedAt?.toISOString() ?? null,
      materials: lesson.materials.map((material) => ({
        id: material.id,
        kind: materialKindToDto(material.kind),
        text: material.text ?? '',
        files: material.files,
        fileLinks: mapLessonFileLinks(material.files, attachments, fileLink),
        libraryMaterialId: material.libraryMaterialId,
        sharedLibraryAssetIds: material.sharedLibraryAssetIds ?? [],
        libraryMediaSelectionApplied: material.libraryMediaSelectionApplied ?? false,
        libraryMaterial: material.libraryMaterial
          ? mapLibraryMaterialRow(material.libraryMaterial, {
              downloadPath: (id) => `/materials/files/${id}`,
              previewDownloadPath: (id) => `/materials/files/${id}/preview`,
            })
          : null,
      })),
      homework: {
        text: lesson.homeworkText ?? '',
        files: lesson.homeworkFiles,
        fileLinks: mapLessonFileLinks(lesson.homeworkFiles, attachments, fileLink),
      },
      studentResponse: {
        text: primaryParticipant?.studentResponseText ?? lesson.studentResponseText ?? '',
        files: primaryParticipant?.studentResponseFiles ?? lesson.studentResponseFiles,
        fileLinks: mapLessonFileLinks(
          primaryParticipant?.studentResponseFiles ?? lesson.studentResponseFiles,
          attachments,
          fileLink,
        ),
        status: studentResponseStatusToDto(
          primaryParticipant?.studentResponseStatus ?? lesson.studentResponseStatus,
        ),
        homeworkChecked: primaryParticipant?.homeworkChecked ?? lesson.homeworkChecked,
        teacherHomeworkFeedback:
          primaryParticipant?.teacherHomeworkFeedback ?? lesson.teacherHomeworkFeedback ?? '',
      },
      linkedWordIds: lesson.linkedWords.map((row) => row.wordId),
      kind: lessonKindToDto(lesson.kind),
      participants: (lesson.participants ?? []).map((row) => ({
        userId: row.userId,
        displayName: row.user.displayName,
        role: row.role === 'PAYER' ? 'payer' : 'student',
        sortOrder: row.sortOrder,
        studentResponse: {
          text: row.studentResponseText ?? '',
          files: row.studentResponseFiles,
          status: studentResponseStatusToDto(row.studentResponseStatus),
          homeworkChecked: row.homeworkChecked,
          teacherHomeworkFeedback: row.teacherHomeworkFeedback ?? '',
        },
      })),
      groupBilling:
        lesson.kind === 'GROUP' && lesson.groupBillingMode
          ? {
              mode: groupBillingModeToDto(lesson.groupBillingMode),
              priceMinor: lesson.groupPriceMinor,
              currency: lesson.groupCurrency,
              splitMode: groupSplitModeToDto(lesson.groupSplitMode),
              payerUserId: lesson.groupPayerUserId,
            }
          : null,
    };
  }

  /** Mark past PLANNED lessons as COMPLETED (not CANCELLED). */
  private async autoCompletePastPlannedLessons(userId: string): Promise<void> {
    const toComplete = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT sl.id FROM "ScheduledLesson" sl
      WHERE sl.status = 'PLANNED'::"LessonStatus"
        AND (
          sl."teacherId" = ${userId}
          OR sl."studentId" = ${userId}
          OR EXISTS (
            SELECT 1 FROM "ScheduledLessonParticipant" p
            WHERE p."scheduledLessonId" = sl.id AND p."userId" = ${userId}
          )
        )
        AND (
          ((sl."date" || ' ' || sl."endTime" || ':00')::timestamp AT TIME ZONE sl.timezone)
          < NOW()
        )
    `;
    if (toComplete.length === 0) return;

    const ids = toComplete.map((r) => r.id);
    await this.prisma.scheduledLesson.updateMany({
      where: { id: { in: ids } },
      data: { status: 'COMPLETED', credited: true },
    });

    await this.lessonBalance.syncLessonsAfterAutoComplete(ids);
  }

  async listFor(userId: string): Promise<ScheduledLessonBackendDto[]> {
    await this.autoCompletePastPlannedLessons(userId);
    const lessons = await this.prisma.scheduledLesson.findMany({
      where: lessonMembershipWhere(userId),
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
          AND: [
            lessonMembershipWhere(userId),
            {
              OR: [
                { studentId: filterStudentId },
                { participants: { some: { userId: filterStudentId } } },
              ],
            },
          ],
        }
      : lessonMembershipWhere(userId);
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

  private async resolveActorRole(
    actorUserId: string,
  ): Promise<'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN' | null> {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { role: true },
    });
    return actor?.role ?? null;
  }

  private assertStudentCanOnlyUpdateOwnResponse(
    lesson: NonNullable<LessonRecord>,
    body: UpdateScheduledLessonRequestDto,
  ): void {
    const current = this.toDto(lesson);
    const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
    const forbidden = () =>
      new ForbiddenException('Students can only update their own lesson response');

    if (body.title !== undefined && body.title !== current.title) throw forbidden();
    if (body.description !== undefined && body.description !== current.description) throw forbidden();
    if (body.notes !== undefined && body.notes !== current.notes) throw forbidden();
    if (body.lessonPlan !== undefined && body.lessonPlan !== current.lessonPlan) throw forbidden();
    if (body.date !== undefined && body.date !== current.date) throw forbidden();
    if (body.startTime !== undefined && body.startTime !== current.startTime) throw forbidden();
    if (body.endTime !== undefined && body.endTime !== current.endTime) throw forbidden();
    if (body.duration !== undefined && body.duration !== current.duration) throw forbidden();
    if (body.timezone !== undefined && body.timezone !== current.timezone) throw forbidden();
    if (body.status !== undefined && body.status !== current.status) throw forbidden();
    if (body.recurrence !== undefined && body.recurrence !== current.recurrence) throw forbidden();
    if (body.cancelReason !== undefined && body.cancelReason !== current.cancelReason) throw forbidden();
    if (body.credited !== undefined && body.credited !== current.credited) throw forbidden();
    if (body.seriesId !== undefined && (body.seriesId ?? null) !== (current.seriesId ?? null)) {
      throw forbidden();
    }
    if (body.weeklyDays !== undefined && !same(body.weeklyDays, current.weeklyDays ?? [])) {
      throw forbidden();
    }
    if (body.linkedWordIds !== undefined && !same(body.linkedWordIds, current.linkedWordIds ?? [])) {
      throw forbidden();
    }

    if (body.materials !== undefined) {
      const currentMaterials = current.materials.map((material) => ({
        kind: material.kind,
        text: material.text ?? '',
        files: material.files ?? [],
      }));
      const nextMaterials = body.materials.map((material) => ({
        kind: material.kind,
        text: material.text ?? '',
        files: material.files ?? [],
      }));
      if (!same(nextMaterials, currentMaterials)) throw forbidden();
    }

    if (body.homework !== undefined) {
      const currentHomework = {
        text: current.homework?.text ?? '',
        files: current.homework?.files ?? [],
      };
      const nextHomework = {
        text: body.homework.text ?? '',
        files: body.homework.files ?? [],
      };
      if (!same(nextHomework, currentHomework)) throw forbidden();
    }

    if (body.studentResponse?.homeworkChecked !== undefined) {
      if (body.studentResponse.homeworkChecked !== current.studentResponse.homeworkChecked) {
        throw forbidden();
      }
    }
    if (body.studentResponse?.teacherHomeworkFeedback !== undefined) {
      if (
        body.studentResponse.teacherHomeworkFeedback !== current.studentResponse.teacherHomeworkFeedback
      ) {
        throw forbidden();
      }
    }
    if (body.participantIds !== undefined) throw forbidden();
    if (body.kind !== undefined) throw forbidden();
    if (body.groupBilling !== undefined) throw forbidden();
  }

  async create(actorUserId: string, body: CreateScheduledLessonRequestDto): Promise<ScheduledLessonBackendDto> {
    if (!body.title?.trim()) throw new BadRequestException('Title is required');
    if (!body.date) throw new BadRequestException('Date is required');
    if (!body.startTime) throw new BadRequestException('Start time is required');

    const paymentRuntime = await this.paymentSettings.getRuntimePaymentSettings();
    const kind = resolveLessonKind(body);
    if (kind === 'GROUP' || body.studentGroupId) {
      assertGroupLessonsEnabledForSchool(paymentRuntime.config);
    }

    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { role: true },
    });
    if (!actor || actor.role === 'STUDENT') {
      throw new ForbiddenException('This action requires teacher, admin, or super admin role');
    }

    let participantIds: string[];
    let billingSnapshot: ReturnType<typeof billingSnapshotFromGroup> | null = null;
    let studentGroupId: string | null = null;

    if (body.studentGroupId) {
      const group = await this.prisma.studentGroup.findUnique({
        where: { id: body.studentGroupId },
        include: { members: { orderBy: { sortOrder: 'asc' } } },
      });
      if (!group) throw new NotFoundException('Student group not found');
      if (actor.role === 'TEACHER' && group.teacherId !== actorUserId) {
        throw new ForbiddenException('You can only use your assigned groups');
      }
      if (kind !== 'GROUP') {
        throw new BadRequestException('Student group requires a group lesson');
      }
      participantIds = group.members.map((member) => member.userId);
      billingSnapshot = billingSnapshotFromGroup(group);
      studentGroupId = group.id;
    } else {
      participantIds = resolveParticipantIds(body);
      if (actor.role === 'TEACHER' && kind === 'GROUP') {
        throw new BadRequestException('Teachers must select a student group');
      }
    }

    assertGroupCreateRules(kind, participantIds, body, {
      fromStudentGroup: !!body.studentGroupId,
      actorRole: actor.role,
    });
    const primaryStudentId = participantIds[0]!;

    const teacherId = body.teacherId ?? actorUserId;
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, role: true, timezone: true },
    });
    if (!teacher || !TEACHING_ROLES.has(teacher.role)) {
      throw new BadRequestException('Teacher not found');
    }

    const students = await this.prisma.user.findMany({
      where: { id: { in: participantIds }, role: 'STUDENT' },
      select: { id: true, role: true, teacherId: true, email: true, lessonFormat: true },
    });
    if (students.length !== participantIds.length) {
      throw new BadRequestException('One or more students were not found');
    }
    assertParticipantLessonFormats(students, kind);
    if (actor.role === 'TEACHER') {
      if (teacherId !== actorUserId) {
        throw new ForbiddenException('Teachers can only create lessons for themselves');
      }
      const outsider = students.find((student) => student.teacherId !== actorUserId);
      if (outsider) {
        throw new ForbiddenException('Teachers can only create lessons for their own students');
      }
    }

    const duration = body.duration ?? (body.endTime ? diffMinutes(body.startTime, body.endTime) : 55);
    const endTime = body.endTime ?? addMinutes(body.startTime, duration);
    const timezone = body.timezone ?? teacher.timezone ?? 'Europe/Kyiv';
    const meetSummary =
      kind === 'GROUP' ? `${body.title.trim()} (Group)` : body.title.trim();

    const needsCalendar = body.createMeetLink !== false;
    const videoProvider = needsCalendar ? this.videoProviders.get() : null;
    if (videoProvider) {
      await videoProvider.assertHostReady(teacherId);
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
        studentId: primaryStudentId,
        kind,
        studentGroupId,
        ...(billingSnapshot
          ? groupBillingFromSnapshot(billingSnapshot)
          : actor.role === 'TEACHER'
            ? {}
            : groupBillingCreateData(body)),
        status: statusFromDto(body.status ?? 'planned'),
        recurrence: recurrenceFromDto(body.recurrence ?? 'none'),
        weeklyDays: body.weeklyDays ?? [],
        seriesId: body.seriesId ?? null,
        participants: {
          create: participantIds.map((userId, index) => ({
            userId,
            sortOrder: index,
            role:
              kind === 'GROUP' && billingSnapshot
                ? participantRoleForBilling(userId, billingSnapshot)
                : body.groupBilling?.splitMode === 'single_payer' &&
                    body.groupBilling.payerUserId === userId
                  ? 'PAYER'
                  : 'STUDENT',
          })),
        },
      },
    });

    if (body.linkedWordIds?.length) {
      await Promise.all(
        participantIds.flatMap((studentId) =>
          (body.linkedWordIds ?? []).map((wordId) =>
            this.prisma.studentWordCard.upsert({
              where: { userId_wordId: { userId: studentId, wordId } },
              update: { lessonId: lesson.id },
              create: {
                userId: studentId,
                wordId,
                lessonId: lesson.id,
                status: 'NEW',
                firstSeenAt: new Date(),
              },
            }),
          ),
        ),
      );
    }

    if (needsCalendar && videoProvider) {
      const meeting = await videoProvider.createMeeting({
        lessonId: lesson.id,
        teacherId,
        summary: meetSummary,
        description: lesson.description ?? undefined,
        startDateTime: `${lesson.date}T${lesson.startTime}:00`,
        endDateTime: `${lesson.date}T${lesson.endTime}:00`,
        timezone,
        attendeeEmails: students
          .map((student) => student.email)
          .filter(Boolean) as string[],
      });
      if (!meeting?.externalId) {
        await this.rollbackCreatedLesson(lesson.id);
        throw new BadRequestException(
          'Could not create a video meeting for this lesson. Check the active provider in System → Video meetings.',
        );
      }
      await this.applyVideoMeetingToLesson(lesson.id, teacherId, meeting);
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
    const actorRole = await this.resolveActorRole(actorUserId);
    if (actorRole === 'STUDENT') {
      throw new ForbiddenException('Only staff can create video meeting links');
    }
    if (lesson.videoMeetingUrl || lesson.googleMeetUrl) {
      return this.toDto(lesson);
    }

    const provider = this.videoProviders.get();

    // If this lesson has a prior external id for the *same* provider, try to
    // resolve a URL from it before creating a new meeting.
    if (
      lesson.videoMeetingExternalId &&
      lesson.videoProvider === provider.key
    ) {
      const existingUrl = await provider.getMeetingUrl(
        lesson.videoMeetingExternalId,
        lesson.teacherId,
      );
      if (existingUrl) {
        await this.prisma.scheduledLesson.update({
          where: { id: lessonId },
          data: {
            videoMeetingUrl: existingUrl,
            meetCreatedAt: lesson.meetCreatedAt ?? new Date(),
            ...(provider.key === 'google'
              ? { googleMeetUrl: existingUrl }
              : {}),
          },
        });
        const refreshed = await this.fetchLesson(lessonId);
        if (!refreshed) throw new NotFoundException('Lesson not found');
        return this.toDto(refreshed);
      }
    }

    // Fallback for legacy lessons that only have googleCalendarEventId.
    if (provider.key === 'google' && lesson.googleCalendarEventId) {
      const existingUrl = await this.googleCalendar.getEventMeetUrl(
        lesson.teacherId,
        lesson.googleCalendarEventId,
      );
      if (existingUrl) {
        await this.prisma.scheduledLesson.update({
          where: { id: lessonId },
          data: {
            googleMeetUrl: existingUrl,
            videoMeetingUrl: existingUrl,
            videoProvider: 'google',
            videoMeetingExternalId: lesson.googleCalendarEventId,
            meetCreatedAt: lesson.meetCreatedAt ?? new Date(),
          },
        });
        const refreshed = await this.fetchLesson(lessonId);
        if (!refreshed) throw new NotFoundException('Lesson not found');
        return this.toDto(refreshed);
      }
    }

    const teacher = await this.prisma.user.findUnique({ where: { id: lesson.teacherId } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    const studentEmails = await this.resolveParticipantEmails(lesson);

    await provider.assertHostReady(lesson.teacherId);
    const meeting = await provider.createMeeting({
      lessonId,
      teacherId: lesson.teacherId,
      summary: lesson.kind === 'GROUP' ? `${lesson.title} (Group)` : lesson.title,
      description: lesson.description ?? undefined,
      startDateTime: `${lesson.date}T${lesson.startTime}:00`,
      endDateTime: `${lesson.date}T${lesson.endTime}:00`,
      timezone: lesson.timezone,
      attendeeEmails: studentEmails,
    });

    await this.applyVideoMeetingToLesson(lessonId, lesson.teacherId, meeting);

    const full = await this.fetchLesson(lessonId);
    if (!full) throw new NotFoundException('Lesson not found');
    if (!full.videoMeetingUrl && !full.googleMeetUrl) {
      throw new BadRequestException(
        'Could not create a video meeting link. Check the active provider configuration and the teacher host connection.',
      );
    }
    return this.toDto(full);
  }

  private async rollbackCreatedLesson(lessonId: string): Promise<void> {
    await this.prisma.scheduledLesson
      .delete({ where: { id: lessonId } })
      .catch(() => undefined);
  }

  /** Persist video meeting fields. For Google, also mirror to legacy `googleMeetUrl` and resolve URL async. */
  private async applyVideoMeetingToLesson(
    lessonId: string,
    teacherId: string,
    meeting: CreateVideoMeetingResult | null,
  ): Promise<void> {
    if (!meeting?.externalId) return;

    let meetingUrl = meeting.meetingUrl?.trim() || null;
    // Google may return the Meet URL asynchronously after event creation.
    if (!meetingUrl && meeting.provider === 'google') {
      meetingUrl = await this.googleCalendar.getEventMeetUrl(
        teacherId,
        meeting.externalId,
      );
      if (!meetingUrl) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        meetingUrl = await this.googleCalendar.getEventMeetUrl(
          teacherId,
          meeting.externalId,
        );
      }
    }

    const data: Record<string, unknown> = {
      videoProvider: meeting.provider,
      videoMeetingExternalId: meeting.externalId,
      videoMeetingRawId: meeting.rawId,
      meetCreatedAt: new Date(),
      ...(meetingUrl ? { videoMeetingUrl: meetingUrl } : {}),
    };

    // Mirror to legacy Google fields for backward compat.
    if (meeting.provider === 'google') {
      data['googleCalendarEventId'] = meeting.externalId;
      data['googleConferenceId'] = meeting.conferenceId ?? null;
      if (meetingUrl) data['googleMeetUrl'] = meetingUrl;
    }

    await this.prisma.scheduledLesson.update({
      where: { id: lessonId },
      data,
    });
  }

  private async applyLessonContentFields(
    lessonId: string,
    body: Pick<UpdateScheduledLessonRequestDto, 'materials' | 'homework' | 'studentResponse'>,
    actorUserId?: string,
  ): Promise<void> {
    if (body.homework !== undefined) {
      const homeworkUpdates: Prisma.ScheduledLessonUpdateInput = {};
      if (body.homework.text !== undefined) homeworkUpdates['homeworkText'] = body.homework.text;
      if (body.homework.files !== undefined) homeworkUpdates['homeworkFiles'] = body.homework.files;
      if (Object.keys(homeworkUpdates).length > 0) {
        await this.prisma.scheduledLesson.update({ where: { id: lessonId }, data: homeworkUpdates });
      }
    }

    if (body.studentResponse !== undefined) {
      const participantRow =
        actorUserId != null
          ? await this.prisma.scheduledLessonParticipant.findUnique({
              where: {
                scheduledLessonId_userId: { scheduledLessonId: lessonId, userId: actorUserId },
              },
            })
          : null;

      if (participantRow) {
        const participantUpdates: Prisma.ScheduledLessonParticipantUpdateInput = {};
        if (body.studentResponse.text !== undefined) {
          participantUpdates['studentResponseText'] = body.studentResponse.text;
        }
        if (body.studentResponse.files !== undefined) {
          participantUpdates['studentResponseFiles'] = body.studentResponse.files;
        }
        if (body.studentResponse.status !== undefined) {
          participantUpdates['studentResponseStatus'] = studentResponseStatusFromDto(
            body.studentResponse.status,
          );
        }
        if (body.studentResponse.homeworkChecked !== undefined) {
          participantUpdates['homeworkChecked'] = body.studentResponse.homeworkChecked;
        }
        if (body.studentResponse.teacherHomeworkFeedback !== undefined) {
          participantUpdates['teacherHomeworkFeedback'] =
            body.studentResponse.teacherHomeworkFeedback;
        }
        if (Object.keys(participantUpdates).length > 0) {
          await this.prisma.scheduledLessonParticipant.update({
            where: {
              scheduledLessonId_userId: { scheduledLessonId: lessonId, userId: actorUserId! },
            },
            data: participantUpdates,
          });
        }
      } else {
        const updates: Prisma.ScheduledLessonUpdateInput = {};
        if (body.studentResponse.text !== undefined) {
          updates['studentResponseText'] = body.studentResponse.text;
        }
        if (body.studentResponse.files !== undefined) {
          updates['studentResponseFiles'] = body.studentResponse.files;
        }
        if (body.studentResponse.status !== undefined) {
          updates['studentResponseStatus'] = studentResponseStatusFromDto(
            body.studentResponse.status,
          );
        }
        if (body.studentResponse.homeworkChecked !== undefined) {
          updates['homeworkChecked'] = body.studentResponse.homeworkChecked;
        }
        if (body.studentResponse.teacherHomeworkFeedback !== undefined) {
          updates['teacherHomeworkFeedback'] = body.studentResponse.teacherHomeworkFeedback;
        }
        if (Object.keys(updates).length > 0) {
          await this.prisma.scheduledLesson.update({ where: { id: lessonId }, data: updates });
        }
      }
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
            libraryMaterialId: material.libraryMaterialId ?? null,
            sharedLibraryAssetIds: material.sharedLibraryAssetIds ?? [],
            libraryMediaSelectionApplied: material.libraryMediaSelectionApplied ?? false,
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
    const actorRole = await this.resolveActorRole(actorUserId);
    if (!actorRole) {
      throw new ForbiddenException('Only lesson participants can update lessons');
    }
    if (actorRole === 'STUDENT') {
      if (!isLessonMember(lesson, actorUserId)) {
        throw new ForbiddenException('Students can only update their own lesson response');
      }
      this.assertStudentCanOnlyUpdateOwnResponse(lesson, body);
    }

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

    await this.applyLessonContentFields(lessonId, body, actorUserId);

    if (body.kind !== undefined || body.groupBilling !== undefined) {
      const kindUpdate = body.kind ? lessonKindFromDto(body.kind) : undefined;
      await this.prisma.scheduledLesson.update({
        where: { id: lessonId },
        data: {
          ...(kindUpdate ? { kind: kindUpdate } : {}),
          ...groupBillingUpdateData({
            kind: body.kind ?? (lesson.kind === 'GROUP' ? 'group' : 'individual'),
            groupBilling: body.groupBilling,
          }),
        },
      });
    }

    if (body.participantIds && lesson.status === 'PLANNED' && actorRole !== 'STUDENT') {
      await this.replaceParticipants(lessonId, body.participantIds, body.groupBilling);
    }

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
      const participantEmails = await this.resolveParticipantEmails(full);
      await this.googleCalendar.updateEvent({
        teacherId: full.teacherId,
        eventId: full.googleCalendarEventId,
        summary: full.kind === 'GROUP' ? `${full.title} (Group)` : full.title,
        description: full.description ?? undefined,
        startDateTime: `${full.date}T${full.startTime}:00`,
        endDateTime: `${full.date}T${full.endTime}:00`,
        timezone: full.timezone,
        studentEmails: participantEmails,
      });
    }

    await this.lessonBalance.syncLessonCharge(lessonId);

    return this.toDto(full);
  }

  private async resolveParticipantEmails(
    lesson: Pick<NonNullable<LessonRecord>, 'studentId' | 'participants'>,
  ): Promise<string[]> {
    const ids =
      lesson.participants && lesson.participants.length > 0
        ? lesson.participants.map((row) => row.userId)
        : [lesson.studentId];
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { email: true },
    });
    return users.map((row) => row.email).filter((email): email is string => Boolean(email?.trim()));
  }

  private async replaceParticipants(
    lessonId: string,
    participantIds: string[],
    groupBilling?: GroupLessonBillingDto | null,
  ): Promise<void> {
    const unique = [...new Set(participantIds.map((id) => id.trim()).filter(Boolean))];
    if (unique.length < 2) {
      throw new BadRequestException('Group lessons require at least two students');
    }
    const students = await this.prisma.user.findMany({
      where: { id: { in: unique }, role: 'STUDENT' },
      select: { id: true },
    });
    if (students.length !== unique.length) {
      throw new BadRequestException('One or more students were not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.scheduledLessonParticipant.deleteMany({ where: { scheduledLessonId: lessonId } });
      await tx.scheduledLessonParticipant.createMany({
        data: unique.map((userId, index) => ({
          scheduledLessonId: lessonId,
          userId,
          sortOrder: index,
          role:
            groupBilling?.splitMode === 'single_payer' && groupBilling.payerUserId === userId
              ? 'PAYER'
              : 'STUDENT',
        })),
      });
      await tx.scheduledLesson.update({
        where: { id: lessonId },
        data: { studentId: unique[0]! },
      });
    });
  }

  async remove(lessonId: string, actorUserId: string): Promise<void> {
    const lesson = await this.ensureMembership(lessonId, actorUserId);
    const actorRole = await this.resolveActorRole(actorUserId);
    if (actorRole === 'STUDENT') {
      throw new ForbiddenException('Only staff can delete lessons');
    }
    if (lesson.googleCalendarEventId) {
      await this.googleCalendar.deleteEvent(lesson.teacherId, lesson.googleCalendarEventId);
    }
    await this.prisma.scheduledLesson.delete({ where: { id: lessonId } });
  }
}
