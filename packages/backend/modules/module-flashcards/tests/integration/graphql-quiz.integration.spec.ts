import { cleanupTestUsers } from '../../../../../tests/integration/seed';
import { closeIntegrationApp, createIntegrationApp, type IntegrationContext } from '../../../../../tests/integration/bootstrap';
import { getSeededUserIds } from '../../../../../tests/integration/fixtures';
import { gqlAs } from '../../../../../tests/integration/helpers';

describe('GraphQL quiz (integration)', () => {
  let ctx: IntegrationContext;
  let quizId: string;

  beforeAll(async () => {
    ctx = await createIntegrationApp();
    const { teacherId, studentId } = await getSeededUserIds(ctx.prisma);
    const quiz = await ctx.prisma.quiz.create({
      data: {
        title: 'Jest Quiz Spec',
        category: 'Test',
        difficulty: 'EASY',
        source: 'VOCABULARY',
        ownerId: teacherId,
        questions: {
          create: [
            {
              order: 0,
              type: 'FILL_IN',
              prompt: 'Hi',
              options: [],
              correctAnswer: 'hello',
            },
          ],
        },
      },
    });
    quizId = quiz.id;
    await ctx.prisma.quizAssignment.upsert({
      where: { quizId_studentId: { quizId, studentId } },
      create: { quizId, studentId, assignedById: teacherId },
      update: {},
    });
  });

  afterAll(async () => {
    await ctx.prisma.quizAssignment.deleteMany({ where: { quizId } });
    await ctx.prisma.quiz.deleteMany({ where: { id: quizId } });
    await cleanupTestUsers(ctx.prisma);
    await closeIntegrationApp(ctx);
  });

  it('student lists assigned quizzes', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `query { studentQuizzes { id title } }`,
    );
    expect(res.status).toBe(200);
    const list = (res.body as { data?: { studentQuizzes: { id: string }[] } }).data?.studentQuizzes;
    expect(list?.some((q) => q.id === quizId)).toBe(true);
  });

  it('teacher lists quizzes', async () => {
    const res = await gqlAs(ctx.app, 'teacher', `query { quizzes { id title } }`);
    expect(res.status).toBe(200);
    expect(
      (res.body as { data?: { quizzes: { id: string }[] } }).data?.quizzes.some((q) => q.id === quizId),
    ).toBe(true);
  });

  it('student cannot delete quiz', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `mutation($id: ID!) { deleteQuiz(id: $id) }`,
      { id: quizId },
    );
    expect(res.body.errors?.[0]?.message).toMatch(/delete quizzes you created/i);
  });

  it('student can load quiz detail when assigned', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `query($id: ID!) { quiz(id: $id) { id title } }`,
      { id: quizId },
    );
    expect(res.status).toBe(200);
    expect((res.body as { errors?: unknown[] }).errors).toBeUndefined();
    expect((res.body as { data?: { quiz: { id: string } } }).data?.quiz?.id).toBe(quizId);
  });
});
