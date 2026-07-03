import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

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

const logger = new Logger('SampleContentService');

/**
 * Seeds 3 demonstration LibraryMaterials (URL-based, no file uploads) for a new school
 * so the workspace is not empty after signup. Safe to run multiple times — skips if
 * the school already has any library materials. Called from SchoolOnboardingService
 * when the admin opts in to sample content at the `sample-content` wizard step.
 */
@Injectable()
export class SampleContentService {
  constructor(private readonly prisma: PrismaService) {}

  async seed(schoolId: string, createdById: string): Promise<{ created: number }> {
    const existing = await this.prisma.libraryMaterial.count({ where: { schoolId } });
    if (existing > 0) {
      logger.log(`Sample content skipped — school ${schoolId} already has ${existing} materials`);
      return { created: 0 };
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

    logger.log(`Sample content seeded: ${created} materials for school ${schoolId}`);
    return { created };
  }
}
