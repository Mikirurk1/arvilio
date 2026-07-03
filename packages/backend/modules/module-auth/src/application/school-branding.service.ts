import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

export interface SchoolBrandingDto {
  brandColor: string | null;
  logoUrl: string | null;
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** G18 — per-school white-label branding (color + logo). */
@Injectable()
export class SchoolBrandingService {
  constructor(private readonly prisma: PrismaService) {}

  async get(schoolId: string): Promise<SchoolBrandingDto> {
    const school = await this.prisma.school.findUniqueOrThrow({
      where: { id: schoolId },
      select: { brandColor: true, logoUrl: true },
    });
    return { brandColor: school.brandColor, logoUrl: school.logoUrl };
  }

  async update(
    schoolId: string,
    patch: Partial<SchoolBrandingDto>,
  ): Promise<SchoolBrandingDto> {
    if (patch.brandColor !== undefined && patch.brandColor !== null) {
      if (!HEX_RE.test(patch.brandColor)) {
        throw new BadRequestException('brandColor must be a valid hex color (#rgb or #rrggbb)');
      }
    }
    const updated = await this.prisma.school.update({
      where: { id: schoolId },
      data: {
        ...(patch.brandColor !== undefined && { brandColor: patch.brandColor }),
        ...(patch.logoUrl !== undefined && { logoUrl: patch.logoUrl }),
      },
      select: { brandColor: true, logoUrl: true },
    });
    return { brandColor: updated.brandColor, logoUrl: updated.logoUrl };
  }
}
