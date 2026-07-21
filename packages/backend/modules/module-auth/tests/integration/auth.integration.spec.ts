import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { PrismaService } from '@be/prisma';
import { TenantModule } from '@be/tenant';
import { AuthModule, ACCESS_COOKIE, REFRESH_COOKIE } from '@be/auth';
import { hashRefreshToken } from '../../src/shared/auth-cookies';
import {
  cleanupTestUsers,
  seedTestUsers,
  TEST_PASSWORD,
  TEST_USERS,
} from '@tests/integration/seed';
import { loginAs } from '@tests/integration/helpers';
import type { UserStatus } from '@prisma/client';

function setCookieHeader(res: { headers: Record<string, unknown> }): string[] {
  const raw = res.headers['set-cookie'];
  if (!raw) return [];
  return Array.isArray(raw) ? raw.map(String) : [String(raw)];
}

async function setUserStatus(
  prisma: PrismaService,
  email: string,
  status: UserStatus,
): Promise<void> {
  await prisma.user.update({
    where: { email },
    data: { status },
  });
}

describe('Auth API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ?? 'integration-test-jwt-secret-32chars';
    const moduleRef = await Test.createTestingModule({
      imports: [TenantModule, AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    await app.init();

    prisma = moduleRef.get(PrismaService);
    await seedTestUsers(prisma);
  });

  afterAll(async () => {
    await cleanupTestUsers(prisma);
    await app.close();
  });

  afterEach(async () => {
    await Promise.all(
      Object.values(TEST_USERS).map((user) =>
        prisma.user.updateMany({
          where: { email: user.email },
          data: { status: 'ACTIVE' },
        }),
      ),
    );
  });

  it('POST /api/auth/login sets cookies and returns student role', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_USERS.student.email, password: TEST_PASSWORD })
      .expect(201);

    const cookies = setCookieHeader(res);
    expect(cookies.some(c => c.startsWith(`${ACCESS_COOKIE}=`))).toBe(true);
    expect(cookies.some(c => c.startsWith(`${REFRESH_COOKIE}=`))).toBe(true);
    expect(res.body.user.role).toBe('student');
    expect(res.body.user.email).toBe(TEST_USERS.student.email);
  });

  it('GET /api/auth/me returns session when authenticated', async () => {
    const agent = await loginAs(app, 'student');
    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.user.email).toBe(TEST_USERS.student.email);
    expect(me.body.user.role).toBe('student');
  });

  it('POST /api/auth/register-school provisions school + admin + 7-day trial', async () => {
    const email = `jest-signup-${Date.now()}@arvilio.test`;
    const schoolName = `Jest Signup ${Date.now()}`;
    let schoolId: string | undefined;
    try {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register-school')
        .send({ schoolName, email, password: 'TestPass123!' })
        .expect(201);

      const cookies = setCookieHeader(res);
      expect(cookies.some((c) => c.startsWith(`${ACCESS_COOKIE}=`))).toBe(true);
      expect(res.body.user.email).toBe(email);
      expect(res.body.user.role).toBe('admin');

      const membership = await prisma.schoolMembership.findFirst({
        where: { user: { email } },
        include: { school: { include: { subscription: true } } },
      });
      expect(membership?.role).toBe('ADMIN');
      expect(membership?.status).toBe('ACTIVE');
      expect(membership?.school.status).toBe('TRIAL');
      expect(membership?.school.subscription?.status).toBe('TRIALING');
      expect(membership?.school.subscription?.trialEndsAt).toBeTruthy();
      schoolId = membership?.schoolId;

      // the trial surfaces on the web session (drives the countdown banner)
      const session = await request(app.getHttpServer())
        .get('/api/auth/web-session')
        .set('Cookie', cookies)
        .expect(200);
      expect(session.body.trial).toBeTruthy();
      expect(session.body.trial.daysLeft).toBeGreaterThan(0);
      expect(session.body.trial.daysLeft).toBeLessThanOrEqual(7);

      // duplicate email is rejected
      await request(app.getHttpServer())
        .post('/api/auth/register-school')
        .send({ schoolName: 'Another', email, password: 'TestPass123!' })
        .expect(400);
    } finally {
      await prisma.user.deleteMany({ where: { email } });
      if (schoolId) await prisma.school.delete({ where: { id: schoolId } }).catch(() => undefined);
    }
  });

  it('POST /api/auth/register-school applies a promo code to extend the trial', async () => {
    const email = `jest-promo-${Date.now()}@arvilio.test`;
    const code = `JESTPROMO${Date.now()}`;
    let schoolId: string | undefined;
    const promo = await prisma.promoCode.create({
      data: { code, kind: 'TRIAL_EXTENSION', trialDays: 14, maxRedemptions: 5 },
    });
    try {
      await request(app.getHttpServer())
        .post('/api/auth/register-school')
        .send({ schoolName: `Promo School ${Date.now()}`, email, password: 'TestPass123!', promoCode: code.toLowerCase() })
        .expect(201);

      const membership = await prisma.schoolMembership.findFirst({
        where: { user: { email } },
        include: { school: { include: { subscription: true } } },
      });
      schoolId = membership?.schoolId;
      const trialEndsAt = membership?.school.subscription?.trialEndsAt;
      const days = (new Date(trialEndsAt as Date).getTime() - Date.now()) / 86_400_000;
      expect(Math.round(days)).toBe(14);

      const refreshed = await prisma.promoCode.findUnique({ where: { id: promo.id } });
      expect(refreshed?.redeemedCount).toBe(1);
      const redemption = await prisma.promoRedemption.findFirst({ where: { promoCodeId: promo.id } });
      expect(redemption?.schoolId).toBe(schoolId);
    } finally {
      await prisma.user.deleteMany({ where: { email } });
      if (schoolId) await prisma.school.delete({ where: { id: schoolId } }).catch(() => undefined);
      await prisma.promoCode.delete({ where: { id: promo.id } }).catch(() => undefined);
    }
  });

  it('onboarding wizard: admin saves steps + completes; student is forbidden', async () => {
    try {
      const admin = await loginAs(app, 'admin');

      const initial = await admin.get('/api/onboarding').expect(200);
      expect(initial.body).toEqual({ completed: false, currentStep: null, steps: {} });

      const afterStep = await admin
        .patch('/api/onboarding/step')
        .send({ step: 'profile', data: { name: 'Jest School' } })
        .expect(200);
      expect(afterStep.body.currentStep).toBe('profile');
      expect(afterStep.body.steps.profile).toEqual({ name: 'Jest School' });

      await admin.patch('/api/onboarding/step').send({ step: 'bogus' }).expect(400);

      const completed = await admin.post('/api/onboarding/complete').expect(201);
      expect(completed.body.completed).toBe(true);
      // step data persists through completion
      expect(completed.body.steps.profile).toEqual({ name: 'Jest School' });

      // student (non-admin) cannot write
      const student = await loginAs(app, 'student');
      await student.patch('/api/onboarding/step').send({ step: 'profile', data: {} }).expect(403);
    } finally {
      await prisma.school
        .update({ where: { id: 'school_default' }, data: { onboardingState: {} } })
        .catch(() => undefined);
    }
  });

  it('product tour: completes once per user and is idempotent', async () => {
    try {
      // Seeded users have tourCompletedAt set (E2E must not see first-login tour).
      await prisma.user.updateMany({
        where: { email: TEST_USERS.student.email },
        data: { tourCompletedAt: null },
      });

      const student = await loginAs(app, 'student');

      const initial = await student.get('/api/onboarding/tour').expect(200);
      expect(initial.body.completed).toBe(false);

      const done = await student.post('/api/onboarding/tour/complete').expect(201);
      expect(done.body.completed).toBe(true);
      const firstAt = done.body.completedAt;
      expect(firstAt).toBeTruthy();

      // idempotent: second complete keeps the first timestamp
      const again = await student.post('/api/onboarding/tour/complete').expect(201);
      expect(again.body.completedAt).toBe(firstAt);

      const after = await student.get('/api/onboarding/tour').expect(200);
      expect(after.body.completed).toBe(true);
    } finally {
      await prisma.user
        .updateMany({ where: { email: TEST_USERS.student.email }, data: { tourCompletedAt: null } })
        .catch(() => undefined);
    }
  });

  it('GET /api/billing/entitlements returns the school plan + usage meter', async () => {
    const admin = await loginAs(app, 'admin');
    const res = await admin.get('/api/billing/entitlements').expect(200);
    expect(typeof res.body.plan).toBe('string');
    expect(res.body.storage).toBeTruthy();
    expect(typeof res.body.storage.usedBytes).toBe('string');
    expect(typeof res.body.storage.quotaBytes).toBe('string');
    expect(res.body.storage.percentUsed).toBeGreaterThanOrEqual(0);
    expect(res.body.activeStudentCount).toBeGreaterThanOrEqual(0);
  });

  it('GET /api/auth/web-session returns anonymous without cookies', async () => {
    const webSession = await request(app.getHttpServer()).get('/api/auth/web-session').expect(200);

    expect(webSession.body.authenticated).toBe(false);
    expect(webSession.body.authStrategy).toBe('anonymous');
    expect(webSession.body.user).toBeNull();
    expect(webSession.headers['set-cookie']).toBeUndefined();
  });

  it('GET /api/auth/web-session resolves access-backed requests without rotating cookies', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_USERS.student.email, password: TEST_PASSWORD })
      .expect(201);
    const accessCookie = setCookieHeader(loginResponse).find((cookie) =>
      cookie.startsWith(`${ACCESS_COOKIE}=`),
    );
    expect(accessCookie).toBeTruthy();

    const webSession = await request(app.getHttpServer())
      .get('/api/auth/web-session')
      .set('Cookie', accessCookie ? [accessCookie] : [])
      .expect(200);

    expect(webSession.body.authenticated).toBe(true);
    expect(webSession.body.authStrategy).toBe('access');
    expect(webSession.body.user.email).toBe(TEST_USERS.student.email);
    expect(webSession.headers['set-cookie']).toBeUndefined();
  });

  it('GET /api/auth/web-session resolves refresh-backed requests without rotating cookies', async () => {
    const agent = await loginAs(app, 'student');
    const loginResponse = await agent.post('/api/auth/login').send({
      email: TEST_USERS.student.email,
      password: TEST_PASSWORD,
    });
    const cookies = setCookieHeader(loginResponse);
    const refreshCookie = cookies.find((cookie) => cookie.startsWith(`${REFRESH_COOKIE}=`));
    expect(refreshCookie).toBeTruthy();

    const webSession = await request(app.getHttpServer())
      .get('/api/auth/web-session')
      .set('Cookie', refreshCookie ? [refreshCookie] : [])
      .expect(200);

    expect(webSession.body.authenticated).toBe(true);
    expect(webSession.body.authStrategy).toBe('refresh');
    expect(webSession.body.scope).toBe('school');
    expect(webSession.body.availableScopes).toEqual(['school']);
    expect(webSession.body.user.email).toBe(TEST_USERS.student.email);
    expect(webSession.headers['set-cookie']).toBeUndefined();
  });

  it('GET /api/auth/web-session exposes platform scope for super-admin', async () => {
    const agent = await loginAs(app, 'superAdmin');
    const webSession = await agent.get('/api/auth/web-session').expect(200);

    expect(webSession.body.authenticated).toBe(true);
    expect(webSession.body.user.role).toBe('super_admin');
    expect(webSession.body.availableScopes).toEqual(['school', 'platform']);
  });

  it('POST /api/auth/refresh rotates session', async () => {
    const agent = await loginAs(app, 'student');
    const refreshed = await agent.post('/api/auth/refresh').expect(201);
    expect(refreshed.body.user.email).toBe(TEST_USERS.student.email);
    const cookies = setCookieHeader(refreshed);
    expect(cookies.some(c => c.startsWith(`${ACCESS_COOKIE}=`))).toBe(true);
  });

  it('POST /api/auth/logout clears session', async () => {
    const agent = await loginAs(app, 'student');
    await agent.post('/api/auth/logout').expect(201);
    await agent.get('/api/auth/me').expect(401);
  });

  it.each([
    ['PAUSED', 'account_paused'],
    ['LEAVED', 'account_leaved'],
    ['BLOCKED', 'account_blocked'],
  ] as const)(
    'POST /api/auth/login rejects %s accounts',
    async (status, code) => {
      await setUserStatus(prisma, TEST_USERS.student.email, status);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: TEST_USERS.student.email, password: TEST_PASSWORD })
        .expect(403);

      expect(response.body.code).toBe(code);
      expect(typeof response.body.message).toBe('string');
    },
  );

  it('GET /api/auth/web-session rejects blocked refresh-backed sessions', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_USERS.student.email, password: TEST_PASSWORD })
      .expect(201);
    const refreshCookie = setCookieHeader(loginResponse).find((cookie) =>
      cookie.startsWith(`${REFRESH_COOKIE}=`),
    );
    expect(refreshCookie).toBeTruthy();

    await setUserStatus(prisma, TEST_USERS.student.email, 'BLOCKED');

    const response = await request(app.getHttpServer())
      .get('/api/auth/web-session')
      .set('Cookie', refreshCookie ? [refreshCookie] : [])
      .expect(403);

    expect(response.body.code).toBe('account_blocked');
  });

  it('POST /api/auth/refresh rejects paused users and revokes the current token', async () => {
    const agent = await loginAs(app, 'student');
    await setUserStatus(prisma, TEST_USERS.student.email, 'PAUSED');

    const response = await agent.post('/api/auth/refresh').expect(403);

    expect(response.body.code).toBe('account_paused');
    await agent.post('/api/auth/refresh').expect(401);
  });

  it('POST /api/auth/forgot-password creates a reset token for password users', async () => {
    const user = await prisma.user.findUnique({
      where: { email: TEST_USERS.student.email },
      select: { id: true },
    });
    await prisma.passwordResetToken.deleteMany({ where: { userId: user!.id } });

    const res = await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ email: TEST_USERS.student.email })
      .expect(201);

    expect(res.body).toEqual({ ok: true });
    const token = await prisma.passwordResetToken.findFirst({ where: { userId: user!.id } });
    expect(token).toBeTruthy();
    expect(token?.usedAt).toBeNull();
  });

  it('POST /api/auth/reset-password accepts a valid token and updates the password', async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: TEST_USERS.student.email },
      select: { id: true },
    });
    const rawToken = 'known-reset-token';
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(rawToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({ token: rawToken, newPassword: 'NewPass456!' })
      .expect(201);

    const consumed = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashRefreshToken(rawToken) },
    });
    expect(consumed?.usedAt).toBeTruthy();

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_USERS.student.email, password: 'NewPass456!' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_USERS.student.email, password: TEST_PASSWORD })
      .expect(401);
  });
});
