import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { MailService } from '@be/mail';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import type { RegisterSchoolRequestDto } from '@pkg/types';
import { randomDisplayColor } from '../shared/display-color';
import { slugifySchoolName, randomSlugSuffix } from '../shared/school-slug';
import { isDisposableEmail } from '../shared/disposable-email';

/** Self-serve trial length (Phase 4.5.1, G28). Promo codes extend this (4.5.2). */
export const TRIAL_DAYS = 7;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_VERIFY_TTL_HOURS = 24;

/**
 * Self-serve "create your school" provisioning (Phase 4.5.1, ADR-008). Runs with
 * no tenant context (the tenant is being created), so it uses the base
 * PrismaService — equivalent to `asPlatform()` for a write that establishes a new
 * tenant. Atomic: School + admin User + ADMIN membership + TRIALING subscription
 * are created in one transaction, so a failure leaves nothing partial (retry-safe).
 */
@Injectable()
export class SchoolSignupService {
  private readonly logger = new Logger(SchoolSignupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async registerSchool(
    body: RegisterSchoolRequestDto,
  ): Promise<{ userId: string; schoolId: string; slug: string; trialEndsAt: Date }> {
    const email = body.email?.trim().toLowerCase() ?? '';
    if (!email || !email.includes('@')) throw new BadRequestException('Invalid email');
    if (isDisposableEmail(email)) throw new BadRequestException('Disposable email addresses are not accepted');
    if (!body.password || body.password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    const schoolName = body.schoolName?.trim();
    if (!schoolName) throw new BadRequestException('School name is required');
    const displayName = body.displayName?.trim() || email.split('@')[0] || 'Admin';

    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(body.password, 12);
    const baseSlug = slugifySchoolName(schoolName);
    const promoCode = body.promoCode?.trim().toUpperCase() || null;

    // Retry on slug collision (unique constraint) — keeps provisioning idempotent
    // under concurrent signups with similar names.
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${randomSlugSuffix()}`;
      try {
        const result = await this.prisma.$transaction(async (tx) => {
          const now = new Date();
          const school = await tx.school.create({
            data: { slug, name: schoolName, status: 'TRIAL' },
          });
          const emailVerifyToken = crypto.randomBytes(32).toString('hex');
          const user = await tx.user.create({
            data: {
              email,
              passwordHash,
              displayName,
              role: 'ADMIN',
              status: 'ACTIVE',
              timezone: 'Europe/Kyiv',
              displayColor: randomDisplayColor(),
              emailVerifyToken,
            },
          });
          await tx.schoolMembership.create({
            data: { schoolId: school.id, userId: user.id, role: 'ADMIN', status: 'ACTIVE' },
          });
          // Base trial is 7 days; a valid promo extends it (measured from signup).
          let trialDays = TRIAL_DAYS;
          if (promoCode) {
            trialDays = Math.max(trialDays, await this.redeemPromo(tx, promoCode, school.id, now));
          }
          const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
          await tx.schoolSubscription.create({
            data: { schoolId: school.id, status: 'TRIALING', trialEndsAt },
          });
          return { userId: user.id, schoolId: school.id, slug, trialEndsAt, emailVerifyToken, displayName, email };
        });
        // Fire-and-forget — verification email failure must not block signup
        void this.mail.sendEmailVerification({
          to: result.email,
          displayName: result.displayName,
          verifyUrl: `${this.mail.appUrl()}/auth/verify-email?token=${result.emailVerifyToken}`,
          expiresInHours: EMAIL_VERIFY_TTL_HOURS,
        }).catch((err) => {
          this.logger.warn(`Verification email failed for ${result.email}: ${String(err)}`);
        });
        return { userId: result.userId, schoolId: result.schoolId, slug: result.slug, trialEndsAt: result.trialEndsAt };
      } catch (error) {
        // Structural check: client extensions (tenant Prisma) can re-wrap the error so
        // `instanceof PrismaClientKnownRequestError` fails, and `meta.target` may be a
        // string ("School_slug_key") instead of an array depending on the driver.
        const pe = error as {
          code?: string;
          meta?: {
            target?: unknown;
            driverAdapterError?: { cause?: { constraint?: { fields?: unknown } } };
          };
        };
        const target = pe?.meta?.target;
        // Prisma 7 driver adapters (pg) report the constraint under
        // meta.driverAdapterError.cause.constraint.fields instead of meta.target.
        const adapterFields = pe?.meta?.driverAdapterError?.cause?.constraint?.fields;
        const fields = [
          ...(Array.isArray(target) ? target : [String(target ?? '')]),
          ...(Array.isArray(adapterFields) ? adapterFields : []),
        ].join(',');
        if (pe?.code === 'P2002' && fields.includes('slug')) {
          continue; // slug taken — retry with a suffix
        }
        throw error;
      }
    }
    throw new BadRequestException('Could not allocate a unique school address — try a different name');
  }

  /**
   * Validate + atomically redeem a promo code inside the signup transaction (G29).
   * Returns the promo's `trialDays`. Over-limit redemptions are prevented with a
   * conditional `updateMany` (claim-then-write), so concurrent signups can't exceed
   * `maxRedemptions`. Throws on unknown/inactive/out-of-window/exhausted codes.
   */
  private async redeemPromo(
    tx: Prisma.TransactionClient,
    code: string,
    schoolId: string,
    now: Date,
  ): Promise<number> {
    const promo = await tx.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.active) throw new BadRequestException('Invalid promo code');
    if (promo.validFrom && promo.validFrom > now) throw new BadRequestException('Promo code is not active yet');
    if (promo.validTo && promo.validTo < now) throw new BadRequestException('Promo code has expired');

    if (promo.maxRedemptions != null) {
      const claimed = await tx.promoCode.updateMany({
        where: { id: promo.id, redeemedCount: { lt: promo.maxRedemptions } },
        data: { redeemedCount: { increment: 1 } },
      });
      if (claimed.count !== 1) throw new BadRequestException('Promo code has been fully redeemed');
    } else {
      await tx.promoCode.update({
        where: { id: promo.id },
        data: { redeemedCount: { increment: 1 } },
      });
    }
    await tx.promoRedemption.create({ data: { promoCodeId: promo.id, schoolId } });
    return promo.trialDays;
  }
}
