import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

/**
 * Maintains `School.storageUsedBytes` (Phase 3/5, G6/G42). Callers adjust by a
 * signed delta: positive on upload, negative on delete or when compression shrinks
 * a stored file. Read-modify-write in a transaction so the counter never goes
 * negative (defensive against double-decrements). Keyed explicitly by schoolId —
 * safe to call from background jobs (no ambient tenant context required).
 */
@Injectable()
export class StorageAccountingService {
  constructor(private readonly prisma: PrismaService) {}

  async add(schoolId: string, deltaBytes: number): Promise<void> {
    if (!schoolId || !deltaBytes) return;
    const delta = BigInt(Math.trunc(deltaBytes));
    await this.prisma.$transaction(async (tx) => {
      const school = await tx.school.findUnique({
        where: { id: schoolId },
        select: { storageUsedBytes: true },
      });
      if (!school) return;
      const next = school.storageUsedBytes + delta;
      await tx.school.update({
        where: { id: schoolId },
        data: { storageUsedBytes: next > 0n ? next : 0n },
      });
    });
  }
}
