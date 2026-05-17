import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@soenglish/data-access-prisma';
import type { LanguageDto } from '@soenglish/shared-types';

@Injectable()
export class LanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(): Promise<LanguageDto[]> {
    const rows = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true },
    });
    return rows;
  }

  async assertLanguageIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const unique = [...new Set(ids)];
    const count = await this.prisma.language.count({
      where: { id: { in: unique }, isActive: true },
    });
    if (count !== unique.length) {
      throw new BadRequestException('One or more language ids are invalid');
    }
  }

  async resolveIdByCode(code: string): Promise<string | null> {
    const row = await this.prisma.language.findUnique({
      where: { code: code.trim().toLowerCase() },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  /** Default language students learn (English) when not configured in admin UI. */
  async defaultLearningLanguageId(): Promise<string> {
    const id = await this.resolveIdByCode('en');
    if (!id) {
      throw new BadRequestException('English language is not configured in the catalog');
    }
    return id;
  }
}
