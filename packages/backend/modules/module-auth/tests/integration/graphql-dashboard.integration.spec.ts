import { cleanupTestUsers } from '@tests/integration/seed';
import {
  closeIntegrationApp,
  createIntegrationApp,
  type IntegrationContext,
} from '@tests/integration/bootstrap';
import { gqlAs } from '@tests/integration/helpers';

describe('GraphQL dashboard (integration)', () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await createIntegrationApp();
  });

  afterAll(async () => {
    await cleanupTestUsers(ctx.prisma);
    await closeIntegrationApp(ctx);
  });

  it('student can load dashboardSummary', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `query { dashboardSummary { role lessonsToday vocabularyCount } }`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { data?: { dashboardSummary: { role: string } } };
    expect(body.data?.dashboardSummary.role).toBe('student');
  });

  it('student can list dailyGoals', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `query { dailyGoals { id text done } }`,
    );
    expect(res.status).toBe(200);
    expect(
      Array.isArray(
        (res.body as { data?: { dailyGoals: unknown[] } }).data?.dailyGoals,
      ),
    ).toBe(true);
  });

  it('student can load statisticsDashboard for week', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `query {
        statisticsDashboard(range: "week") {
          layout
          range
          streakDays
          kpis { id label value }
          lessons { completed }
          dailyGoals { slotsAvailable daysInRange }
        }
      }`,
    );
    expect(res.status).toBe(200);
    const body = res.body as {
      data?: {
        statisticsDashboard: {
          layout: string;
          kpis: unknown[];
        };
      };
    };
    expect(body.data?.statisticsDashboard.layout).toBe('student');
    expect(Array.isArray(body.data?.statisticsDashboard.kpis)).toBe(true);
  });

  it('teacher profile statisticsDashboard returns teacher layout', async () => {
    const res = await gqlAs(
      ctx.app,
      'teacher',
      `query {
        statisticsDashboard(range: "week") {
          layout
          title
          kpis { id }
          staffOverview { totalStudents activeStudents }
          lessons { completed }
        }
      }`,
    );
    expect(res.status).toBe(200);
    const dash = (res.body as {
      data?: {
        statisticsDashboard: {
          layout: string;
          kpis: unknown[];
          staffOverview: { totalStudents: number };
        };
      };
    }).data?.statisticsDashboard;
    expect(dash?.layout).toBe('teacher');
    expect(Array.isArray(dash?.kpis)).toBe(true);
    expect(dash?.kpis.length).toBeGreaterThan(0);
    expect(dash?.staffOverview).toBeDefined();
  });

  it('admin can load statisticsDashboard for a teacher via staffUserId', async () => {
    const teacherRes = await gqlAs(
      ctx.app,
      'teacher',
      `query { dashboardSummary { role } }`,
    );
    expect(teacherRes.status).toBe(200);

    const teacherUser = await ctx.prisma.user.findFirstOrThrow({
      where: { role: 'TEACHER' },
      select: { id: true, displayName: true },
    });

    const res = await gqlAs(
      ctx.app,
      'admin',
      `query StaffStats($staffUserId: ID!) {
        statisticsDashboard(range: "week", staffUserId: $staffUserId) {
          layout
          title
          studentScope
          kpis { id }
        }
      }`,
      { staffUserId: teacherUser.id },
    );
    expect(res.status).toBe(200);
    const body = res.body as {
      data?: {
        statisticsDashboard: {
          layout: string;
          title: string;
          studentScope: string;
        };
      };
      errors?: Array<{ message: string }>;
    };
    expect(body.errors).toBeUndefined();
    expect(body.data?.statisticsDashboard.layout).toBe('teacher');
    expect(body.data?.statisticsDashboard.studentScope).toBe('my_students');
    expect(body.data?.statisticsDashboard.title).toContain(teacherUser.displayName);
  });

  it('teacher cannot load statisticsDashboard with staffUserId', async () => {
    const teacherUser = await ctx.prisma.user.findFirstOrThrow({
      where: { role: 'TEACHER' },
      select: { id: true },
    });
    const res = await gqlAs(
      ctx.app,
      'teacher',
      `query {
        statisticsDashboard(range: "week", staffUserId: "${teacherUser.id}") {
          layout
        }
      }`,
    );
    expect(res.status).toBe(200);
    const body = res.body as { errors?: Array<{ message: string }> };
    expect(body.errors?.[0]?.message).toMatch(/Forbidden/i);
  });
});
