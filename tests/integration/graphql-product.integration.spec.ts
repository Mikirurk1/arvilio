import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@be/prisma';
import { AppModule } from '../../apps/api/src/app/app.module';
import { cleanupTestUsers, seedTestUsers, TEST_PASSWORD, TEST_USERS } from './seed';
import { graphqlUrl, loginAs } from './helpers';

const OUTSIDER_EMAIL = 'jest-outsider-student@soenglish.test';

async function gql(
  agent: Awaited<ReturnType<typeof loginAs>>,
  query: string,
  variables?: Record<string, unknown>,
) {
  const res = await agent.post(graphqlUrl()).send({ query, variables });
  return res.body as { data?: unknown; errors?: Array<{ message: string }> };
}

describe('GraphQL product flows (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentId: string;
  let teacherId: string;
  let outsiderId: string;
  let quizId: string;
  let quizQuestionId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'integration-test-jwt-secret-32chars';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    await app.init();

    prisma = moduleRef.get(PrismaService);
    await seedTestUsers(prisma);

    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    const outsider = await prisma.user.upsert({
      where: { email: OUTSIDER_EMAIL },
      create: {
        email: OUTSIDER_EMAIL,
        displayName: 'Outsider Student',
        role: 'STUDENT',
        status: 'ACTIVE',
        passwordHash,
        teacherId: null,
      },
      update: {
        displayName: 'Outsider Student',
        role: 'STUDENT',
        status: 'ACTIVE',
        passwordHash,
        teacherId: null,
      },
    });
    outsiderId = outsider.id;

    const student = await prisma.user.findUniqueOrThrow({
      where: { email: TEST_USERS.student.email },
    });
    const teacher = await prisma.user.findUniqueOrThrow({
      where: { email: TEST_USERS.teacher.email },
    });
    studentId = student.id;
    teacherId = teacher.id;

    const quiz = await prisma.quiz.create({
      data: {
        title: 'Jest Quiz',
        category: 'Test',
        difficulty: 'EASY',
        source: 'VOCABULARY',
        ownerId: teacherId,
        questions: {
          create: [
            {
              order: 0,
              type: 'FILL_IN',
              prompt: 'Say hi',
              options: [],
              correctAnswer: 'hi',
            },
          ],
        },
      },
      include: { questions: true },
    });
    quizId = quiz.id;
    quizQuestionId = quiz.questions[0]!.id;

    await prisma.quizAssignment.upsert({
      where: { quizId_studentId: { quizId, studentId } },
      create: { quizId, studentId, assignedById: teacherId },
      update: {},
    });
  });

  afterAll(async () => {
    await prisma.quizAssignment.deleteMany({ where: { quizId } });
    await prisma.quizAttempt.deleteMany({ where: { quizId } });
    await prisma.quiz.deleteMany({ where: { id: quizId } });
    await prisma.scheduledLesson.deleteMany({
      where: { title: { startsWith: 'Jest Lesson' } },
    });
    await prisma.chatConversation.deleteMany({
      where: { directKey: { contains: studentId } },
    });
    await prisma.user.deleteMany({ where: { email: OUTSIDER_EMAIL } });
    await cleanupTestUsers(prisma);
    await app.close();
  });

  it('student cannot open direct chat with unrelated student', async () => {
    const agent = await loginAs(app, 'student');
    const body = await gql(
      agent,
      `mutation($peerUserId: ID!) {
        findOrCreateDirectConversation(peerUserId: $peerUserId) { id }
      }`,
      { peerUserId: outsiderId },
    );
    expect(body.errors?.[0]?.message).toMatch(/cannot message this user/i);
  });

  it('student cannot submit quiz attempt for another student', async () => {
    const agent = await loginAs(app, 'student');
    const body = await gql(
      agent,
      `mutation($input: SubmitQuizAttemptInput!) {
        submitQuizAttempt(input: $input) { score }
      }`,
      {
        input: {
          quizId,
          studentId: outsiderId,
          answers: [{ questionId: quizQuestionId, givenAnswer: 'hi' }],
        },
      },
    );
    expect(body.errors?.[0]?.message).toMatch(/only submit their own attempts/i);
  });

  it('teacher can create scheduled lesson for assigned student', async () => {
    const agent = await loginAs(app, 'teacher');
    const body = await gql(
      agent,
      `mutation($input: CreateScheduledLessonInput!) {
        createScheduledLesson(input: $input) {
          id
          title
          studentId
          teacherId
        }
      }`,
      {
        input: {
          title: 'Jest Lesson Integration',
          date: '2026-06-01',
          startTime: '10:00',
          endTime: '11:00',
          studentId,
          createMeetLink: false,
        },
      },
    );
    expect(body.errors).toBeUndefined();
    const lesson = (body.data as { createScheduledLesson: { studentId: string; teacherId: string } })
      .createScheduledLesson;
    expect(lesson.studentId).toBe(studentId);
    expect(lesson.teacherId).toBe(teacherId);
  });
});
