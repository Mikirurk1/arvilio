import * as bcrypt from 'bcryptjs';
import type { PrismaClient, UserRole } from '@prisma/client';

/** Shared test password for all seeded integration / E2E users. */
export const TEST_PASSWORD = 'TestPass123!';

/** Default (single) school tenant id — matches the tenancy backfill. */
const SCHOOL_DEFAULT_ID = 'school_default';

export const TEST_USERS = {
  student: {
    email: 'jest-student@soenglish.test',
    displayName: 'Jest Student',
    role: 'STUDENT' as UserRole,
  },
  teacher: {
    email: 'jest-teacher@soenglish.test',
    displayName: 'Jest Teacher',
    role: 'TEACHER' as UserRole,
  },
  admin: {
    email: 'jest-admin@soenglish.test',
    displayName: 'Jest Admin',
    role: 'ADMIN' as UserRole,
  },
  superAdmin: {
    email: 'jest-super-admin@soenglish.test',
    displayName: 'Jest Super Admin',
    role: 'SUPER_ADMIN' as UserRole,
  },
} as const;

export type TestUserKey = keyof typeof TEST_USERS;

/**
 * Upserts student, teacher, and admin users with password auth.
 * Links student.teacherId → teacher when both exist.
 */
export async function seedTestUsers(prisma: PrismaClient): Promise<void> {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  // Seeded users must not see the first-login product tour — it overlays pages
  // and intercepts clicks in E2E runs (see docs/e2e-improvements/09-responsive.md).
  const tourCompletedAt = new Date();

  const teacher = await prisma.user.upsert({
    where: { email: TEST_USERS.teacher.email },
    create: {
      email: TEST_USERS.teacher.email,
      displayName: TEST_USERS.teacher.displayName,
      role: TEST_USERS.teacher.role,
      status: 'ACTIVE',
      passwordHash,
      tourCompletedAt,
    },
    update: {
      displayName: TEST_USERS.teacher.displayName,
      role: TEST_USERS.teacher.role,
      status: 'ACTIVE',
      passwordHash,
      tourCompletedAt,
    },
  });

  await prisma.user.upsert({
    where: { email: TEST_USERS.student.email },
    create: {
      email: TEST_USERS.student.email,
      displayName: TEST_USERS.student.displayName,
      role: TEST_USERS.student.role,
      status: 'ACTIVE',
      passwordHash,
      tourCompletedAt,
      teacherId: teacher.id,
    },
    update: {
      displayName: TEST_USERS.student.displayName,
      role: TEST_USERS.student.role,
      status: 'ACTIVE',
      passwordHash,
      tourCompletedAt,
      teacherId: teacher.id,
    },
  });

  await prisma.user.upsert({
    where: { email: TEST_USERS.admin.email },
    create: {
      email: TEST_USERS.admin.email,
      displayName: TEST_USERS.admin.displayName,
      role: TEST_USERS.admin.role,
      status: 'ACTIVE',
      passwordHash,
      tourCompletedAt,
    },
    update: {
      displayName: TEST_USERS.admin.displayName,
      role: TEST_USERS.admin.role,
      status: 'ACTIVE',
      passwordHash,
      tourCompletedAt,
    },
  });

  await prisma.user.upsert({
    where: { email: TEST_USERS.superAdmin.email },
    create: {
      email: TEST_USERS.superAdmin.email,
      displayName: TEST_USERS.superAdmin.displayName,
      role: TEST_USERS.superAdmin.role,
      status: 'ACTIVE',
      passwordHash,
      tourCompletedAt,
    },
    update: {
      displayName: TEST_USERS.superAdmin.displayName,
      role: TEST_USERS.superAdmin.role,
      status: 'ACTIVE',
      passwordHash,
      tourCompletedAt,
    },
  });

  // Multi-tenancy: every seeded user needs an ACTIVE membership so the auth
  // guard can establish a tenant context (schoolId) — otherwise tenant-scoped
  // queries fail loud. Mirror production, where the tenancy backfill linked all
  // users to the default school.
  await prisma.school.upsert({
    where: { id: SCHOOL_DEFAULT_ID },
    create: { id: SCHOOL_DEFAULT_ID, slug: SCHOOL_DEFAULT_ID, name: 'Default School', status: 'ACTIVE' },
    update: {},
  });
  const seeded = await prisma.user.findMany({
    where: { email: { in: Object.values(TEST_USERS).map((u) => u.email) } },
    select: { id: true, role: true },
  });
  for (const user of seeded) {
    const membershipRole = user.role === 'STUDENT' ? 'STUDENT' : user.role === 'TEACHER' ? 'TEACHER' : 'ADMIN';
    await prisma.schoolMembership.upsert({
      where: { schoolId_userId: { schoolId: SCHOOL_DEFAULT_ID, userId: user.id } },
      create: { schoolId: SCHOOL_DEFAULT_ID, userId: user.id, role: membershipRole, status: 'ACTIVE' },
      update: { role: membershipRole, status: 'ACTIVE' },
    });
    // Platform-operator axis (ADR-008): super-admin → PLATFORM_ADMIN.
    if (user.role === 'SUPER_ADMIN') {
      await prisma.platformOperator.upsert({
        where: { userId: user.id },
        create: { userId: user.id, role: 'PLATFORM_ADMIN' },
        update: { role: 'PLATFORM_ADMIN' },
      });
    }
  }

  await seedTestFixtures(prisma);
}

/**
 * Domain fixtures for E2E audits (plan Etap 0): lessons in all three statuses,
 * a staff compensation profile, and a spread of vocabulary cards. Idempotent —
 * keyed by title / unique constraints so repeat runs don't duplicate rows.
 */
