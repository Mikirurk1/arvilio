/**
 * One-off backfill after Language / WordDefinition migration.
 *
 * - Ensures language catalog is seeded
 * - Creates EN WordDefinition rows from Word.definition where missing
 * - Ensures students have at least English in learning languages (optional default)
 *
 * Run: npm run prisma:backfill:languages-words
 */
import { buildPrisma, loadDotenv } from './prisma-cli';
import { seedLanguages } from './seed-languages';

async function main(): Promise<void> {
  loadDotenv();
  const prisma = buildPrisma();
  try {
    await seedLanguages(prisma);

    const en = await prisma.language.findUnique({ where: { code: 'en' } });
    if (!en) {
      throw new Error('English language row missing after seed');
    }

    const words = await prisma.word.findMany({
      select: { id: true, definition: true },
    });

    let wordDefsCreated = 0;
    for (const word of words) {
      const text = word.definition.trim();
      if (!text) continue;
      const existing = await prisma.wordDefinition.findUnique({
        where: { wordId_languageId: { wordId: word.id, languageId: en.id } },
      });
      if (existing) continue;
      await prisma.wordDefinition.create({
        data: { wordId: word.id, languageId: en.id, text },
      });
      wordDefsCreated += 1;
    }

    const studentsWithoutLearning = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        learningLanguages: { none: {} },
      },
      select: { id: true },
    });

    let learningLinksCreated = 0;
    for (const student of studentsWithoutLearning) {
      await prisma.studentLearningLanguage.create({
        data: { userId: student.id, languageId: en.id },
      });
      learningLinksCreated += 1;
    }

    console.log(
      `Backfill complete: ${wordDefsCreated} EN definitions, ${learningLinksCreated} default learning-language links.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
