import type { INestApplication } from '@nestjs/common';
import {
  createIntegrationApp,
  closeIntegrationApp,
  type IntegrationContext,
} from '@tests/integration/bootstrap';
import { cleanupTestUsers } from '@tests/integration/seed';
import { loginAs } from '@tests/integration/helpers';
import { TrialLifecycleService, TRIAL_GRACE_DAYS, DUNNING_GRACE_DAYS } from '@be/platform-admin';

/**
 * Phase 4B + Gate 4 (read surface): a platform operator (super-admin seeded with
 * PlatformOperator) can read the cross-tenant console; non-operators are 403.
 */
describe('Platform admin console (integration)', () => {
  let ctx: IntegrationContext;
  let app: INestApplication;

  beforeAll(async () => {
    ctx = await createIntegrationApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await cleanupTestUsers(ctx.prisma);
    await closeIntegrationApp(ctx);
  });

  it('lets a platform operator read the dashboard', async () => {
    const agent = await loginAs(app, 'superAdmin');
    const res = await agent.get('/api/platform/dashboard').expect(200);
    expect(res.body.schoolCount).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.totalStorageUsedBytes).toBe('string');
    expect(res.body.activeUserCount).toBeGreaterThanOrEqual(1);
  });

  it('lets a platform operator list schools (cross-tenant)', async () => {
    const agent = await loginAs(app, 'superAdmin');
    const res = await agent.get('/api/platform/schools').expect(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.some((s: { id: string }) => s.id === 'school_default')).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(typeof res.body.hasMore).toBe('boolean');
  });

  it('lists global users and school members with pagination', async () => {
    const agent = await loginAs(app, 'superAdmin');
    const users = await agent.get('/api/platform/users?limit=10').expect(200);
    expect(Array.isArray(users.body.items)).toBe(true);
    expect(users.body.total).toBeGreaterThanOrEqual(1);

    const stats = await agent.get('/api/platform/users/stats').expect(200);
    expect(stats.body.totalUsers).toBeGreaterThanOrEqual(1);

    const members = await agent
      .get('/api/platform/schools/school_default/members?limit=10')
      .expect(200);
    expect(Array.isArray(members.body.items)).toBe(true);
    expect(members.body.total).toBeGreaterThanOrEqual(1);

    const detail = await agent.get('/api/platform/schools/school_default').expect(200);
    expect(detail.body.owner === null || typeof detail.body.owner?.email === 'string').toBe(true);
    expect(Array.isArray(detail.body.admins)).toBe(true);
  });

  it('rejects a non-operator (student) with 403', async () => {
    const agent = await loginAs(app, 'student');
    await agent.get('/api/platform/dashboard').expect(403);
    await agent.get('/api/platform/schools').expect(403);
  });

  it('rejects an unauthenticated request with 401', async () => {
    const request = (await import('supertest')).default;
    await request(app.getHttpServer()).get('/api/platform/dashboard').expect(401);
  });

  it('impersonates a school admin (banner claim + audit) and stops cleanly', async () => {
    const agent = await loginAs(app, 'superAdmin');

    const started = await agent.post('/api/platform/schools/school_default/impersonate').expect(201);
    expect(started.body.targetUserId).toBeTruthy();
    expect(started.body.expiresInSeconds).toBe(60 * 15);

    // While impersonating, the access cookie authenticates as the school user and
    // the web session carries the banner claim.
    const impersonated = await agent.get('/api/auth/web-session').expect(200);
    expect(impersonated.body.impersonation).toEqual({
      actorUserId: expect.any(String),
      schoolId: 'school_default',
    });
    expect(impersonated.body.user.id).toBe(started.body.targetUserId);

    // The impersonation start is recorded in the audit log.
    const log = await (await loginAs(app, 'superAdmin'))
      .get('/api/platform/audit-log?schoolId=school_default')
      .expect(200);
    expect(log.body.items.map((e: { action: string }) => e.action)).toContain('school.impersonate');

    // Stopping returns to the operator's own session.
    await agent.post('/api/auth/impersonate/stop').expect(201);
    const restored = await agent.get('/api/auth/web-session').expect(200);
    expect(restored.body.impersonation).toBeNull();
    expect(restored.body.availableScopes).toContain('platform');
  });

  it('reads + updates the platform payment-method allowlist (operator only)', async () => {
    const admin = await loginAs(app, 'superAdmin');

    const initial = await admin.get('/api/platform/payment-methods').expect(200);
    expect(Array.isArray(initial.body.allowed)).toBe(true);
    expect(initial.body.allMethods).toEqual(expect.arrayContaining(['STRIPE', 'MANUAL_INVOICE']));

    try {
      const updated = await admin
        .put('/api/platform/payment-methods')
        .send({ allowed: ['STRIPE', 'MANUAL_INVOICE'] })
        .expect(200);
      expect(updated.body.allowed).toEqual(['STRIPE', 'MANUAL_INVOICE']);

      // unknown method → 400
      await admin.put('/api/platform/payment-methods').send({ allowed: ['BITCOIN'] }).expect(400);

      // non-operator is rejected
      const student = await loginAs(app, 'student');
      await student.get('/api/platform/payment-methods').expect(403);
    } finally {
      // restore no-restriction default
      await admin.put('/api/platform/payment-methods').send({ allowed: [] });
    }
  });

  it('trial lifecycle: suspends a lapsed trial, leaves an in-grace trial alone', async () => {
    const lapsedId = `jest_trial_lapsed_${Date.now()}`;
    const graceId = `jest_trial_grace_${Date.now()}`;
    const dayMs = 24 * 60 * 60 * 1000;
    try {
      // Lapsed: trial ended well past the grace window.
      await ctx.prisma.school.create({
        data: {
          id: lapsedId,
          slug: lapsedId,
          name: 'Lapsed',
          status: 'TRIAL',
          subscription: {
            create: {
              status: 'TRIALING',
              trialEndsAt: new Date(Date.now() - (TRIAL_GRACE_DAYS + 2) * dayMs),
            },
          },
        },
      });
      // In grace: trial ended yesterday, still within the grace window.
      await ctx.prisma.school.create({
        data: {
          id: graceId,
          slug: graceId,
          name: 'Grace',
          status: 'TRIAL',
          subscription: { create: { status: 'TRIALING', trialEndsAt: new Date(Date.now() - dayMs) } },
        },
      });

      const service = ctx.app.get(TrialLifecycleService);
      const result = await service.expireTrials();

      expect(result.schoolIds).toContain(lapsedId);
      expect(result.schoolIds).not.toContain(graceId);
      expect((await ctx.prisma.school.findUnique({ where: { id: lapsedId } }))?.status).toBe(
        'SUSPENDED',
      );
      expect((await ctx.prisma.school.findUnique({ where: { id: graceId } }))?.status).toBe('TRIAL');
    } finally {
      await ctx.prisma.school.deleteMany({ where: { id: { in: [lapsedId, graceId] } } });
    }
  });

  it('dunning: suspends an ACTIVE school PAST_DUE beyond the grace window', async () => {
    const overdueId = `jest_dunning_${Date.now()}`;
    const freshId = `jest_dunning_fresh_${Date.now()}`;
    const dayMs = 24 * 60 * 60 * 1000;
    try {
      await ctx.prisma.school.create({
        data: {
          id: overdueId,
          slug: overdueId,
          name: 'Overdue',
          status: 'ACTIVE',
          subscription: { create: { status: 'PAST_DUE' } },
        },
      });
      // Backdate the PAST_DUE timestamp past the grace window. Raw SQL because
      // Prisma's `@updatedAt` ignores manual values on a normal update.
      await ctx.prisma.$executeRawUnsafe(
        'UPDATE "SchoolSubscription" SET "updatedAt" = $1 WHERE "schoolId" = $2',
        new Date(Date.now() - (DUNNING_GRACE_DAYS + 1) * dayMs),
        overdueId,
      );
      // Recently past due — still in grace.
      await ctx.prisma.school.create({
        data: {
          id: freshId,
          slug: freshId,
          name: 'Fresh',
          status: 'ACTIVE',
          subscription: { create: { status: 'PAST_DUE' } },
        },
      });

      const result = await ctx.app.get(TrialLifecycleService).suspendOverdueSubscriptions();

      expect(result.schoolIds).toContain(overdueId);
      expect(result.schoolIds).not.toContain(freshId);
      expect((await ctx.prisma.school.findUnique({ where: { id: overdueId } }))?.status).toBe(
        'SUSPENDED',
      );
      expect((await ctx.prisma.school.findUnique({ where: { id: freshId } }))?.status).toBe('ACTIVE');
    } finally {
      await ctx.prisma.school.deleteMany({ where: { id: { in: [overdueId, freshId] } } });
    }
  });

  it('suspends + activates a school and records both in the audit log', async () => {
    const id = `jest_plat_${Date.now()}`;
    await ctx.prisma.school.create({ data: { id, slug: id, name: 'Jest Plat', status: 'ACTIVE' } });
    try {
      const agent = await loginAs(app, 'superAdmin');

      const suspended = await agent.post(`/api/platform/schools/${id}/suspend`).expect(201);
      expect(suspended.body.status).toBe('SUSPENDED');

      const activated = await agent.post(`/api/platform/schools/${id}/activate`).expect(201);
      expect(activated.body.status).toBe('ACTIVE');

      const log = await agent.get(`/api/platform/audit-log?schoolId=${id}`).expect(200);
      const actions = log.body.items.map((e: { action: string }) => e.action);
      expect(actions).toEqual(expect.arrayContaining(['school.suspend', 'school.activate']));
      expect(log.body.items[0].actorName).toBeTruthy();
    } finally {
      await ctx.prisma.platformAuditLog.deleteMany({ where: { targetSchoolId: id } });
      await ctx.prisma.school.delete({ where: { id } }).catch(() => undefined);
    }
  });
});
