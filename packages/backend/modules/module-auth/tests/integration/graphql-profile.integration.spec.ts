import { cleanupTestUsers } from '../../../../../tests/integration/seed';
import { closeIntegrationApp, createIntegrationApp, type IntegrationContext } from '../../../../../tests/integration/bootstrap';
import { gqlAs } from '../../../../../tests/integration/helpers';

describe('GraphQL profile (integration)', () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await createIntegrationApp();
  });

  afterAll(async () => {
    await cleanupTestUsers(ctx.prisma);
    await closeIntegrationApp(ctx);
  });

  it('student can load myProfile', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `query { myProfile { id email displayName role } }`,
    );
    expect(res.status).toBe(200);
    expect((res.body as { data?: { myProfile: { role: string } } }).data?.myProfile.role).toBe(
      'student',
    );
  });

  it('student can update display name', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `mutation($input: UpdateMyProfileInput!) {
        updateMyProfile(input: $input) { displayName }
      }`,
      { input: { displayName: 'Jest Student Updated' } },
    );
    expect(res.status).toBe(200);
    expect(
      (res.body as { data?: { updateMyProfile: { displayName: string } } }).data?.updateMyProfile
        .displayName,
    ).toBe('Jest Student Updated');
  });
});
