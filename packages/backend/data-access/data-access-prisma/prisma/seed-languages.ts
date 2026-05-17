import { fileURLToPath } from 'node:url';
import type { PrismaClient } from '@prisma/client';
import { buildPrisma, loadDotenv } from './prisma-cli';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ru', name: 'Russian' },
  { code: 'pl', name: 'Polish' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
] as const;

export async function seedLanguages(prisma: PrismaClient): Promise<void> {
  for (const row of LANGUAGES) {
    await prisma.language.upsert({
      where: { code: row.code },
      create: { code: row.code, name: row.name, isActive: true },
      update: { name: row.name, isActive: true },
    });
  }
}

async function main(): Promise<void> {
  loadDotenv();
  const prisma = buildPrisma();
  try {
    await seedLanguages(prisma);
    console.log('Languages seeded.');
  } finally {
    await prisma.$disconnect();
  }
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  void main();
}
