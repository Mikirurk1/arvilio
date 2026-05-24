import { cleanupTestUsers } from '../../../../../tests/integration/seed';
import { closeIntegrationApp, createIntegrationApp, type IntegrationContext } from '../../../../../tests/integration/bootstrap';
import { getSeededUserIds } from '../../../../../tests/integration/fixtures';
import { gqlAs } from '../../../../../tests/integration/helpers';

describe('GraphQL vocabulary (integration)', () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await createIntegrationApp();
  });

  afterAll(async () => {
    await ctx.prisma.studentWordCard.deleteMany({
      where: { word: { normalizedText: 'jest-vocab-integration' } },
    });
    await ctx.prisma.word.deleteMany({ where: { normalizedText: 'jest-vocab-integration' } });
    await cleanupTestUsers(ctx.prisma);
    await closeIntegrationApp(ctx);
  });

  it('student can add and list vocabulary card', async () => {
    const { studentId } = await getSeededUserIds(ctx.prisma);
    const addRes = await gqlAs(
      ctx.app,
      'student',
      `mutation($input: CreateStudentWordCardInput!) {
        addStudentWordCard(input: $input) { id word { text } }
      }`,
      { input: { text: 'jest-vocab-integration' } },
    );
    expect(addRes.status).toBe(200);
    expect((addRes.body as { errors?: unknown[] }).errors).toBeUndefined();

    const listRes = await gqlAs(
      ctx.app,
      'student',
      `query($userId: ID!) { studentVocabulary(userId: $userId) { id } }`,
      { userId: studentId },
    );
    expect(listRes.status).toBe(200);
    const cards = (listRes.body as { data?: { studentVocabulary: { id: string }[] } }).data
      ?.studentVocabulary;
    expect(cards?.length).toBeGreaterThan(0);
  });

  it('teacher can add vocabulary for assigned student', async () => {
    const { studentId } = await getSeededUserIds(ctx.prisma);
    const res = await gqlAs(
      ctx.app,
      'teacher',
      `mutation($input: CreateStudentWordCardInput!, $studentId: ID!) {
        addStudentWordCard(input: $input, studentId: $studentId) { id word { text } }
      }`,
      { input: { text: 'jest-vocab-teacher-add' }, studentId },
    );
    expect(res.status).toBe(200);
    expect((res.body as { errors?: unknown[] }).errors).toBeUndefined();
    await ctx.prisma.studentWordCard.deleteMany({
      where: { word: { normalizedText: 'jest-vocab-teacher-add' } },
    });
    await ctx.prisma.word.deleteMany({ where: { normalizedText: 'jest-vocab-teacher-add' } });
  });

  it('studentVocabularyPage rejects invalid cursor', async () => {
    const { studentId } = await getSeededUserIds(ctx.prisma);
    const res = await gqlAs(
      ctx.app,
      'student',
      `query($studentId: ID!, $cursor: String) {
        studentVocabularyPage(studentId: $studentId, cursor: $cursor) { items { id } }
      }`,
      { studentId, cursor: 'not-valid' },
    );
    expect(res.body.errors?.[0]?.message).toMatch(/Invalid vocabulary cursor/i);
  });
});
