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
});
