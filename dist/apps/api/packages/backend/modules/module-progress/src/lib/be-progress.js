"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressModule = exports.ProgressController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const data_access_prisma_1 = require("../../../../data-access/data-access-prisma/src/index.js");
const module_auth_1 = require("../../../module-auth/src/index.js");
let ProgressController = class ProgressController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCalendarEvents(userId) {
        const lessons = await this.prisma.scheduledLesson.findMany({
            where: { OR: [{ teacherId: userId }, { studentId: userId }] },
            include: {
                teacher: { select: { id: true, displayName: true } },
                student: { select: { id: true, displayName: true } },
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });
        return lessons.map((lesson, index) => ({
            id: index + 1,
            title: lesson.title,
            date: lesson.date,
            time: lesson.startTime,
            duration: lesson.duration,
            teacherId: hashId(lesson.teacher.id),
            teacherName: lesson.teacher.displayName,
            studentId: hashId(lesson.student.id),
            studentName: lesson.student.displayName,
            statusId: lesson.status === 'COMPLETED' ? 2 : lesson.status === 'CANCELLED' ? 3 : 1,
        }));
    }
};
exports.ProgressController = ProgressController;
tslib_1.__decorate([
    (0, common_1.Get)('events'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], ProgressController.prototype, "getCalendarEvents", null);
exports.ProgressController = ProgressController = tslib_1.__decorate([
    (0, common_1.Controller)('calendar'),
    (0, common_1.UseGuards)(module_auth_1.AuthGuard),
    tslib_1.__metadata("design:paramtypes", [data_access_prisma_1.PrismaService])
], ProgressController);
function hashId(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}
let ProgressModule = class ProgressModule {
};
exports.ProgressModule = ProgressModule;
exports.ProgressModule = ProgressModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [ProgressController],
    })
], ProgressModule);
//# sourceMappingURL=be-progress.js.map