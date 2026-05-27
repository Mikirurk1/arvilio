import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { PrismaService } from '@be/prisma';
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
      imports: [AuthModule],
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
