import * as bcrypt from 'bcryptjs';
import type { PrismaClient, UserRole } from '@prisma/client';

/** Shared test password for all seeded integration / E2E users. */
export const TEST_PASSWORD = 'TestPass123!';

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

  const teacher = await prisma.user.upsert({
    where: { email: TEST_USERS.teacher.email },
    create: {
      email: TEST_USERS.teacher.email,
      displayName: TEST_USERS.teacher.displayName,
      role: TEST_USERS.teacher.role,
      status: 'ACTIVE',
      passwordHash,
    },
    update: {
      displayName: TEST_USERS.teacher.displayName,
      role: TEST_USERS.teacher.role,
      status: 'ACTIVE',
      passwordHash,
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
      teacherId: teacher.id,
    },
    update: {
      displayName: TEST_USERS.student.displayName,
      role: TEST_USERS.student.role,
      status: 'ACTIVE',
      passwordHash,
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
    },
    update: {
      displayName: TEST_USERS.admin.displayName,
      role: TEST_USERS.admin.role,
      status: 'ACTIVE',
      passwordHash,
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
    },
    update: {
      displayName: TEST_USERS.superAdmin.displayName,
      role: TEST_USERS.superAdmin.role,
      status: 'ACTIVE',
      passwordHash,
    },
  });
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

  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}
