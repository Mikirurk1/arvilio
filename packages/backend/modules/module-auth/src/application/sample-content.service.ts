import { Injectable, Logger } from '@nestjs/common';
import { EntitlementsService } from '@be/billing';
import { PrismaService } from '@be/prisma';
import { randomDisplayColor } from '../shared/display-color';

interface SeedMaterial {
  title: string;
  description: string;
  kind: 'BOARD' | 'PRESENTATION' | 'BOOK' | 'OTHER';
  tags: string[];
  assets: Array<{
    role: 'STUDENT_BOOK' | 'TEACHER_BOOK' | 'WORKBOOK' | 'AUDIO' | 'VIDEO' | 'SLIDES' | 'LINK' | 'OTHER';
    label: string;
    url: string;
  }>;
}

const SAMPLE_MATERIALS: SeedMaterial[] = [
  {
    title: 'English Alphabet & Phonics',
    description: 'A visual board covering the 26 letters and key phonics sounds. Great for absolute beginners.',
    kind: 'BOARD',
    tags: ['beginner', 'phonics', 'alphabet'],
    assets: [
      { role: 'SLIDES', label: 'Interactive slides', url: 'https://docs.google.com/presentation/d/sample-alphabet' },
    ],
  },
  {
    title: 'Present Simple vs Present Continuous',
    description: 'Clear explanations, timelines, and 20 practice exercises. Level A2–B1.',
    kind: 'PRESENTATION',
    tags: ['grammar', 'tenses', 'A2', 'B1'],
    assets: [
      { role: 'SLIDES', label: 'Grammar slides', url: 'https://docs.google.com/presentation/d/sample-tenses' },
      { role: 'WORKBOOK', label: 'Exercise sheet', url: 'https://docs.google.com/document/d/sample-tenses-wb' },
    ],
  },
  {
    title: 'Business English: Email Writing',
    description: 'Templates and examples for formal and semi-formal business emails. Level B2–C1.',
    kind: 'OTHER',
    tags: ['business', 'writing', 'email', 'B2', 'C1'],
    assets: [
      { role: 'STUDENT_BOOK', label: 'Student materials', url: 'https://docs.google.com/document/d/sample-email-writing' },
      { role: 'LINK', label: 'Reference guide', url: 'https://plainenglish.co.uk/business-email-guide' },
    ],
  },
];

const SAMPLE_QUIZ = {
  title: 'Sample: Present Simple warm-up',
  category: 'Grammar',
  difficulty: 'EASY' as const,
  source: 'MANUAL' as const,
  questions: [
    {
      order: 0,
      type: 'MULTIPLE_CHOICE' as const,
      prompt: 'She ___ to school every day.',
      options: ['go', 'goes', 'going', 'gone'],
      correctAnswer: '1',
    },
    {
      order: 1,
      type: 'FILL_IN' as const,
      prompt: 'I ___ coffee in the morning. (drink)',
      options: [] as string[],
      correctAnswer: 'drink',
    },
  ],
};

/** Stable title used for idempotent sample lesson lookup. */
export const SAMPLE_LESSON_TITLE = 'Sample: First lesson';

const DEMO_STUDENT_NAME = 'Demo Student';

const logger = new Logger('SampleContentService');

function demoStudentEmail(schoolId: string): string {
  // `.invalid` TLD — never deliverable; no welcome email is sent for this seed path.
  return `demo+${schoolId.slice(0, 12)}@sample.arvilio.invalid`;
}

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Seeds demonstration library materials, one sample quiz, and one planned
 * scheduled lesson (with a demo student if the school has none). Idempotent
 * per artifact type. Called from SchoolOnboardingService on `sample-content`.
 */
