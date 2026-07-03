import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

export interface TourStateDto {
  completed: boolean;
  completedAt: string | null;
}

/**
 * First-login product-tour completion (Phase 4.5.4). User-scoped (a tour is per
 * person, not per school — ADR-004 rule #6), stored on `User.tourCompletedAt`.
 * Idempotent: completing again keeps the first timestamp.
 */
@Injectable()
export class UserTourService {
  constructor(private readonly prisma: PrismaService) {}

  async getState(userId: string): Promise<TourStateDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tourCompletedAt: true },
    });
    const at = user?.tourCompletedAt ?? null;
    return { completed: at != null, completedAt: at?.toISOString() ?? null };
  }

  async complete(userId: string): Promise<TourStateDto> {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tourCompletedAt: true },
    });
    const completedAt = existing?.tourCompletedAt ?? new Date();
    if (!existing?.tourCompletedAt) {
      await this.prisma.user.update({ where: { id: userId }, data: { tourCompletedAt: completedAt } });
    }
    return { completed: true, completedAt: completedAt.toISOString() };
  }
}
