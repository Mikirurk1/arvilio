import { cleanupTestUsers } from '@tests/integration/seed';
import {
  closeIntegrationApp,
  createIntegrationApp,
  type IntegrationContext,
} from '@tests/integration/bootstrap';
import { getSeededUserIds } from '@tests/integration/fixtures';
import { gqlAs } from '@tests/integration/helpers';

describe('GraphQL vocabulary (integration)', () => {
  let ctx: IntegrationContext;
  let outsiderStudentId: string;

  beforeAll(async () => {
    ctx = await createIntegrationApp();
    await ctx.prisma.word.upsert({
      where: { normalizedText: 'jest-vocab-integration' },
      create: {
        text: 'jest-vocab-integration',
        normalizedText: 'jest-vocab-integration',
        definition: 'integration test word',
      },
      update: {},
    });
    await ctx.prisma.word.upsert({
      where: { normalizedText: 'jest-vocab-teacher-add' },
      create: {
        text: 'jest-vocab-teacher-add',
        normalizedText: 'jest-vocab-teacher-add',
        definition: 'integration test word',
      },
      update: {},
    });
    const outsider = await ctx.prisma.user.create({
      data: {
        email: 'jest-outsider-vocab@arvilio.test',
        displayName: 'Jest Outsider Vocab',
        role: 'STUDENT',
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    outsiderStudentId = outsider.id;
  });

  afterAll(async () => {
    await ctx.prisma.studentWordCard.deleteMany({ where: { userId: outsiderStudentId } });
    await ctx.prisma.user.deleteMany({ where: { id: outsiderStudentId } });
    await ctx.prisma.studentWordCard.deleteMany({
      where: {
        word: {
          normalizedText: { in: ['jest-vocab-integration', 'jest-vocab-teacher-add'] },
        },
      },
    });
    await ctx.prisma.word.deleteMany({
      where: {
        normalizedText: { in: ['jest-vocab-integration', 'jest-vocab-teacher-add'] },
      },
    });
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
      `query($studentId: ID!) { studentVocabulary(studentId: $studentId) { id } }`,
      { studentId },
    );
    expect(listRes.status).toBe(200);
    const cards = (
      listRes.body as { data?: { studentVocabulary: { id: string }[] } }
    ).data?.studentVocabulary;
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
    await ctx.prisma.word.deleteMany({
      where: { normalizedText: 'jest-vocab-teacher-add' },
    });
  });

  it('teacher cannot query or add vocabulary for an unassigned student', async () => {
    const listRes = await gqlAs(
      ctx.app,
      'teacher',
      `query($studentId: ID!) { studentVocabulary(studentId: $studentId) { id } }`,
      { studentId: outsiderStudentId },
    );
    expect(listRes.body.errors?.[0]?.message).toMatch(/your students/i);

    const addRes = await gqlAs(
      ctx.app,
      'teacher',
      `mutation($input: CreateStudentWordCardInput!, $studentId: ID!) {
        addStudentWordCard(input: $input, studentId: $studentId) { id }
      }`,
      { input: { text: 'jest-vocab-integration' }, studentId: outsiderStudentId },
    );
    expect(addRes.body.errors?.[0]?.message).toMatch(/your students/i);
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