@Injectable()
export class SampleContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementsService,
  ) {}

  async seed(
    schoolId: string,
    createdById: string,
  ): Promise<{ created: number; quizzes: number; lessons: number }> {
    const materialsCreated = await this.seedMaterials(schoolId, createdById);
    const quizzesCreated = await this.seedSampleQuiz(schoolId, createdById);
    const lessonsCreated = await this.seedSampleLesson(schoolId, createdById);
    logger.log(
      `Sample content seeded: ${materialsCreated} materials, ${quizzesCreated} quizzes, ${lessonsCreated} lessons for school ${schoolId}`,
    );
    return { created: materialsCreated, quizzes: quizzesCreated, lessons: lessonsCreated };
  }

  private async seedMaterials(schoolId: string, createdById: string): Promise<number> {
    const existing = await this.prisma.libraryMaterial.count({ where: { schoolId } });
    if (existing > 0) {
      logger.log(`Sample materials skipped — school ${schoolId} already has ${existing}`);
      return 0;
    }

    let created = 0;
    for (const m of SAMPLE_MATERIALS) {
      try {
        await this.prisma.libraryMaterial.create({
          data: {
            title: m.title,
            description: m.description,
            kind: m.kind,
            tags: m.tags,
            schoolId,
            createdById,
            assets: {
              create: m.assets.map((a, i) => ({
                role: a.role,
                deliveryKind: 'URL',
                url: a.url,
                label: a.label,
                sortOrder: i,
              })),
            },
          },
        });
        created++;
      } catch (err) {
        logger.warn(`Sample material "${m.title}" skipped: ${String(err)}`);
      }
    }
    return created;
  }

  private async seedSampleQuiz(schoolId: string, ownerId: string): Promise<number> {
    const existing = await this.prisma.quiz.count({ where: { schoolId } });
    if (existing > 0) {
      logger.log(`Sample quiz skipped — school ${schoolId} already has ${existing} quizzes`);
      return 0;
    }

    try {
      await this.prisma.quiz.create({
        data: {
          title: SAMPLE_QUIZ.title,
          category: SAMPLE_QUIZ.category,
          difficulty: SAMPLE_QUIZ.difficulty,
          source: SAMPLE_QUIZ.source,
          schoolId,
          ownerId,
          questions: {
            create: SAMPLE_QUIZ.questions.map((q) => ({
              order: q.order,
              type: q.type,
              prompt: q.prompt,
              options: q.options,
              correctAnswer: q.correctAnswer,
            })),
          },
        },
      });
      return 1;
    } catch (err) {
      logger.warn(`Sample quiz skipped: ${String(err)}`);
      return 0;
    }
  }

  private async seedSampleLesson(schoolId: string, teacherId: string): Promise<number> {
    const existingLesson = await this.prisma.scheduledLesson.findFirst({
      where: { schoolId, title: SAMPLE_LESSON_TITLE },
      select: { id: true },
    });
    if (existingLesson) {
      logger.log(`Sample lesson skipped — school ${schoolId} already has "${SAMPLE_LESSON_TITLE}"`);
      return 0;
    }

    const studentId = await this.resolveOrCreateDemoStudent(schoolId, teacherId);
    if (!studentId) {
      logger.warn(`Sample lesson skipped — no student seat available for school ${schoolId}`);
      return 0;
    }

    try {
      const teacher = await this.prisma.user.findUnique({
        where: { id: teacherId },
        select: { timezone: true },
      });
      const timezone = teacher?.timezone || 'Europe/Kyiv';
      const libraryMaterial = await this.prisma.libraryMaterial.findFirst({
        where: { schoolId },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });

      await this.prisma.scheduledLesson.create({
        data: {
          schoolId,
          title: SAMPLE_LESSON_TITLE,
          description: 'A seeded demo lesson so your calendar is not empty after signup. Safe to edit or delete.',
          date: isoDateOffset(2),
          startTime: '10:00',
          endTime: '10:55',
          duration: 55,
          timezone,
          teacherId,
          studentId,
          status: 'PLANNED',
          kind: 'INDIVIDUAL',
          participants: {
            create: [{ userId: studentId, schoolId, role: 'STUDENT', sortOrder: 0 }],
          },
          ...(libraryMaterial
            ? {
                materials: {
                  create: [
                    {
                      kind: 'BOARD',
                      text: 'Sample board from your library',
                      libraryMaterialId: libraryMaterial.id,
                      order: 0,
                    },
                  ],
                },
              }
            : {}),
        },
      });
      return 1;
    } catch (err) {
      logger.warn(`Sample lesson skipped: ${String(err)}`);
      return 0;
    }
  }

  /**
   * Prefer an existing ACTIVE student in the school; otherwise create a
   * non-login demo student (no password, `.invalid` email, no welcome mail)
   * when the plan still has a seat.
   */
  private async resolveOrCreateDemoStudent(
    schoolId: string,
    teacherId: string,
  ): Promise<string | null> {
    const demoEmail = demoStudentEmail(schoolId);

    const existingDemo = await this.prisma.user.findUnique({
      where: { email: demoEmail },
      select: { id: true },
    });
    if (existingDemo) {
      await this.prisma.schoolMembership.upsert({
        where: { schoolId_userId: { schoolId, userId: existingDemo.id } },
        create: { schoolId, userId: existingDemo.id, role: 'STUDENT', status: 'ACTIVE' },
        update: { role: 'STUDENT', status: 'ACTIVE' },
      });
      return existingDemo.id;
    }

    const anyStudent = await this.prisma.schoolMembership.findFirst({
      where: { schoolId, role: 'STUDENT', status: 'ACTIVE' },
      select: { userId: true },
      orderBy: { createdAt: 'asc' },
    });
    if (anyStudent) return anyStudent.userId;

    if (!(await this.entitlements.canAddActiveStudent(schoolId))) {
      return null;
    }

    try {
      const enLang = await this.prisma.language.findUnique({
        where: { code: 'en' },
        select: { id: true },
      });

      const user = await this.prisma.user.create({
        data: {
          email: demoEmail,
          passwordHash: null,
          displayName: DEMO_STUDENT_NAME,
          role: 'STUDENT',
          status: 'ACTIVE',
          teacherId,
          displayColor: randomDisplayColor(),
          proficiencyLevel: 'A1',
          schoolMemberships: {
            create: { schoolId, role: 'STUDENT', status: 'ACTIVE' },
          },
          ...(enLang
            ? {
                learningLanguages: {
                  create: [{ languageId: enLang.id, schoolId }],
                },
              }
            : {}),
        },
        select: { id: true },
      });
      return user.id;
    } catch (err) {
      logger.warn(`Demo student create failed for school ${schoolId}: ${String(err)}`);
      return null;
    }
  }
}
