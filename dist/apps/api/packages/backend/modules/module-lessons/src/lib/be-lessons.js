"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonsModule = exports.ScheduledLessonsController = exports.LessonsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const data_access_prisma_1 = require("../../../../data-access/data-access-prisma/src/index.js");
const module_auth_1 = require("../../../module-auth/src/index.js");
const google_calendar_service_1 = require("./google-calendar.service");
function statusToDto(status) {
    return status.toLowerCase();
}
function statusFromDto(status) {
    return status.toUpperCase();
}
function cancelReasonToDto(reason) {
    if (!reason)
        return null;
    return reason.toLowerCase();
}
function cancelReasonFromDto(reason) {
    return reason.toUpperCase();
}
function recurrenceToDto(recurrence) {
    return recurrence.toLowerCase();
}
function recurrenceFromDto(recurrence) {
    return recurrence.toUpperCase();
}
function materialKindToDto(kind) {
    return kind.toLowerCase();
}
function materialKindFromDto(kind) {
    return kind.toUpperCase();
}
function studentResponseStatusToDto(status) {
    return status.toLowerCase();
}
function studentResponseStatusFromDto(status) {
    return status.toUpperCase();
}
function addMinutes(time, minutes) {
    const [hours, mins] = time.split(':').map((part) => Number.parseInt(part, 10));
    if (Number.isNaN(hours) || Number.isNaN(mins))
        return time;
    const total = hours * 60 + mins + minutes;
    const h = Math.floor(((total % (24 * 60)) + 24 * 60) % (24 * 60) / 60);
    const m = ((total % 60) + 60) % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function diffMinutes(start, end) {
    const [sh, sm] = start.split(':').map((part) => Number.parseInt(part, 10));
    const [eh, em] = end.split(':').map((part) => Number.parseInt(part, 10));
    if ([sh, sm, eh, em].some((value) => Number.isNaN(value)))
        return 0;
    return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}
let LessonsService = class LessonsService {
    constructor(prisma, googleCalendar) {
        this.prisma = prisma;
        this.googleCalendar = googleCalendar;
    }
    async fetchLesson(id) {
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
            include: {
                materials: { orderBy: { order: 'asc' } },
                linkedWords: { select: { wordId: true } },
            },
        });
    }
    toDto(lesson) {
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
            studentId: lesson.studentId,
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
            })),
            homework: {
                text: lesson.homeworkText ?? '',
                files: lesson.homeworkFiles,
            },
            studentResponse: {
                text: lesson.studentResponseText ?? '',
                files: lesson.studentResponseFiles,
                status: studentResponseStatusToDto(lesson.studentResponseStatus),
                homeworkChecked: lesson.homeworkChecked,
                teacherHomeworkFeedback: lesson.teacherHomeworkFeedback ?? '',
            },
            linkedWordIds: lesson.linkedWords.map((row) => row.wordId),
        };
    }
    /** Mark past PLANNED lessons as COMPLETED (not CANCELLED). */
    async autoCompletePastPlannedLessons(userId) {
        await this.prisma.$executeRaw `
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
    async listFor(userId) {
        await this.autoCompletePastPlannedLessons(userId);
        const lessons = await this.prisma.scheduledLesson.findMany({
            where: { OR: [{ teacherId: userId }, { studentId: userId }] },
            include: {
                materials: { orderBy: { order: 'asc' } },
                linkedWords: { select: { wordId: true } },
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });
        return lessons.map((lesson) => this.toDto(lesson));
    }
    async ensureMembership(lessonId, userId) {
        const lesson = await this.fetchLesson(lessonId);
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (lesson.teacherId !== userId && lesson.studentId !== userId) {
            throw new common_1.ForbiddenException('Not allowed to access this lesson');
        }
        return lesson;
    }
    async create(actorUserId, body) {
        if (!body.title?.trim())
            throw new common_1.BadRequestException('Title is required');
        if (!body.date)
            throw new common_1.BadRequestException('Date is required');
        if (!body.startTime)
            throw new common_1.BadRequestException('Start time is required');
        if (!body.studentId)
            throw new common_1.BadRequestException('Student id is required');
        const teacherId = body.teacherId ?? actorUserId;
        const teacher = await this.prisma.user.findUnique({ where: { id: teacherId } });
        if (!teacher)
            throw new common_1.BadRequestException('Teacher not found');
        const student = await this.prisma.user.findUnique({ where: { id: body.studentId } });
        if (!student)
            throw new common_1.BadRequestException('Student not found');
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
            await Promise.all(body.linkedWordIds.map((wordId) => this.prisma.studentWordCard.upsert({
                where: { userId_wordId: { userId: body.studentId, wordId } },
                update: { lessonId: lesson.id },
                create: {
                    userId: body.studentId,
                    wordId,
                    lessonId: lesson.id,
                    status: 'NEW',
                    firstSeenAt: new Date(),
                },
            })));
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
                throw new common_1.BadRequestException(google_calendar_service_1.GOOGLE_CALENDAR_REQUIRED_MESSAGE);
            }
            await this.applyMeetToLesson(lesson.id, teacherId, meet);
        }
        if (body.materials !== undefined ||
            body.homework !== undefined ||
            body.studentResponse !== undefined) {
            await this.applyLessonContentFields(lesson.id, body);
        }
        const full = await this.fetchLesson(lesson.id);
        if (!full)
            throw new common_1.NotFoundException('Lesson disappeared after creation');
        return this.toDto(full);
    }
    async ensureMeetLink(lessonId, actorUserId) {
        const lesson = await this.ensureMembership(lessonId, actorUserId);
        if (lesson.googleMeetUrl) {
            return this.toDto(lesson);
        }
        if (lesson.googleCalendarEventId) {
            const existingUrl = await this.googleCalendar.getEventMeetUrl(lesson.teacherId, lesson.googleCalendarEventId);
            if (existingUrl) {
                await this.prisma.scheduledLesson.update({
                    where: { id: lessonId },
                    data: { googleMeetUrl: existingUrl, meetCreatedAt: lesson.meetCreatedAt ?? new Date() },
                });
                const refreshed = await this.fetchLesson(lessonId);
                if (!refreshed)
                    throw new common_1.NotFoundException('Lesson not found');
                return this.toDto(refreshed);
            }
        }
        const [teacher, student] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: lesson.teacherId } }),
            this.prisma.user.findUnique({ where: { id: lesson.studentId } }),
        ]);
        if (!teacher)
            throw new common_1.BadRequestException('Teacher not found');
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
        if (!full)
            throw new common_1.NotFoundException('Lesson not found');
        if (!full.googleMeetUrl) {
            throw new common_1.BadRequestException('Could not create a Google Meet link. The assigned teacher must sign in with Google (with Calendar access), and GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET must be set on the server.');
        }
        return this.toDto(full);
    }
    async rollbackCreatedLesson(lessonId) {
        await this.prisma.scheduledLesson
            .delete({ where: { id: lessonId } })
            .catch(() => undefined);
    }
    /** Persist Calendar event id and resolve Meet URL (Google may return it asynchronously). */
    async applyMeetToLesson(lessonId, teacherId, meet) {
        if (!meet?.eventId)
            return;
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
    async applyLessonContentFields(lessonId, body) {
        const updates = {};
        if (body.homework !== undefined) {
            if (body.homework.text !== undefined)
                updates['homeworkText'] = body.homework.text;
            if (body.homework.files !== undefined)
                updates['homeworkFiles'] = body.homework.files;
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
    async update(lessonId, actorUserId, body) {
        const lesson = await this.ensureMembership(lessonId, actorUserId);
        const updates = {};
        if (body.title !== undefined)
            updates['title'] = body.title;
        if (body.description !== undefined)
            updates['description'] = body.description;
        if (body.notes !== undefined)
            updates['notes'] = body.notes;
        if (body.lessonPlan !== undefined)
            updates['lessonPlan'] = body.lessonPlan;
        if (body.date !== undefined)
            updates['date'] = body.date;
        if (body.startTime !== undefined)
            updates['startTime'] = body.startTime;
        if (body.endTime !== undefined)
            updates['endTime'] = body.endTime;
        if (body.duration !== undefined)
            updates['duration'] = body.duration;
        if (body.timezone !== undefined)
            updates['timezone'] = body.timezone;
        if (body.status !== undefined)
            updates['status'] = statusFromDto(body.status);
        if (body.recurrence !== undefined)
            updates['recurrence'] = recurrenceFromDto(body.recurrence);
        if (body.weeklyDays !== undefined)
            updates['weeklyDays'] = body.weeklyDays;
        if (body.seriesId !== undefined)
            updates['seriesId'] = body.seriesId;
        if (body.cancelReason !== undefined) {
            updates['cancelReason'] = body.cancelReason ? cancelReasonFromDto(body.cancelReason) : null;
        }
        if (body.credited !== undefined)
            updates['credited'] = body.credited;
        await this.prisma.scheduledLesson.update({ where: { id: lessonId }, data: updates });
        await this.applyLessonContentFields(lessonId, body);
        if (body.linkedWordIds) {
            await this.prisma.studentWordCard.updateMany({
                where: { lessonId, userId: lesson.studentId, wordId: { notIn: body.linkedWordIds } },
                data: { lessonId: null },
            });
            await Promise.all(body.linkedWordIds.map((wordId) => this.prisma.studentWordCard.upsert({
                where: { userId_wordId: { userId: lesson.studentId, wordId } },
                update: { lessonId },
                create: {
                    userId: lesson.studentId,
                    wordId,
                    lessonId,
                    status: 'NEW',
                    firstSeenAt: new Date(),
                },
            })));
        }
        const full = await this.fetchLesson(lessonId);
        if (!full)
            throw new common_1.NotFoundException('Lesson disappeared after update');
        const scheduleChanged = body.date !== undefined ||
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
    async remove(lessonId, actorUserId) {
        const lesson = await this.ensureMembership(lessonId, actorUserId);
        if (lesson.googleCalendarEventId) {
            await this.googleCalendar.deleteEvent(lesson.teacherId, lesson.googleCalendarEventId);
        }
        await this.prisma.scheduledLesson.delete({ where: { id: lessonId } });
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [data_access_prisma_1.PrismaService,
        google_calendar_service_1.GoogleCalendarService])
], LessonsService);
let ScheduledLessonsController = class ScheduledLessonsController {
    constructor(lessons) {
        this.lessons = lessons;
    }
    async list(userId) {
        return this.lessons.listFor(userId);
    }
    async get(userId, id) {
        const lesson = await this.lessons.fetchLesson(id);
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (lesson.teacherId !== userId && lesson.studentId !== userId)
            throw new common_1.ForbiddenException();
        return this.lessons.toDto(lesson);
    }
    async create(userId, body) {
        return this.lessons.create(userId, body);
    }
    /** Static path — avoids `:id/meet` routing issues; prefer this over nested segment routes. */
    async ensureMeetByBody(userId, body) {
        if (!body?.lessonId?.trim()) {
            throw new common_1.BadRequestException('lessonId is required');
        }
        return this.lessons.ensureMeetLink(body.lessonId.trim(), userId);
    }
    async ensureMeet(userId, id) {
        return this.lessons.ensureMeetLink(id, userId);
    }
    async update(userId, id, body) {
        return this.lessons.update(id, userId, body);
    }
    async remove(userId, id) {
        await this.lessons.remove(id, userId);
        return { ok: true };
    }
};
exports.ScheduledLessonsController = ScheduledLessonsController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], ScheduledLessonsController.prototype, "list", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ScheduledLessonsController.prototype, "get", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ScheduledLessonsController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Post)('meet'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ScheduledLessonsController.prototype, "ensureMeetByBody", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/meet'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ScheduledLessonsController.prototype, "ensureMeet", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ScheduledLessonsController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ScheduledLessonsController.prototype, "remove", null);
exports.ScheduledLessonsController = ScheduledLessonsController = tslib_1.__decorate([
    (0, common_1.Controller)('lessons/scheduled'),
    (0, common_1.UseGuards)(module_auth_1.AuthGuard),
    tslib_1.__metadata("design:paramtypes", [LessonsService])
], ScheduledLessonsController);
let LessonsModule = class LessonsModule {
};
exports.LessonsModule = LessonsModule;
exports.LessonsModule = LessonsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [ScheduledLessonsController],
        providers: [LessonsService, google_calendar_service_1.GoogleCalendarService],
        exports: [LessonsService, google_calendar_service_1.GoogleCalendarService],
    })
], LessonsModule);
//# sourceMappingURL=be-lessons.js.map