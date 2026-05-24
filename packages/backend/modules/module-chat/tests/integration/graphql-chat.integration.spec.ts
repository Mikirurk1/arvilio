import { cleanupTestUsers } from '../../../../../tests/integration/seed';
import { closeIntegrationApp, createIntegrationApp, type IntegrationContext } from '../../../../../tests/integration/bootstrap';
import { getSeededUserIds } from '../../../../../tests/integration/fixtures';
import { gqlAs } from '../../../../../tests/integration/helpers';

describe('GraphQL chat (integration)', () => {
  let ctx: IntegrationContext;
  let teacherId: string;

  beforeAll(async () => {
    ctx = await createIntegrationApp();
    ({ teacherId } = await getSeededUserIds(ctx.prisma));
  });

  afterAll(async () => {
    await cleanupTestUsers(ctx.prisma);
    await closeIntegrationApp(ctx);
  });

  it('student can load chat inbox', async () => {
    const res = await gqlAs(ctx.app, 'student', `query { chatInbox { id } }`);
    expect(res.status).toBe(200);
    expect(Array.isArray((res.body as { data?: { chatInbox: unknown[] } }).data?.chatInbox)).toBe(
      true,
    );
  });

  it('student can load chat contacts', async () => {
    const res = await gqlAs(ctx.app, 'student', `query { chatContacts { id displayName } }`);
    expect(res.status).toBe(200);
    expect(
      Array.isArray((res.body as { data?: { chatContacts: unknown[] } }).data?.chatContacts),
    ).toBe(true);
  });

  it('student can open direct conversation with assigned teacher', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `mutation($peerUserId: ID!) {
        findOrCreateDirectConversation(peerUserId: $peerUserId) { id type title }
      }`,
      { peerUserId: teacherId },
    );
    expect(res.status).toBe(200);
    expect((res.body as { errors?: unknown[] }).errors).toBeUndefined();
    const conv = (res.body as { data?: { findOrCreateDirectConversation: { type: string } } }).data
      ?.findOrCreateDirectConversation;
    expect(conv?.type).toBe('direct');
  });

  it('chatInboxPage rejects invalid cursor', async () => {
    const res = await gqlAs(
      ctx.app,
      'student',
      `query($cursor: String) { chatInboxPage(cursor: $cursor) { items { id } } }`,
      { cursor: 'bad' },
    );
    expect(res.body.errors?.[0]?.message).toMatch(/Invalid inbox cursor/i);
  });
});
