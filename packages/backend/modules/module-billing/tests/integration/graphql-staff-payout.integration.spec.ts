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
  return res.body as { data?: Record<string, unknown>; errors?: Array<{ message: string }> };
}

describe('Staff payroll GraphQL (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let teacherId: string;

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

    const teacher = await prisma.user.findUniqueOrThrow({
      where: { email: TEST_USERS.teacher.email },
    });
    teacherId = teacher.id;
  });

  afterAll(async () => {
    await prisma.staffPayout.deleteMany({ where: { userId: teacherId } });
    await cleanupTestUsers(prisma);
    await app.close();
  });

  it('teacher cannot query staffFinanceOverview', async () => {
    const agent = await loginAs(app, 'teacher');
    const body = await gql(
      agent,
      `query { staffFinanceOverview(range: "month") { totalAccruedMinor } }`,
    );
    expect(body.errors?.[0]?.message).toMatch(/Insufficient role/i);
  });

  it('admin can record payout and teacher can read myStaffEarnings', async () => {
    const admin = await loginAs(app, 'admin');
    const recordBody = await gql(
      admin,
      `
        mutation Record($input: RecordStaffPayoutInput!) {
          recordStaffPayout(input: $input) {
            id
            userId
            amountMinor
          }
        }
      `,
      {
        input: {
          userId: teacherId,
          amountMinor: 150000,
          currency: 'UAH',
          paidAt: new Date().toISOString(),
          note: 'Integration test payout',
        },
      },
    );
    expect(recordBody.errors).toBeUndefined();
    expect(recordBody.data?.recordStaffPayout).toBeTruthy();

    const teacher = await loginAs(app, 'teacher');
    const earningsBody = await gql(
      teacher,
      `query { myStaffEarnings(range: "month") { paidMinor accruedMinor outstandingMinor payoutStatus } }`,
    );
    expect(earningsBody.errors).toBeUndefined();
    const earnings = earningsBody.data?.myStaffEarnings as {
      paidMinor: number;
      accruedMinor: number;
      outstandingMinor: number;
      payoutStatus: string;
    };
    expect(earnings.paidMinor).toBeGreaterThanOrEqual(150000);
    expect(['ok', 'due', 'overdue']).toContain(earnings.payoutStatus);
  });

  it('admin can page staff payout history with cursor', async () => {
    const admin = await loginAs(app, 'admin');
    const pageBody = await gql(
      admin,
      `
        query PayoutPage($userId: ID!, $limit: Int) {
          staffPayoutHistoryPage(userId: $userId, limit: $limit) {
            items {
              id
              amountMinor
            }
            hasMore
            nextCursor
          }
        }
      `,
      { userId: teacherId, limit: 1 },
    );
    expect(pageBody.errors).toBeUndefined();
    const page = pageBody.data?.staffPayoutHistoryPage as {
      items: Array<{ id: string; amountMinor: number }>;
      hasMore: boolean;
      nextCursor: string | null;
    };
    expect(page.items.length).toBeGreaterThanOrEqual(1);
    if (page.hasMore && page.nextCursor) {
      const nextBody = await gql(
        admin,
        `
          query PayoutPage($userId: ID!, $cursor: String, $limit: Int) {
            staffPayoutHistoryPage(userId: $userId, cursor: $cursor, limit: $limit) {
              items { id }
              hasMore
            }
          }
        `,
        { userId: teacherId, cursor: page.nextCursor, limit: 1 },
      );
      expect(nextBody.errors).toBeUndefined();
      const next = nextBody.data?.staffPayoutHistoryPage as {
        items: Array<{ id: string }>;
      };
      expect(next.items[0]?.id).not.toBe(page.items[0]?.id);
    }
  });

  it('admin can query staffMemberEarnings for a teacher', async () => {
    const admin = await loginAs(app, 'admin');
    const body = await gql(
      admin,
      `query StaffMemberEarnings($userId: ID!) {
        staffMemberEarnings(userId: $userId, range: "month") {
          accruedMinor
          paidMinor
          completedLessons
          payoutStatus
        }
      }`,
      { userId: teacherId },
    );
    expect(body.errors).toBeUndefined();
    const earnings = body.data?.staffMemberEarnings as {
      accruedMinor: number;
      paidMinor: number;
      completedLessons: number;
      payoutStatus: string;
    };
    expect(earnings).toBeTruthy();
    expect(earnings.completedLessons).toBeGreaterThanOrEqual(0);
    expect(['ok', 'due', 'overdue']).toContain(earnings.payoutStatus);
  });

  it('teacher cannot query staffMemberEarnings for another user', async () => {
    const teacher = await loginAs(app, 'teacher');
    const body = await gql(
      teacher,
      `query { staffMemberEarnings(userId: "${teacherId}", range: "month") { accruedMinor } }`,
    );
    expect(body.errors?.[0]?.message).toMatch(/Insufficient role/i);
  });

  it('super admin can read and update staff payout defaults', async () => {
    const agent = await loginAs(app, 'superAdmin');
    const defaultsBody = await gql(
      agent,
      `query { staffPayoutDefaults { defaultMode defaultGraceDays defaultPerLessonRateMinor } }`,
    );
    expect(defaultsBody.errors).toBeUndefined();
    expect(defaultsBody.data?.staffPayoutDefaults).toBeTruthy();

    const updateBody = await gql(
      agent,
      `
        mutation Update($input: UpdateStaffPayoutDefaultsInput!) {
          updateStaffPayoutDefaults(input: $input) {
            defaultGraceDays
            defaultMode
          }
        }
      `,
      {
        input: {
          defaultMode: 'per_lesson',
          defaultPerLessonRateMinor: 50000,
          defaultSalaryMinor: 0,
          defaultCurrency: 'UAH',
          defaultPayFrequency: 'monthly',
          defaultPayDayOfWeek: 5,
          defaultPayDayOfMonth: 1,
          defaultGraceDays: 5,
        },
      },
    );
    expect(updateBody.errors).toBeUndefined();
    expect((updateBody.data?.updateStaffPayoutDefaults as { defaultGraceDays: number }).defaultGraceDays).toBe(5);
  });
});
