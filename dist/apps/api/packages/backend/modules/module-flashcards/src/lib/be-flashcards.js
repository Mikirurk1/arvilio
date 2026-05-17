"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashcardsModule = exports.QuizController = exports.QuizGeneratorService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const data_access_prisma_1 = require("../../../../data-access/data-access-prisma/src/index.js");
const module_auth_1 = require("../../../module-auth/src/index.js");
function shuffle(items) {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
function difficultyFromDto(difficulty) {
    return difficulty.toUpperCase();
}
function sourceFromDto(source) {
    return source.toUpperCase();
}
let QuizGeneratorService = class QuizGeneratorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generate(actorId, body) {
        await this.requireStaff(actorId);
        const source = body.source ?? 'vocabulary';
        const difficulty = body.difficulty ?? 'medium';
        const questionCount = Math.min(Math.max(body.questionCount ?? 8, 3), 25);
        const targetStudentId = body.studentId ?? actorId;
        const pool = await this.collectPool(targetStudentId, body.lessonId, source);
        if (pool.length === 0) {
            throw new common_1.BadRequestException('Not enough vocabulary to generate a quiz. Add words first.');
        }
        const distractorsBase = await this.collectDistractorPool(pool);
        const questionsData = buildQuestions(pool, distractorsBase, questionCount, difficulty);
        const quiz = await this.prisma.quiz.create({
            data: {
                title: body.title ?? defaultTitle(body, pool.length),
                category: body.category ?? (body.lessonId ? 'Lesson' : 'Vocabulary'),
                difficulty: difficultyFromDto(difficulty),
                source: sourceFromDto(source),
                ownerId: actorId,
                lessonId: body.lessonId ?? null,
                questions: {
                    create: questionsData.map((question, index) => ({
                        order: index,
                        type: question.type === 'multiple-choice' ? 'MULTIPLE_CHOICE' : 'FILL_IN',
                        prompt: question.question,
                        options: question.options ?? [],
                        correctAnswer: String(question.correct),
                        explanation: question.explanation,
                        wordId: question.wordId ?? null,
                    })),
                },
            },
            include: { questions: { orderBy: { order: 'asc' } } },
        });
        const assignee = await this.prisma.user.findUnique({
            where: { id: targetStudentId },
            select: { role: true },
        });
        if (assignee?.role === 'STUDENT') {
            await this.prisma.quizAssignment.upsert({
                where: {
                    quizId_studentId: { quizId: quiz.id, studentId: targetStudentId },
                },
                create: {
                    quizId: quiz.id,
                    studentId: targetStudentId,
                    assignedById: actorId,
                    status: 'PENDING',
                },
                update: { status: 'PENDING' },
            });
        }
        return toDetail(quiz);
    }
    async delete(actorId, quizId) {
        await this.requireStaff(actorId);
        const actor = await this.prisma.user.findUnique({
            where: { id: actorId },
            select: { role: true },
        });
        const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        const isOwner = quiz.ownerId === actorId;
        const isAdmin = actor?.role === 'ADMIN' || actor?.role === 'SUPER_ADMIN';
        if (isAdmin || isOwner) {
            await this.prisma.quiz.delete({ where: { id: quizId } });
            return true;
        }
        if (actor?.role === 'TEACHER') {
            const canDeleteForStudent = await this.prisma.quizAssignment.findFirst({
                where: {
                    quizId,
                    student: { teacherId: actorId },
                },
                select: { id: true },
            });
            if (canDeleteForStudent) {
                await this.prisma.quiz.delete({ where: { id: quizId } });
                return true;
            }
        }
        throw new common_1.ForbiddenException('You can only delete quizzes you created or assigned to your students');
        return true;
    }
    async listForStudent(viewerId, studentId) {
        await this.assertCanViewStudent(viewerId, studentId);
        const rows = await this.prisma.quizAssignment.findMany({
            where: { studentId },
            include: {
                quiz: { include: { _count: { select: { questions: true } } } },
                attempts: {
                    where: { studentId, finishedAt: { not: null } },
                    orderBy: { finishedAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((row) => {
            const attempt = row.attempts[0];
            return {
                id: row.quiz.id,
                title: row.quiz.title,
                category: row.quiz.category,
                difficulty: row.quiz.difficulty.toLowerCase(),
                source: row.quiz.source.toLowerCase(),
                lessonId: row.quiz.lessonId,
                questionCount: row.quiz._count.questions,
                createdAt: row.quiz.createdAt.toISOString(),
                assignmentId: row.id,
                attempt: attempt
                    ? {
                        id: attempt.id,
                        score: attempt.score,
                        correctCount: attempt.correctCount,
                        totalCount: attempt.totalCount,
                        finishedAt: attempt.finishedAt?.toISOString() ?? null,
                    }
                    : null,
            };
        });
    }
    async submitAttempt(actorId, body) {
        const studentId = body.studentId ?? actorId;
        const actor = await this.prisma.user.findUnique({
            where: { id: actorId },
            select: { role: true },
        });
        if (!actor)
            throw new common_1.NotFoundException('User not found');
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: body.quizId },
            include: { questions: { orderBy: { order: 'asc' } } },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        const graded = gradeQuizAnswers(quiz.questions, body.answers);
        const score = graded.totalCount > 0
            ? Math.round((graded.correctCount / graded.totalCount) * 100)
            : 0;
        if (body.practiceMode) {
            if (actor.role === 'STUDENT') {
                throw new common_1.ForbiddenException('Practice mode is for staff only');
            }
            await this.assertQuizAccess(actorId, body.quizId);
            return {
                attemptId: null,
                score,
                correctCount: graded.correctCount,
                totalCount: graded.totalCount,
                practiceMode: true,
            };
        }
        if (actor.role === 'STUDENT' && actorId !== studentId) {
            throw new common_1.ForbiddenException('Students can only submit their own attempts');
        }
        await this.assertCanViewStudent(actorId, studentId);
        await this.assertQuizAccess(studentId, body.quizId);
        const assignment = await this.prisma.quizAssignment.findUnique({
            where: { quizId_studentId: { quizId: body.quizId, studentId } },
        });
        const attempt = await this.prisma.$transaction(async (tx) => {
            const created = await tx.quizAttempt.create({
                data: {
                    quizId: body.quizId,
                    studentId,
                    assignmentId: assignment?.id ?? null,
                    score,
                    correctCount: graded.correctCount,
                    totalCount: graded.totalCount,
                    finishedAt: new Date(),
                },
            });
            await tx.quizAnswer.createMany({
                data: graded.answerRows.map((row) => ({
                    attemptId: created.id,
                    questionId: row.questionId,
                    givenAnswer: row.givenAnswer,
                    isCorrect: row.isCorrect,
                })),
            });
            if (assignment) {
                await tx.quizAssignment.update({
                    where: { id: assignment.id },
                    data: { status: 'SUBMITTED', score },
                });
            }
            return created;
        });
        return {
            attemptId: attempt.id,
            score,
            correctCount: graded.correctCount,
            totalCount: graded.totalCount,
            practiceMode: false,
        };
    }
    async requireStaff(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user || user.role === 'STUDENT') {
            throw new common_1.ForbiddenException('This action requires teacher, admin, or super admin role');
        }
    }
    async assertCanViewStudent(viewerId, studentId) {
        if (viewerId === studentId)
            return;
        await this.requireStaff(viewerId);
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
            select: { role: true, teacherId: true },
        });
        if (!student || student.role !== 'STUDENT') {
            throw new common_1.NotFoundException('Student not found');
        }
        const viewer = await this.prisma.user.findUnique({
            where: { id: viewerId },
            select: { role: true },
        });
        if (viewer?.role === 'TEACHER' && student.teacherId !== viewerId) {
            throw new common_1.ForbiddenException('You can only view quizzes for your students');
        }
    }
    async assertQuizAccess(userId, quizId) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        if (quiz.ownerId === userId)
            return;
        const assignment = await this.prisma.quizAssignment.findFirst({
            where: { quizId, studentId: userId },
        });
        if (!assignment)
            throw new common_1.NotFoundException('Quiz not found');
    }
    async collectPool(studentId, lessonId, source) {
        if (source === 'lesson' || (source === 'mixed' && lessonId)) {
            const cards = await this.prisma.studentWordCard.findMany({
                where: { userId: studentId, lessonId: lessonId ?? undefined },
                include: { word: true },
            });
            if (cards.length > 0)
                return cards.map((card) => card.word);
        }
        const cards = await this.prisma.studentWordCard.findMany({
            where: { userId: studentId, OR: [{ status: 'NEW' }, { status: 'MISTAKES_WORK' }, { status: 'REPEATED' }] },
            include: { word: true },
            take: 50,
        });
        if (cards.length > 0)
            return cards.map((card) => card.word);
        return this.prisma.word.findMany({ take: 50 });
    }
    async collectDistractorPool(pool) {
        const ids = new Set(pool.map((word) => word.id));
        const extra = await this.prisma.word.findMany({
            where: { id: { notIn: Array.from(ids) } },
            take: 100,
        });
        return [...pool, ...extra];
    }
    async listFor(userId) {
        const quizzes = await this.prisma.quiz.findMany({
            where: { OR: [{ ownerId: userId }, { assignments: { some: { studentId: userId } } }] },
            include: { _count: { select: { questions: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return quizzes.map((quiz) => ({
            id: quiz.id,
            title: quiz.title,
            category: quiz.category,
            difficulty: quiz.difficulty.toLowerCase(),
            source: quiz.source.toLowerCase(),
            lessonId: quiz.lessonId,
            questionCount: quiz._count.questions,
            createdAt: quiz.createdAt.toISOString(),
        }));
    }
    async detailFor(userId, quizId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: { orderBy: { order: 'asc' } } },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        if (quiz.ownerId !== userId) {
            const assignment = await this.prisma.quizAssignment.findFirst({
                where: { quizId, studentId: userId },
            });
            if (!assignment)
                throw new common_1.NotFoundException('Quiz not found');
        }
        return toDetail(quiz);
    }
};
exports.QuizGeneratorService = QuizGeneratorService;
exports.QuizGeneratorService = QuizGeneratorService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [data_access_prisma_1.PrismaService])
], QuizGeneratorService);
function defaultTitle(body, poolSize) {
    if (body.lessonId)
        return `Lesson quiz (${poolSize} words)`;
    if (body.source === 'vocabulary')
        return `Vocabulary quiz (${poolSize} words)`;
    return 'Generated quiz';
}
function toDetail(quiz) {
    return {
        id: quiz.id,
        title: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty.toLowerCase(),
        source: quiz.source.toLowerCase(),
        lessonId: quiz.lessonId,
        questionCount: quiz.questions.length,
        createdAt: quiz.createdAt.toISOString(),
        questions: quiz.questions.map((question) => ({
            id: question.id,
            type: question.type === 'MULTIPLE_CHOICE' ? 'multiple-choice' : 'fill-in',
            question: question.prompt,
            options: question.options,
            correct: question.type === 'MULTIPLE_CHOICE'
                ? Number.parseInt(question.correctAnswer, 10) || 0
                : question.correctAnswer,
            explanation: question.explanation ?? '',
            wordId: question.wordId,
        })),
    };
}
function buildQuestions(pool, distractorPool, count, difficulty) {
    const ordered = shuffle(pool).slice(0, count);
    const out = [];
    ordered.forEach((word, index) => {
        const template = pickTemplate(index, difficulty, Boolean(word.example));
        const question = buildSingle(template, word, distractorPool);
        if (question)
            out.push(question);
    });
    if (out.length === 0) {
        // Ensure at least one question
        for (const word of ordered) {
            const fallback = buildSingle('definitionMcq', word, distractorPool);
            if (fallback) {
                out.push(fallback);
                break;
            }
        }
    }
    return out;
}
function pickTemplate(index, difficulty, hasExample) {
    if (difficulty === 'easy')
        return 'definitionMcq';
    if (difficulty === 'hard') {
        if (hasExample && index % 2 === 0)
            return 'cloze';
        return 'reverseMcq';
    }
    const cycle = hasExample
        ? ['definitionMcq', 'reverseMcq', 'cloze']
        : ['definitionMcq', 'reverseMcq'];
    return cycle[index % cycle.length];
}
function buildSingle(template, word, pool) {
    if (template === 'definitionMcq') {
        const distractors = pickDistractors(pool, word, (candidate) => candidate.definition).slice(0, 3);
        if (distractors.length < 3)
            return null;
        const options = shuffle([word.definition, ...distractors.map((row) => row.definition)]);
        return {
            type: 'multiple-choice',
            question: `Choose the correct definition for "${word.text}":`,
            options,
            correct: options.indexOf(word.definition),
            explanation: word.example ? `Example: ${word.example}` : `Definition: ${word.definition}`,
            wordId: word.id,
        };
    }
    if (template === 'reverseMcq') {
        const distractors = pickDistractors(pool, word, (candidate) => candidate.text).slice(0, 3);
        if (distractors.length < 3)
            return null;
        const options = shuffle([word.text, ...distractors.map((row) => row.text)]);
        return {
            type: 'multiple-choice',
            question: `Which word matches: "${word.definition}"?`,
            options,
            correct: options.indexOf(word.text),
            explanation: word.example ? `Example: ${word.example}` : `Definition: ${word.definition}`,
            wordId: word.id,
        };
    }
    if (template === 'cloze' && word.example) {
        const masked = maskWordInExample(word.example, word.text);
        if (!masked)
            return null;
        return {
            type: 'fill-in',
            question: `Fill in the blank: ${masked}`,
            correct: word.text,
            explanation: `Original sentence: "${word.example}"`,
            wordId: word.id,
        };
    }
    return null;
}
function pickDistractors(pool, word, selector) {
    const sameCategory = pool.filter((candidate) => candidate.id !== word.id &&
        selector(candidate).trim().length > 0 &&
        candidate.category === word.category);
    const samePos = pool.filter((candidate) => candidate.id !== word.id &&
        selector(candidate).trim().length > 0 &&
        candidate.partOfSpeech === word.partOfSpeech);
    const fallback = pool.filter((candidate) => candidate.id !== word.id && selector(candidate).trim().length > 0);
    const merged = dedupeWordRows([...sameCategory, ...samePos, ...fallback]);
    return shuffle(merged);
}
function dedupeWordRows(items) {
    const seen = new Set();
    return items.filter((item) => {
        if (seen.has(item.id))
            return false;
        seen.add(item.id);
        return true;
    });
}
function maskWordInExample(example, word) {
    if (!example || !word)
        return null;
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
    if (!pattern.test(example))
        return null;
    return example.replace(pattern, '_____');
}
function escapeRegex(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
let QuizController = class QuizController {
    constructor(quizzes) {
        this.quizzes = quizzes;
    }
    async list(userId) {
        return this.quizzes.listFor(userId);
    }
    async listForStudent(userId, studentId) {
        return this.quizzes.listForStudent(userId, studentId);
    }
    async generate(userId, body) {
        return this.quizzes.generate(userId, body);
    }
    async submit(userId, body) {
        return this.quizzes.submitAttempt(userId, body);
    }
    async detail(userId, id) {
        return this.quizzes.detailFor(userId, id);
    }
    async remove(userId, id) {
        const ok = await this.quizzes.delete(userId, id);
        return { ok };
    }
};
exports.QuizController = QuizController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], QuizController.prototype, "list", null);
tslib_1.__decorate([
    (0, common_1.Get)('student/:studentId'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('studentId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], QuizController.prototype, "listForStudent", null);
tslib_1.__decorate([
    (0, common_1.Post)('generate'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], QuizController.prototype, "generate", null);
tslib_1.__decorate([
    (0, common_1.Post)('submit'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], QuizController.prototype, "submit", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], QuizController.prototype, "detail", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], QuizController.prototype, "remove", null);
exports.QuizController = QuizController = tslib_1.__decorate([
    (0, common_1.Controller)('quizzes'),
    (0, common_1.UseGuards)(module_auth_1.AuthGuard),
    tslib_1.__metadata("design:paramtypes", [QuizGeneratorService])
], QuizController);
function gradeQuizAnswers(questions, answers) {
    let correctCount = 0;
    const answerRows = questions.map((question) => {
        const given = answers.find((a) => a.questionId === question.id)?.givenAnswer ?? '';
        let isCorrect = false;
        if (question.type === 'MULTIPLE_CHOICE') {
            isCorrect = Number.parseInt(given, 10) === Number.parseInt(question.correctAnswer, 10);
        }
        else {
            isCorrect =
                given.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
        }
        if (isCorrect)
            correctCount += 1;
        return { questionId: question.id, givenAnswer: given, isCorrect };
    });
    return { correctCount, totalCount: questions.length, answerRows };
}
let FlashcardsModule = class FlashcardsModule {
};
exports.FlashcardsModule = FlashcardsModule;
exports.FlashcardsModule = FlashcardsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [QuizController],
        providers: [QuizGeneratorService],
        exports: [QuizGeneratorService],
    })
], FlashcardsModule);
//# sourceMappingURL=be-flashcards.js.map