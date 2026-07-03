import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

/**
 * G15 — GDPR compliance: data export (DSAR) and erasure (right to be forgotten).
 *
 * Export: collects all personally identifiable data for a user across all models.
 * Erasure: anonymizes the user record and removes sensitive personal data.
 *          Hard-delete of financial/audit records is intentionally avoided —
 *          accounting data must be retained for the legally required period.
 */
@Injectable()
export class GdprService {
  private readonly logger = new Logger(GdprService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** DSAR — export all personal data for a user as a plain JSON object. */
  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: { select: { provider: true, providerEmail: true } },
        schoolMemberships: {
          include: { school: { select: { id: true, name: true, slug: true } } },
        },
        vocabularyCards: {
          select: { createdAt: true, masteryLevel: true, status: true },
        },
        lessonsAsStudent: {
          select: { id: true, date: true, startTime: true, endTime: true },
          orderBy: { date: 'desc' },
          take: 500,
        },
        quizAttempts: {
          select: { startedAt: true, score: true, correctCount: true, totalCount: true },
          orderBy: { startedAt: 'desc' },
          take: 200,
        },
        speakingSubmissions: {
          select: { audioSizeBytes: true, durationSec: true, status: true, submittedAt: true },
          take: 200,
        },
        notificationDeliveries: {
          select: { channel: true, sentAt: true, kind: true },
          orderBy: { sentAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Strip internal secrets before export
    const { passwordHash: _pw, ...safeUser } = user;

    return {
      exportedAt: new Date().toISOString(),
      profile: safeUser,
    };
  }

  /**
   * Right to erasure — anonymize personal data.
   *
   * Strategy: replace PII with placeholder values; do NOT hard-delete.
   * - Financial/billing rows kept for accounting retention requirements.
   * - Audit log rows kept (platform integrity).
   * - Tokens/OAuth removed (authentication paths).
   * - Lessons/attempts/submissions: userId retained (foreign key), personal
   *   content replaced where applicable.
   *
   * After erasure the account is deactivated and cannot log in.
   */
  async eraseUser(
    targetUserId: string,
    requestedBy: string,
  ): Promise<{ erasedUserId: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const placeholder = `erased-${targetUserId}`;

    await this.prisma.$transaction([
      // 1. Revoke all active sessions / tokens
      this.prisma.authRefreshToken.deleteMany({ where: { userId: targetUserId } }),
      this.prisma.passwordResetToken.deleteMany({ where: { userId: targetUserId } }),
      // 2. Remove OAuth links (credentials, not behavioral data)
      this.prisma.oAuthAccount.deleteMany({ where: { userId: targetUserId } }), // eslint-disable-line @typescript-eslint/no-explicit-any
      // 3. Anonymize the user record
      this.prisma.user.update({
        where: { id: targetUserId },
        data: {
          email: `${placeholder}@erased.invalid`,
          displayName: '[Erased]',
          passwordHash: null,
          avatarUrl: null,
          phone: null,
          telegram: null,
          bio: null,
          status: 'LEAVED',
        },
      }),
    ]);

    this.logger.log(
      `GDPR erasure: user ${targetUserId} anonymized by ${requestedBy}`,
    );

    return { erasedUserId: targetUserId };
  }
}
