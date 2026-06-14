import {
  DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS,
  GROUP_LESSONS_FEATURE_DISABLED_MESSAGE,
} from '@pkg/types';
import {
  parsePaymentConfig,
  paymentConfigToJson,
} from '../../../module-billing/src/shared/payment-map.util';
import { cleanupTestUsers } from '@tests/integration/seed';
import {
  closeIntegrationApp,
  createIntegrationApp,
  type IntegrationContext,
} from '@tests/integration/bootstrap';
import { getSeededUserIds } from '@tests/integration/fixtures';
import { gqlAs } from '@tests/integration/helpers';

const SETTINGS_ID = 'default';

async function setGroupLessonsEnabled(ctx: IntegrationContext, enabled: boolean) {
  const row = await ctx.prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
  const config = parsePaymentConfig(row?.paymentConfig ?? {});
  config.groupLessons = {
    ...(config.groupLessons ?? DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS),
    enabled,
  };
  await ctx.prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      paymentConfig: paymentConfigToJson(config),
    },
    update: {
      paymentConfig: paymentConfigToJson(config),
    },
  });
}

describe('GraphQL group lessons feature flag (integration)', () => {
  let ctx: IntegrationContext;
  let studentId: string;
  let secondStudentId: string;
  let previousEnabled: boolean;

  beforeAll(async () => {
    ctx = await createIntegrationApp();
    ({ studentId } = await getSeededUserIds(ctx.prisma));

    const outsider = await ctx.prisma.user.create({
      data: {
        email: 'jest-group-flag-outsider@soenglish.test',
        displayName: 'Jest Group Flag Outsider',
        role: 'STUDENT',
        status: 'ACTIVE',
        teacherId: (await getSeededUserIds(ctx.prisma)).teacherId,
      },
      select: { id: true },
    });
    secondStudentId = outsider.id;

    const row = await ctx.prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
    const config = parsePaymentConfig(row?.paymentConfig ?? {});
    previousEnabled = config.groupLessons?.enabled === true;
    await setGroupLessonsEnabled(ctx, false);
  });

  afterAll(async () => {
    await ctx.prisma.scheduledLesson.deleteMany({
      where: { title: { startsWith: 'Jest Group Flag' } },
    });
    await ctx.prisma.user.deleteMany({ where: { id: secondStudentId } });
    await setGroupLessonsEnabled(ctx, previousEnabled);
    await cleanupTestUsers(ctx.prisma);
    await closeIntegrationApp(ctx);
  });

  it('schoolGroupLessonsSettings still reports enabled=false', async () => {
    const res = await gqlAs(
      ctx.app,
      'admin',
      `query { schoolGroupLessonsSettings { enabled defaultBillingMode } }`,
    );
    expect(res.status).toBe(200);
    expect((res.body as { errors?: unknown[] }).errors).toBeUndefined();
    expect(
      (res.body as { data?: { schoolGroupLessonsSettings?: { enabled?: boolean } } }).data
        ?.schoolGroupLessonsSettings?.enabled,
    ).toBe(false);
  });

  it('studentGroups query is rejected when feature is disabled', async () => {
    const res = await gqlAs(ctx.app, 'admin', `query { studentGroups { id name } }`);
    expect(res.body.errors?.[0]?.message).toBe(GROUP_LESSONS_FEATURE_DISABLED_MESSAGE);
  });

  it('createStudentGroup mutation is rejected when feature is disabled', async () => {
    const { teacherId } = await getSeededUserIds(ctx.prisma);
    const res = await gqlAs(
      ctx.app,
      'admin',
      `mutation($input: CreateStudentGroupInput!) {
        createStudentGroup(input: $input) { id }
      }`,
      {
        input: {
          name: 'Jest Group Flag Blocked',
          teacherId,
          memberUserIds: [studentId, secondStudentId],
          groupBillingMode: 'per_member',
        },
      },
    );
    expect(res.body.errors?.[0]?.message).toBe(GROUP_LESSONS_FEATURE_DISABLED_MESSAGE);
  });

  it('createScheduledLesson with kind group is rejected when feature is disabled', async () => {
    const res = await gqlAs(
      ctx.app,
      'teacher',
      `mutation($input: CreateScheduledLessonInput!) {
        createScheduledLesson(input: $input) { id }
      }`,
      {
        input: {
          title: 'Jest Group Flag Lesson',
          date: '2026-08-01',
          startTime: '10:00',
          endTime: '11:00',
          studentId,
          kind: 'group',
          participantIds: [studentId, secondStudentId],
          groupBilling: { mode: 'per_member' },
          createMeetLink: false,
        },
      },
    );
    expect(res.body.errors?.[0]?.message).toBe(GROUP_LESSONS_FEATURE_DISABLED_MESSAGE);
  });

  it('individual lessons still work when group lessons are disabled', async () => {
    const res = await gqlAs(
      ctx.app,
      'teacher',
      `mutation($input: CreateScheduledLessonInput!) {
        createScheduledLesson(input: $input) { id title }
      }`,
      {
        input: {
          title: 'Jest Group Flag Individual',
          date: '2026-08-02',
          startTime: '11:00',
          endTime: '12:00',
          studentId,
          createMeetLink: false,
        },
      },
    );
    expect(res.status).toBe(200);
    expect((res.body as { errors?: unknown[] }).errors).toBeUndefined();
    expect(
      (res.body as { data?: { createScheduledLesson?: { title?: string } } }).data
        ?.createScheduledLesson?.title,
    ).toBe('Jest Group Flag Individual');
  });
});
