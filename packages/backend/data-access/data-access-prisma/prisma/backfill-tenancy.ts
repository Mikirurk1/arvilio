import { fileURLToPath } from 'node:url';
import type { PrismaClient } from '@prisma/client';
import { buildPrisma, loadDotenv } from './prisma-cli';

/**
 * Multi-tenancy backfill (ADR-005/006), idempotent.
 *
 * 1. Create the `school_default` tenant — the current SoEnglish school becomes
 *    tenant #1.
 * 2. Create one `SchoolMembership` per existing user (role mapped from the
 *    legacy `User.role`).
 * 3. Promote legacy SUPER_ADMINs to platform operators (`PLATFORM_ADMIN`).
 * 4. Give the default school an ACTIVE subscription stub.
 *
 * Safe to re-run: every write is an upsert keyed by a unique constraint.
 * NOTE: backfilling `schoolId` onto existing tenant *data* tables is a separate
 * step (added once those columns exist).
 */
export const DEFAULT_SCHOOL_ID = 'school_default';

type LegacyRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

function toMembershipRole(role: LegacyRole): 'STUDENT' | 'TEACHER' | 'ADMIN' {
  return role === 'SUPER_ADMIN' ? 'ADMIN' : role;
}

export async function backfillTenancy(prisma: PrismaClient): Promise<void> {
  await prisma.school.upsert({
    where: { id: DEFAULT_SCHOOL_ID },
    create: { id: DEFAULT_SCHOOL_ID, slug: 'default', name: 'SoEnglish', status: 'ACTIVE' },
    update: {},
  });

  await prisma.schoolSubscription.upsert({
    where: { schoolId: DEFAULT_SCHOOL_ID },
    create: { schoolId: DEFAULT_SCHOOL_ID, status: 'ACTIVE' },
    update: {},
  });

  const users = await prisma.user.findMany({ select: { id: true, role: true } });
  let memberships = 0;
  let operators = 0;

  for (const user of users) {
    const role = user.role as LegacyRole;
    await prisma.schoolMembership.upsert({
      where: { schoolId_userId: { schoolId: DEFAULT_SCHOOL_ID, userId: user.id } },
      create: {
        schoolId: DEFAULT_SCHOOL_ID,
        userId: user.id,
        role: toMembershipRole(role),
        status: 'ACTIVE',
      },
      update: { role: toMembershipRole(role) },
    });
    memberships += 1;

    if (role === 'SUPER_ADMIN') {
      await prisma.platformOperator.upsert({
        where: { userId: user.id },
        create: { userId: user.id, role: 'PLATFORM_ADMIN' },
        update: {},
      });
      operators += 1;
    }
  }

  console.log(
    `Tenancy backfill: school_default ready, ${memberships} memberships, ${operators} platform operators.`,
  );
}

async function main(): Promise<void> {
  loadDotenv();
  const prisma = buildPrisma();
  try {
    await backfillTenancy(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  void main();
}
