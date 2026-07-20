import { cleanupTestUsers } from '@tests/integration/seed';
import {
  closeIntegrationApp,
  createIntegrationApp,
  type IntegrationContext,
} from '@tests/integration/bootstrap';
import { getSeededUserIds } from '@tests/integration/fixtures';
import { gqlAs } from '@tests/integration/helpers';

describe('GraphQL lessons (integration)', () => {
  let ctx: IntegrationContext;
  let studentId: string;
  let outsiderStudentId: string;
  let createdLessonId: string | null = null;

  beforeAll(async () => {
    ctx = await createIntegrationApp();
    ({ studentId } = await getSeededUserIds(ctx.prisma));
    const outsider = await ctx.prisma.user.create({
      data: {
        email: 'jest-outsider-lessons@arvilio.test',
        displayName: 'Jest Outsider Lessons',
        role: 'STUDENT',
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    outsiderStudentId = outsider.id;
  });

  afterAll(async () => {
    await ctx.prisma.scheduledLesson.deleteMany({
      where: { OR: [{ studentId: outsiderStudentId }, { teacherId: outsiderStudentId }] },
    });
    await ctx.prisma.user.deleteMany({ where: { id: outsiderStudentId } });
    await ctx.prisma.scheduledLesson.deleteMany({
      where: {
        OR: [
          { title: { startsWith: 'Jest Lessons Spec' } },
          { title: 'Jest Lessons Spec Admin' },
        ],
      },
    });
    await cleanupTestUsers(ctx.prisma);
    await closeIntegrationApp(ctx);
  });

  it('teacher lists scheduled lessons', async () => {
    const res = await gqlAs(
      ctx.app,
      'teacher',
      `query { scheduledLessons { id title } }`,
    );
    expect(res.status).toBe(200);
    expect(
      Array.isArray(
        (res.body as { data?: { scheduledLessons: unknown[] } }).data
          ?.scheduledLessons,
      ),
    ).toBe(true);
  });

  it('teacher creates lesson without meet link', async () => {
    const res = await gqlAs(
      ctx.app,
      'teacher',
      `mutation($input: CreateScheduledLessonInput!) {
        createScheduledLesson(input: $input) { id title studentId }
      }`,
      {
        input: {
          title: 'Jest Lessons Spec',
          date: '2026-07-01',
          startTime: '14:00',
          endTime: '15:00',
          studentId,
          createMeetLink: false,
        },
      },
    );
    expect(res.status).toBe(200);
    expect((res.body as { errors?: unknown[] }).errors).toBeUndefined();
    createdLessonId = (res.body as { data?: { createScheduledLesson?: { id?: string } } }).data
      ?.createScheduledLesson?.id ?? null;
  });

  it('student cannot create lesson for another student', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `mutation($input: CreateScheduledLessonInput!) {
        createScheduledLesson(input: $input) { id }
      }`,
      {
        input: {
          title: 'Jest Lessons Spec Deny',
          date: '2026-07-02',
          startTime: '10:00',
          endTime: '11:00',
          studentId,
          createMeetLink: false,
        },
      },
    );
    expect(res.body.errors?.[0]?.message).toMatch(
      /requires teacher, admin, or super admin role/i,
    );
  });

  it('student can list scheduled lessons', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `query { scheduledLessons { id title } }`,
    );
    expect(res.status).toBe(200);
    expect(
      Array.isArray(
        (res.body as { data?: { scheduledLessons: unknown[] } }).data
          ?.scheduledLessons,
      ),
    ).toBe(true);
  });

  it('teacher cannot create lesson for an unassigned student', async () => {
    const res = await gqlAs(
      ctx.app,
      'teacher',
      `mutation($input: CreateScheduledLessonInput!) {
        createScheduledLesson(input: $input) { id }
      }`,
      {
        input: {
          title: 'Jest Lessons Outsider',
          date: '2026-07-04',
          startTime: '13:00',
          endTime: '14:00',
          studentId: outsiderStudentId,
          createMeetLink: false,
        },
      },
    );
    expect(res.body.errors?.[0]?.message).toMatch(/own students/i);
  });

  it('student cannot change lesson scheduling fields', async () => {
    expect(createdLessonId).toBeTruthy();
    const res = await gqlAs(
      ctx.app,
      'student',
      `mutation($id: ID!, $input: UpdateScheduledLessonInput!) {
        updateScheduledLesson(id: $id, input: $input) { id title }
      }`,
      {
        id: createdLessonId,
        input: {
          title: 'Student edited title',
          studentResponse: { text: 'done', status: 'submitted' },
        },
      },
    );
    expect(res.body.errors?.[0]?.message).toMatch(/lesson response/i);
  });

  it('student can submit only student response fields', async () => {
    expect(createdLessonId).toBeTruthy();
    const res = await gqlAs(
      ctx.app,
      'student',
      `mutation($id: ID!, $input: UpdateScheduledLessonInput!) {
        updateScheduledLesson(id: $id, input: $input) {
          id
          studentResponse { text status homeworkChecked teacherHomeworkFeedback }
        }
      }`,
      {
        id: createdLessonId,
        input: {
          studentResponse: {
            text: 'Homework submitted from integration test',
            status: 'submitted',
          },
        },
      },
    );
    expect(res.status).toBe(200);
    expect((res.body as { errors?: unknown[] }).errors).toBeUndefined();
    expect(
      (
        res.body as {
          data?: {
            updateScheduledLesson?: { studentResponse?: { text?: string; status?: string } };
          };
        }
      ).data?.updateScheduledLesson?.studentResponse,
    ).toMatchObject({
      text: 'Homework submitted from integration test',
      status: 'submitted',
    });
  });

  it('admin can create lesson for student', async () => {
    const res = await gqlAs(
      ctx.app,
      'admin',
      `mutation($input: CreateScheduledLessonInput!) {
        createScheduledLesson(input: $input) { id title }
      }`,
      {
        input: {
          title: 'Jest Lessons Spec Admin',
          date: '2026-07-03',
          startTime: '11:00',
          endTime: '12:00',
          studentId,
          createMeetLink: false,
        },
      },
    );
    expect(res.status).toBe(200);
    expect((res.body as { errors?: unknown[] }).errors).toBeUndefined();
  });
});
