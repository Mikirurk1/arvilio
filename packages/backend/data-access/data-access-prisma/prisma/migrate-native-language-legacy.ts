/**
 * Preserves User.nativeLanguage (legacy string column) across schema push.
 *
 * 1. BEFORE `prisma db push` (while old column still exists):
 *    npm run prisma:migrate:native-language -- stash
 *
 * 2. Run `npx prisma db push` and confirm (y).
 *
 * 3. Seed languages, then restore:
 *    npm run prisma:seed:languages
 *    npm run prisma:migrate:native-language -- restore
 *
 * 4. Optional: npm run prisma:backfill:languages-words
 */
import type { PrismaClient } from '@prisma/client';
import { buildPrisma, loadDotenv } from './prisma-cli';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const STASH_PATH = resolve(__dirname, '.native-language-stash.json');

type StashRow = { userId: string; nativeLanguage: string };

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

async function legacyColumnExists(prisma: PrismaClient): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
        AND column_name = 'nativeLanguage'
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

async function stash(prisma: PrismaClient): Promise<void> {
  if (!(await legacyColumnExists(prisma))) {
    console.log('No legacy nativeLanguage column — nothing to stash.');
    return;
  }

  const rows = await prisma.$queryRaw<StashRow[]>`
    SELECT id AS "userId", "nativeLanguage"
    FROM "User"
    WHERE "nativeLanguage" IS NOT NULL AND trim("nativeLanguage") <> ''
  `;

  writeFileSync(STASH_PATH, JSON.stringify(rows, null, 2), 'utf8');
  console.log(`Stashed ${rows.length} user(s) → ${STASH_PATH}`);
  for (const row of rows) {
    console.log(`  ${row.userId}: ${row.nativeLanguage}`);
  }
}

async function resolveLanguageId(
  prisma: PrismaClient,
  legacy: string,
): Promise<string | null> {
  const trimmed = legacy.trim();
  if (!trimmed) return null;

  const byCode = await prisma.language.findUnique({
    where: { code: trimmed.toLowerCase() },
    select: { id: true },
  });
  if (byCode) return byCode.id;

  const languages = await prisma.language.findMany({ select: { id: true, name: true, code: true } });
  const norm = normalizeName(trimmed);
  const byName = languages.find((l) => normalizeName(l.name) === norm);
  if (byName) return byName.id;

  const byCodePartial = languages.find((l) => norm.startsWith(normalizeName(l.name)));
  if (byCodePartial) return byCodePartial.id;

  return null;
}

async function restore(prisma: PrismaClient): Promise<void> {
  if (!existsSync(STASH_PATH)) {
    console.error(`Stash file not found: ${STASH_PATH}`);
    console.error('Run: npm run prisma:migrate:native-language -- stash');
    process.exit(1);
  }

  const { seedLanguages } = await import('./seed-languages');
  await seedLanguages(prisma);
  const rows = JSON.parse(readFileSync(STASH_PATH, 'utf8')) as StashRow[];

  let updated = 0;
  let skipped = 0;
  for (const row of rows) {
    const languageId = await resolveLanguageId(prisma, row.nativeLanguage);
    if (!languageId) {
      console.warn(`  skip ${row.userId}: no Language match for "${row.nativeLanguage}"`);
      skipped += 1;
      continue;
    }
    await prisma.user.update({
      where: { id: row.userId },
      data: { nativeLanguageId: languageId },
    });
    console.log(`  ${row.userId}: "${row.nativeLanguage}" → languageId ${languageId}`);
    updated += 1;
  }

  console.log(`Restore complete: ${updated} updated, ${skipped} skipped.`);
}

async function main(): Promise<void> {
  loadDotenv();
  const command = process.argv[2] ?? 'help';
  const prisma = buildPrisma();
  try {
    if (command === 'stash') {
      await stash(prisma);
    } else if (command === 'restore') {
      await restore(prisma);
    } else {
      console.log(`Usage:
  npm run prisma:migrate:native-language -- stash
  npm run prisma:migrate:native-language -- restore`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