async function seedTestFixtures(prisma: PrismaClient): Promise<void> {
  const teacher = await prisma.user.findUnique({ where: { email: TEST_USERS.teacher.email }, select: { id: true } });
  const student = await prisma.user.findUnique({ where: { email: TEST_USERS.student.email }, select: { id: true } });
  if (!teacher || !student) return;

  // ≥1 planned + completed + cancelled lesson (no natural unique key — match by title)
  const today = new Date();
  const isoDate = (offsetDays: number) => {
    const d = new Date(today.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  };
  const lessons = [
    { title: 'Seed lesson — planned', date: isoDate(2), status: 'PLANNED' as const },
    { title: 'Seed lesson — completed', date: isoDate(-2), status: 'COMPLETED' as const },
    { title: 'Seed lesson — cancelled', date: isoDate(-1), status: 'CANCELLED' as const },
  ];
  for (const lesson of lessons) {
    const existing = await prisma.scheduledLesson.findFirst({
      where: { title: lesson.title, teacherId: teacher.id, studentId: student.id },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.scheduledLesson.create({
      data: {
        schoolId: SCHOOL_DEFAULT_ID,
        title: lesson.title,
        date: lesson.date,
        startTime: '10:00',
        endTime: '10:55',
        duration: 55,
        teacherId: teacher.id,
        studentId: student.id,
        status: lesson.status,
        ...(lesson.status === 'CANCELLED' ? { cancelReason: 'STUDENT_ABSENT' as const } : {}),
      },
    });
  }

  // Staff compensation for the teacher (unblocks /staff profile audits)
  await prisma.staffCompensationProfile.upsert({
    where: { userId: teacher.id },
    create: {
      userId: teacher.id,
      schoolId: SCHOOL_DEFAULT_ID,
      mode: 'PER_LESSON',
      perLessonRateMinor: 50000,
      currency: 'UAH',
      payFrequency: 'MONTHLY',
    },
    update: {},
  });

  // 10+ vocabulary cards across all statuses
  const statuses = ['NEW', 'NEW', 'NEW', 'REPEATED', 'REPEATED', 'REPEATED', 'MISTAKES_WORK', 'MISTAKES_WORK', 'LEARNED', 'LEARNED'] as const;
  for (let i = 0; i < statuses.length; i++) {
    const text = `seed word ${i + 1}`;
    const word = await prisma.word.upsert({
      where: { normalizedText: text },
      create: { text, normalizedText: text, definition: `Definition of ${text}` },
      update: {},
    });
    const card = await prisma.studentWordCard.findFirst({
      where: { userId: student.id, wordId: word.id },
      select: { id: true },
    });
    if (!card) {
      await prisma.studentWordCard.create({
        data: { userId: student.id, schoolId: SCHOOL_DEFAULT_ID, wordId: word.id, status: statuses[i]! },
      });
    }
  }
}

/** Removes seeded users and dependent rows created during integration runs. */
export async function cleanupTestUsers(prisma: PrismaClient): Promise<void> {
  const emails = Object.values(TEST_USERS).map((u) => u.email);
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length === 0) return;

  await prisma.user.updateMany({
    where: { teacherId: { in: ids } },
    data: { teacherId: null },
  });

  const participantRows = await prisma.chatParticipant.findMany({
    where: { userId: { in: ids } },
    select: { conversationId: true },
  });
  const conversationIds = [...new Set(participantRows.map((row) => row.conversationId))];
  await prisma.chatConversation.deleteMany({
    where: {
      OR: [{ createdById: { in: ids } }, { id: { in: conversationIds } }],
    },
  });

  await prisma.scheduledLesson.deleteMany({
    where: { OR: [{ teacherId: { in: ids } }, { studentId: { in: ids } }] },
  });

  const ownedQuizIds = (
    await prisma.quiz.findMany({ where: { ownerId: { in: ids } }, select: { id: true } })
  ).map((q) => q.id);
  if (ownedQuizIds.length > 0) {
    await prisma.quizAssignment.deleteMany({ where: { quizId: { in: ownedQuizIds } } });
    await prisma.quizAttempt.deleteMany({ where: { quizId: { in: ownedQuizIds } } });
    await prisma.quiz.deleteMany({ where: { id: { in: ownedQuizIds } } });
  }
  await prisma.quizAssignment.deleteMany({
    where: { OR: [{ studentId: { in: ids } }, { assignedById: { in: ids } }] },
  });
  await prisma.quizAttempt.deleteMany({ where: { studentId: { in: ids } } });

  await prisma.studentWordCard.deleteMany({ where: { userId: { in: ids } } });
  await prisma.authRefreshToken.deleteMany({ where: { userId: { in: ids } } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: { in: ids } } });
  await prisma.oAuthAccount.deleteMany({ where: { userId: { in: ids } } });
  await prisma.practiceSession.deleteMany({ where: { userId: { in: ids } } });
  await prisma.dailyGoalCompletion.deleteMany({ where: { userId: { in: ids } } });
  await prisma.notificationDelivery.deleteMany({ where: { userId: { in: ids } } });
  await prisma.teacherMessage.deleteMany({
    where: { OR: [{ teacherId: { in: ids } }, { studentId: { in: ids } }] },
  });
  await prisma.telegramLinkToken.deleteMany({ where: { userId: { in: ids } } });
  await prisma.googleCalendarConnection.deleteMany({ where: { userId: { in: ids } } });
  await prisma.progress.deleteMany({ where: { userId: { in: ids } } });
  await prisma.reviewQueue.deleteMany({ where: { userId: { in: ids } } });
  await prisma.studentLearningLanguage.deleteMany({ where: { userId: { in: ids } } });
  await prisma.schoolMembership.deleteMany({ where: { userId: { in: ids } } });

  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}
