import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { PrismaService } from '@be/prisma';
import { AuthModule, ACCESS_COOKIE, REFRESH_COOKIE } from '@be/auth';
import {
  cleanupTestUsers,
  seedTestUsers,
  TEST_PASSWORD,
  TEST_USERS,
} from '@tests/integration/seed';
import { loginAs } from '@tests/integration/helpers';

function setCookieHeader(res: { headers: Record<string, unknown> }): string[] {
  const raw = res.headers['set-cookie'];
  if (!raw) return [];
  return Array.isArray(raw) ? raw.map(String) : [String(raw)];
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
});
