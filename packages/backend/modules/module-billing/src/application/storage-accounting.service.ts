import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

export type StorageReconcileResult = {
  schoolId: string;
  previousBytes: string;
  usedBytes: string;
  breakdown: {
    materials: string;
    lessonFiles: string;
    speaking: string;
    recordings: string;
  };
};

/**
 * Maintains `School.storageUsedBytes` (Phase 3/5, G6/G42). Callers adjust by a
 * signed delta: positive on upload, negative on delete or when compression shrinks
 * a stored file. Read-modify-write in a transaction so the counter never goes
 * negative (defensive against double-decrements). Keyed explicitly by schoolId —
 * safe to call from background jobs (no ambient tenant context required).
 *
 * Counter can drift when files were seeded / imported before accounting was wired.
 * Use `reconcile(schoolId)` to recompute from attachment tables.
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

  /**
   * Recompute `storageUsedBytes` from durable file tables (materials, lesson
   * attachments, speaking audio, lesson recordings). Chat attachments are
   * ephemeral (24h) and intentionally excluded.
   */
  async reconcile(schoolId: string): Promise<StorageReconcileResult> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { storageUsedBytes: true },
    });
    if (!school) {
      return {
        schoolId,
        previousBytes: '0',
        usedBytes: '0',
        breakdown: {
          materials: '0',
          lessonFiles: '0',
          speaking: '0',
          recordings: '0',
        },
      };
    }

    const [materials, lessonFiles, speaking, recordings] = await Promise.all([
      this.prisma.libraryFileAttachment.aggregate({
        where: { material: { schoolId } },
        _sum: { sizeBytes: true },
      }),
      this.prisma.lessonFileAttachment.aggregate({
        where: { lesson: { schoolId } },
        _sum: { sizeBytes: true },
      }),
      this.prisma.speakingSubmission.aggregate({
        where: { schoolId },
        _sum: { audioSizeBytes: true },
      }),
      this.prisma.scheduledLesson.aggregate({
        where: { schoolId },
        _sum: { recordingSizeBytes: true },
      }),
    ]);

    const materialsBytes = BigInt(materials._sum.sizeBytes ?? 0);
    const lessonFilesBytes = BigInt(lessonFiles._sum.sizeBytes ?? 0);
    const speakingBytes = BigInt(speaking._sum.audioSizeBytes ?? 0);
    const recordingsBytes = BigInt(recordings._sum.recordingSizeBytes ?? 0);
    const total = materialsBytes + lessonFilesBytes + speakingBytes + recordingsBytes;

    await this.prisma.school.update({
      where: { id: schoolId },
      data: { storageUsedBytes: total },
    });

    return {
      schoolId,
      previousBytes: school.storageUsedBytes.toString(),
      usedBytes: total.toString(),
      breakdown: {
        materials: materialsBytes.toString(),
        lessonFiles: lessonFilesBytes.toString(),
        speaking: speakingBytes.toString(),
        recordings: recordingsBytes.toString(),
      },
    };
  }
}
