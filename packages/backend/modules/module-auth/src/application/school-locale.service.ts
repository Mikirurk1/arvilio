import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import {
  resolveSchoolDefaultLocale,
  sanitizeEnabledLocales,
  type Locale,
} from '@pkg/types';

export interface SchoolLocaleDto {
  defaultLocale: Locale;
  enabledLocales: Locale[];
}

/**
 * G33 — per-school UI locale settings: default locale + offered locale set.
 * Both values are constrained to the platform allowlist (SUPPORTED_LOCALES); an
 * empty enabled set inherits the platform shipped set.
 */
@Injectable()
export class SchoolLocaleService {
  constructor(private readonly prisma: PrismaService) {}

  async get(schoolId: string): Promise<SchoolLocaleDto> {
    const school = await this.prisma.school.findUniqueOrThrow({
      where: { id: schoolId },
      select: { defaultLocale: true, enabledLocales: true },
    });
    const enabledLocales = sanitizeEnabledLocales(school.enabledLocales);
    return {
      defaultLocale: resolveSchoolDefaultLocale(school.defaultLocale, enabledLocales),
      enabledLocales,
    };
  }

  async update(
    schoolId: string,
    patch: Partial<{ defaultLocale: string | null; enabledLocales: string[] }>,
  ): Promise<SchoolLocaleDto> {
    const current = await this.prisma.school.findUniqueOrThrow({
      where: { id: schoolId },
      select: { defaultLocale: true, enabledLocales: true },
    });

    const enabledLocales =
      patch.enabledLocales !== undefined
        ? sanitizeEnabledLocales(patch.enabledLocales)
        : sanitizeEnabledLocales(current.enabledLocales);

    const requestedDefault =
      patch.defaultLocale !== undefined ? patch.defaultLocale : current.defaultLocale;
    const defaultLocale = resolveSchoolDefaultLocale(requestedDefault, enabledLocales);

    await this.prisma.school.update({
      where: { id: schoolId },
      data: { defaultLocale, enabledLocales },
    });

    return { defaultLocale, enabledLocales };
  }
}
