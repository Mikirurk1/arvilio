import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { PrismaService } from '@be/prisma';
import { AppModule } from '../../../../../../apps/api/src/app/app.module';
import {
  cleanupTestUsers,
  seedTestUsers,
  TEST_USERS,
} from '@tests/integration/seed';
import { graphqlUrl, loginAs } from '@tests/integration/helpers';

async function gql(
  agent: Awaited<ReturnType<typeof loginAs>>,
  query: string,
  variables?: Record<string, unknown>,
) {
  const res = await agent.post(graphqlUrl()).send({ query, variables });
  return res.body as { data?: unknown; errors?: Array<{ message: string }> };
}

describe('GraphQL RBAC (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentCardId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ?? 'integration-test-jwt-secret-32chars';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    await app.init();

    prisma = moduleRef.get(PrismaService);
    await seedTestUsers(prisma);

    const student = await prisma.user.findUniqueOrThrow({
      where: { email: TEST_USERS.student.email },
    });
    const word = await prisma.word.upsert({
      where: { normalizedText: 'jest-rbac-word' },
      create: {
        text: 'jest-rbac-word',
        normalizedText: 'jest-rbac-word',
        definition: 'test',
      },
      update: {},
    });
    const card = await prisma.studentWordCard.upsert({
      where: { userId_wordId: { userId: student.id, wordId: word.id } },
      create: { userId: student.id, wordId: word.id, schoolId: 'school_default' },
      update: {},
    });
    studentCardId = card.id;
  });

  afterAll(async () => {
    await prisma.studentWordCard.deleteMany({
      where: { word: { normalizedText: 'jest-rbac-word' } },
    });
    await prisma.word.deleteMany({
      where: { normalizedText: 'jest-rbac-word' },
    });
    await cleanupTestUsers(prisma);
    await app.close();
  });

  it('student cannot query adminUsers', async () => {
    const agent = await loginAs(app, 'student');
    const body = await gql(agent, `query { adminUsers { id email } }`);
    expect(body.errors?.[0]?.message).toMatch(
      /Insufficient role for this action/i,
    );
  });

  it('student cannot createAdminUser', async () => {
    const agent = await loginAs(app, 'student');
    const body = await gql(
      agent,
      `mutation($input: CreateAdminUserInput!) {
        createAdminUser(input: $input) { user { id } }
      }`,
      {
        input: {
          email: 'hacker@example.com',
          role: 'student',
          displayName: 'Hacker',
        },
      },
    );
    expect(body.errors?.[0]?.message).toMatch(
      /Insufficient role for this action/i,
    );
  });

  it('student cannot deleteStudentWordCard', async () => {
    const student = await prisma.user.findUniqueOrThrow({
      where: { email: TEST_USERS.student.email },
    });
    const agent = await loginAs(app, 'student');
    const body = await gql(
      agent,
      `mutation($cardId: ID!, $studentId: ID!) {
        deleteStudentWordCard(cardId: $cardId, studentId: $studentId)
      }`,
      { cardId: studentCardId, studentId: student.id },
    );
    expect(body.errors?.[0]?.message).toMatch(
      /Students cannot delete vocabulary cards/i,
    );
  });
});
