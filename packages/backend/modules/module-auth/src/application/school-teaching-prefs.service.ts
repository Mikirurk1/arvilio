import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';

export const TEACHING_LESSON_FORMATS = ['online', 'in-person', 'hybrid'] as const;
export type TeachingLessonFormat = (typeof TEACHING_LESSON_FORMATS)[number];

export interface SchoolTeachingPrefsDto {
  languages: string[];
  lessonFormat: TeachingLessonFormat;
}

const DEFAULT_PREFS: SchoolTeachingPrefsDto = {
  languages: [],
  lessonFormat: 'online',
};

function isTeachingFormat(value: unknown): value is TeachingLessonFormat {
  return typeof value === 'string' && (TEACHING_LESSON_FORMATS as readonly string[]).includes(value);
}

/** Normalize wizard / PATCH payloads into a stable DTO. */
export function normalizeTeachingPrefs(raw: unknown): SchoolTeachingPrefsDto {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_PREFS };
  }
  const obj = raw as Record<string, unknown>;
  const languages = Array.isArray(obj['languages'])
    ? obj['languages']
        .filter((s): s is string => typeof s === 'string')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];
  const lessonFormat = isTeachingFormat(obj['lessonFormat'])
    ? obj['lessonFormat']
    : DEFAULT_PREFS.lessonFormat;
  return { languages, lessonFormat };
}

/**
 * School teaching preferences from the signup wizard (W5/W6).
 * Stored on `School.teachingPrefs` JSON.
 */
@Injectable()
export class SchoolTeachingPrefsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(schoolId: string): Promise<SchoolTeachingPrefsDto> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { teachingPrefs: true },
    });
    return normalizeTeachingPrefs(school?.teachingPrefs);
  }

  async update(
    schoolId: string,
    patch: Partial<{ languages: string[]; lessonFormat: string }>,
  ): Promise<SchoolTeachingPrefsDto> {
    const current = await this.get(schoolId);
    const nextLanguages =
      patch.languages !== undefined
        ? patch.languages
            .filter((s): s is string => typeof s === 'string')
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 20)
        : current.languages;

    if (patch.lessonFormat !== undefined && !isTeachingFormat(patch.lessonFormat)) {
      throw new BadRequestException(
        `lessonFormat must be one of: ${TEACHING_LESSON_FORMATS.join(', ')}`,
      );
    }
    const lessonFormat = isTeachingFormat(patch.lessonFormat)
      ? patch.lessonFormat
      : current.lessonFormat;

    const next: SchoolTeachingPrefsDto = { languages: nextLanguages, lessonFormat };
    await this.prisma.school.update({
      where: { id: schoolId },
      data: { teachingPrefs: next as unknown as Prisma.InputJsonValue },
    });
    return next;
  }
}
