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

  beforeAll(async () => {
    ctx = await createIntegrationApp();
    ({ studentId } = await getSeededUserIds(ctx.prisma));
  });

  afterAll(async () => {
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
