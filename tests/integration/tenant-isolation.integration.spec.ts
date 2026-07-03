import { Test } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { TenantModule, TenantContextService } from '@be/tenant';
import { PrismaModule, PrismaService, TenantPrismaService } from '@be/prisma';

/**
 * Gate 1 (core mechanism) — proves tenant isolation end-to-end against the real
 * database: CLS context → TenantContextService → Prisma `$extends` → scopeArgs.
 * Uses `SchoolMembership` (a registered tenant-scoped model).
 */
describe('Tenant isolation (TenantPrismaService)', () => {
  let prisma: PrismaService;
  let tenant: TenantPrismaService;
  let cls: ClsService;
  let ctx: TenantContextService;

  const SUFFIX = `iso_${Date.now()}`;
  const schoolA = `${SUFFIX}_a`;
  const schoolB = `${SUFFIX}_b`;
  const userA1 = `${SUFFIX}_ua1`;
  const userA2 = `${SUFFIX}_ua2`;
  const userB1 = `${SUFFIX}_ub1`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TenantModule, PrismaModule],
    }).compile();
    await moduleRef.init();
    prisma = moduleRef.get(PrismaService);
    tenant = moduleRef.get(TenantPrismaService);
    cls = moduleRef.get(ClsService);
    ctx = moduleRef.get(TenantContextService);

    await prisma.school.createMany({
      data: [
        { id: schoolA, slug: schoolA, name: 'A', status: 'ACTIVE' },
        { id: schoolB, slug: schoolB, name: 'B', status: 'ACTIVE' },
      ],
    });
    for (const id of [userA1, userA2, userB1]) {
      await prisma.user.create({
        data: { id, email: `${id}@example.test`, displayName: id },
      });
    }
    await prisma.schoolMembership.createMany({
      data: [
        { schoolId: schoolA, userId: userA1, role: 'TEACHER' },
        { schoolId: schoolA, userId: userA2, role: 'STUDENT' },
        { schoolId: schoolB, userId: userB1, role: 'STUDENT' },
      ],
    });
  });

  afterAll(async () => {
    await prisma.school.deleteMany({ where: { id: { in: [schoolA, schoolB] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA1, userA2, userB1] } } });
    await prisma.$disconnect();
  });

  const ourMembers = { userId: { in: [userA1, userA2, userB1] } };

  // Await INSIDE cls.run so the lazy Prisma query executes within the ALS context.
  const inSchool = <T>(schoolId: string, fn: () => Promise<T>): Promise<T> =>
    cls.run(async () => {
      ctx.setSchoolId(schoolId);
      return await fn();
    });

  it('returns only the active school’s rows', async () => {
    const rows = await inSchool(schoolA, () =>
      tenant.client.schoolMembership.findMany({ where: ourMembers }),
    );
    expect(rows).toHaveLength(2);
    expect(rows.every((r: { schoolId: string }) => r.schoolId === schoolA)).toBe(true);
  });

  it('school B cannot see school A’s rows', async () => {
    const rows = await inSchool(schoolB, () =>
      tenant.client.schoolMembership.findMany({ where: ourMembers }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].schoolId).toBe(schoolB);
  });

  it('stamps the active schoolId into created rows', async () => {
    const created = await inSchool(schoolA, () =>
      tenant.client.schoolMembership.create({
        data: { userId: userB1, role: 'STUDENT' } as never,
      }),
    );
    expect(created.schoolId).toBe(schoolA);
    await prisma.schoolMembership.delete({ where: { id: created.id } });
  });

  it('asPlatform() bypasses scoping (sees both schools)', async () => {
    const rows = await tenant.asPlatform(() =>
      tenant.client.schoolMembership.findMany({ where: ourMembers }),
    );
    const schoolIds = new Set(rows.map((r: { schoolId: string }) => r.schoolId));
    expect(schoolIds.has(schoolA)).toBe(true);
    expect(schoolIds.has(schoolB)).toBe(true);
  });

  it('fails loud when no tenant is active (no platform bypass)', async () => {
    await expect(
      cls.run(() => tenant.client.schoolMembership.findMany()),
    ).rejects.toThrow('without an active schoolId');
  });

  // Legacy data table rolled onto schoolId (first vertical).
  it('scopes a legacy data model (LibraryMaterial) by tenant', async () => {
    const matA = await inSchool(schoolA, () =>
      tenant.client.libraryMaterial.create({
        data: { title: 'A-mat', kind: 'OTHER', createdById: userA1 } as never,
      }),
    );
    const matB = await inSchool(schoolB, () =>
      tenant.client.libraryMaterial.create({
        data: { title: 'B-mat', kind: 'OTHER', createdById: userB1 } as never,
      }),
    );
    expect(matA.schoolId).toBe(schoolA);
    expect(matB.schoolId).toBe(schoolB);

    const seenByA = await inSchool(schoolA, () =>
      tenant.client.libraryMaterial.findMany({ where: { id: { in: [matA.id, matB.id] } } }),
    );
    expect(seenByA).toHaveLength(1);
    expect(seenByA[0].id).toBe(matA.id);

    await prisma.libraryMaterial.deleteMany({ where: { id: { in: [matA.id, matB.id] } } });
  });

  it('scopes unique ops (findUnique/update/delete) cross-tenant on LibraryMaterial', async () => {
    const matA = await inSchool(schoolA, () =>
      tenant.client.libraryMaterial.create({
        data: { title: 'uA', kind: 'OTHER', createdById: userA1 } as never,
      }),
    );
    const matB = await inSchool(schoolB, () =>
      tenant.client.libraryMaterial.create({
        data: { title: 'uB', kind: 'OTHER', createdById: userB1 } as never,
      }),
    );

    // findUnique for another school's row must return null (scoped where).
    const crossRead = await inSchool(schoolA, () =>
      tenant.client.libraryMaterial.findUnique({ where: { id: matB.id } }),
    );
    expect(crossRead).toBeNull();
    const ownRead = await inSchool(schoolA, () =>
      tenant.client.libraryMaterial.findUnique({ where: { id: matA.id } }),
    );
    expect(ownRead?.id).toBe(matA.id);

    // update of another school's row must affect zero rows (P2025).
    await expect(
      inSchool(schoolA, () =>
        tenant.client.libraryMaterial.update({
          where: { id: matB.id },
          data: { title: 'hacked' },
        }),
      ),
    ).rejects.toThrow();
    const stillB = await prisma.libraryMaterial.findUnique({ where: { id: matB.id } });
    expect(stillB?.title).toBe('uB');

    // delete of another school's row must not remove it.
    await expect(
      inSchool(schoolA, () =>
        tenant.client.libraryMaterial.delete({ where: { id: matB.id } }),
      ),
    ).rejects.toThrow();
    const survivedB = await prisma.libraryMaterial.findUnique({ where: { id: matB.id } });
    expect(survivedB?.id).toBe(matB.id);

    await prisma.libraryMaterial.deleteMany({ where: { id: { in: [matA.id, matB.id] } } });
  });

  it('scopes core ScheduledLesson by tenant', async () => {
    const lessonData = (title: string) => ({
      title,
      date: '2030-01-01',
      startTime: '10:00',
      endTime: '10:55',
      duration: 55,
    });
    const lesA = await inSchool(schoolA, () =>
      tenant.client.scheduledLesson.create({
        data: { ...lessonData('A'), teacherId: userA1, studentId: userA2 } as never,
      }),
    );
    const lesB = await inSchool(schoolB, () =>
      tenant.client.scheduledLesson.create({
        data: { ...lessonData('B'), teacherId: userB1, studentId: userB1 } as never,
      }),
    );
    expect(lesA.schoolId).toBe(schoolA);

    const seenByA = await inSchool(schoolA, () =>
      tenant.client.scheduledLesson.findMany({ where: { id: { in: [lesA.id, lesB.id] } } }),
    );
    expect(seenByA.map((l: { id: string }) => l.id)).toEqual([lesA.id]);

    await prisma.scheduledLesson.deleteMany({ where: { id: { in: [lesA.id, lesB.id] } } });
  });

  it('scopes Quiz by tenant', async () => {
    const qA = await inSchool(schoolA, () =>
      tenant.client.quiz.create({ data: { title: 'qA', category: 'X', ownerId: userA1 } as never }),
    );
    const qB = await inSchool(schoolB, () =>
      tenant.client.quiz.create({ data: { title: 'qB', category: 'X', ownerId: userB1 } as never }),
    );
    expect(qA.schoolId).toBe(schoolA);
    const seenByB = await inSchool(schoolB, () =>
      tenant.client.quiz.findMany({ where: { id: { in: [qA.id, qB.id] } } }),
    );
    expect(seenByB.map((q: { id: string }) => q.id)).toEqual([qB.id]);
    await prisma.quiz.deleteMany({ where: { id: { in: [qA.id, qB.id] } } });
  });

  it('scopes SpeakingTopic by tenant', async () => {
    const sA = await inSchool(schoolA, () =>
      tenant.client.speakingTopic.create({ data: { title: 's', prompt: 'p', ownerId: userA1 } as never }),
    );
    const sB = await inSchool(schoolB, () =>
      tenant.client.speakingTopic.create({ data: { title: 's', prompt: 'p', ownerId: userB1 } as never }),
    );
    expect(sA.schoolId).toBe(schoolA);
    const seenByA = await inSchool(schoolA, () =>
      tenant.client.speakingTopic.findMany({ where: { id: { in: [sA.id, sB.id] } } }),
    );
    expect(seenByA.map((s: { id: string }) => s.id)).toEqual([sA.id]);
    await prisma.speakingTopic.deleteMany({ where: { id: { in: [sA.id, sB.id] } } });
  });

  it('scopes ChatConversation by tenant', async () => {
    const cA = await inSchool(schoolA, () =>
      tenant.client.chatConversation.create({ data: { type: 'GROUP', title: 'g', createdById: userA1 } as never }),
    );
    const cB = await inSchool(schoolB, () =>
      tenant.client.chatConversation.create({ data: { type: 'GROUP', title: 'g', createdById: userB1 } as never }),
    );
    expect(cA.schoolId).toBe(schoolA);
    const seenByB = await inSchool(schoolB, () =>
      tenant.client.chatConversation.findMany({ where: { id: { in: [cA.id, cB.id] } } }),
    );
    expect(seenByB.map((c: { id: string }) => c.id)).toEqual([cB.id]);
    await prisma.chatConversation.deleteMany({ where: { id: { in: [cA.id, cB.id] } } });
  });

  it('scopes Payment by tenant (financial vertical)', async () => {
    const pA = await inSchool(schoolA, () =>
      tenant.client.payment.create({
        data: { userId: userA1, method: 'STRIPE', amountMinor: 1000, currency: 'UAH' } as never,
      }),
    );
    const pB = await inSchool(schoolB, () =>
      tenant.client.payment.create({
        data: { userId: userB1, method: 'STRIPE', amountMinor: 2000, currency: 'UAH' } as never,
      }),
    );
    expect(pA.schoolId).toBe(schoolA);
    const seenByA = await inSchool(schoolA, () =>
      tenant.client.payment.findMany({ where: { id: { in: [pA.id, pB.id] } } }),
    );
    expect(seenByA.map((p: { id: string }) => p.id)).toEqual([pA.id]);
    await prisma.payment.deleteMany({ where: { id: { in: [pA.id, pB.id] } } });
  });

  it('scopes StudentGroup by tenant', async () => {
    const gA = await inSchool(schoolA, () =>
      tenant.client.studentGroup.create({ data: { name: 'gA', teacherId: userA1 } as never }),
    );
    const gB = await inSchool(schoolB, () =>
      tenant.client.studentGroup.create({ data: { name: 'gB', teacherId: userB1 } as never }),
    );
    expect(gA.schoolId).toBe(schoolA);
    const seenByA = await inSchool(schoolA, () =>
      tenant.client.studentGroup.findMany({ where: { id: { in: [gA.id, gB.id] } } }),
    );
    expect(seenByA.map((g: { id: string }) => g.id)).toEqual([gA.id]);
    await prisma.studentGroup.deleteMany({ where: { id: { in: [gA.id, gB.id] } } });
  });

  it('scopes PracticeSession by tenant (learner data)', async () => {
    const session = (uid: string) => ({
      userId: uid,
      kind: 'VOCABULARY',
      startedAt: new Date('2030-01-01T10:00:00Z'),
      endedAt: new Date('2030-01-01T10:05:00Z'),
      durationSec: 300,
    });
    const psA = await inSchool(schoolA, () =>
      tenant.client.practiceSession.create({ data: session(userA1) as never }),
    );
    const psB = await inSchool(schoolB, () =>
      tenant.client.practiceSession.create({ data: session(userB1) as never }),
    );
    expect(psA.schoolId).toBe(schoolA);
    const seenByA = await inSchool(schoolA, () =>
      tenant.client.practiceSession.findMany({ where: { id: { in: [psA.id, psB.id] } } }),
    );
    expect(seenByA.map((p: { id: string }) => p.id)).toEqual([psA.id]);
    await prisma.practiceSession.deleteMany({ where: { id: { in: [psA.id, psB.id] } } });
  });

  it('scopes StaffPayout by tenant', async () => {
    const payout = (uid: string) => ({
      userId: uid,
      amountMinor: 1000,
      currency: 'UAH',
      paidAt: new Date('2030-01-01T00:00:00Z'),
      createdByUserId: uid,
    });
    const spA = await inSchool(schoolA, () =>
      tenant.client.staffPayout.create({ data: payout(userA1) as never }),
    );
    const spB = await inSchool(schoolB, () =>
      tenant.client.staffPayout.create({ data: payout(userB1) as never }),
    );
    expect(spA.schoolId).toBe(schoolA);
    const seenByB = await inSchool(schoolB, () =>
      tenant.client.staffPayout.findMany({ where: { id: { in: [spA.id, spB.id] } } }),
    );
    expect(seenByB.map((p: { id: string }) => p.id)).toEqual([spB.id]);
    await prisma.staffPayout.deleteMany({ where: { id: { in: [spA.id, spB.id] } } });
  });

  it('scopes TeacherMessage by tenant (child/leaf)', async () => {
    const tmA = await inSchool(schoolA, () =>
      tenant.client.teacherMessage.create({
        data: { teacherId: userA1, studentId: userA2, body: 'hi A' } as never,
      }),
    );
    const tmB = await inSchool(schoolB, () =>
      tenant.client.teacherMessage.create({
        data: { teacherId: userB1, studentId: userB1, body: 'hi B' } as never,
      }),
    );
    expect(tmA.schoolId).toBe(schoolA);
    const seenByA = await inSchool(schoolA, () =>
      tenant.client.teacherMessage.findMany({ where: { id: { in: [tmA.id, tmB.id] } } }),
    );
    expect(seenByA.map((m: { id: string }) => m.id)).toEqual([tmA.id]);
    await prisma.teacherMessage.deleteMany({ where: { id: { in: [tmA.id, tmB.id] } } });
  });

  it('scopes NotificationDelivery by tenant (child/leaf)', async () => {
    const ndA = await inSchool(schoolA, () =>
      tenant.client.notificationDelivery.create({
        data: { userId: userA1, kind: 'LESSON_REMINDER', dedupeKey: 'k1' } as never,
      }),
    );
    const ndB = await inSchool(schoolB, () =>
      tenant.client.notificationDelivery.create({
        data: { userId: userB1, kind: 'LESSON_REMINDER', dedupeKey: 'k2' } as never,
      }),
    );
    expect(ndA.schoolId).toBe(schoolA);
    const seenByB = await inSchool(schoolB, () =>
      tenant.client.notificationDelivery.findMany({ where: { id: { in: [ndA.id, ndB.id] } } }),
    );
    expect(seenByB.map((n: { id: string }) => n.id)).toEqual([ndB.id]);
    await prisma.notificationDelivery.deleteMany({ where: { id: { in: [ndA.id, ndB.id] } } });
  });
});
