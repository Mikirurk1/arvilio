import { cleanupTestUsers } from '@tests/integration/seed';
import {
  closeIntegrationApp,
  createIntegrationApp,
  type IntegrationContext,
} from '@tests/integration/bootstrap';
import { gqlAs } from '@tests/integration/helpers';

describe('GraphQL admin (integration)', () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await createIntegrationApp();
  });

  afterAll(async () => {
    await cleanupTestUsers(ctx.prisma);
    await closeIntegrationApp(ctx);
  });

  it('admin can list adminUsers', async () => {
    const res = await gqlAs(
      ctx.app,
      'admin',
      `query { adminUsers { id email role } }`,
    );
    expect(res.status).toBe(200);
    expect(
      Array.isArray(
        (res.body as { data?: { adminUsers: unknown[] } }).data?.adminUsers,
      ),
    ).toBe(true);
  });

  it('student cannot list adminUsers', async () => {
    const res = await gqlAs(ctx.app, 'student', `query { adminUsers { id } }`);
    expect(res.body.errors?.[0]?.message).toBeDefined();
  });

  it('admin can read systemMailStatus', async () => {
    const res = await gqlAs(
      ctx.app,
      'admin',
      `query { systemMailStatus { configured mailFrom } }`,
    );
    expect(res.status).toBe(200);
    expect(
      (res.body as { data?: { systemMailStatus: { configured: boolean } } })
        .data?.systemMailStatus,
    ).toBeDefined();
  });
});
