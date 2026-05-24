/**
 * Seed integration / E2E test users into DATABASE_URL.
 *
 *   npx tsx scripts/seed-test-users.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { cleanupTestUsers, seedTestUsers, TEST_PASSWORD, TEST_USERS } from '../tests/integration/seed';

function buildPrisma(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ??
    'postgresql://soenglish:soenglish@localhost:5432/soenglish?schema=public';
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

async function main(): Promise<void> {
  const prisma = buildPrisma();
  try {
    await seedTestUsers(prisma);
    console.log('Seeded test users (password for all):', TEST_PASSWORD);
    for (const [key, user] of Object.entries(TEST_USERS)) {
      console.log(`  ${key}: ${user.email} (${user.role})`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
