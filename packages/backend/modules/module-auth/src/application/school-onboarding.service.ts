import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import type { UpdatePaymentSettingsRequestDto } from '@pkg/types';
import { TenantContextService } from '@be/tenant';
import { PaymentSettingsService } from '@be/billing';
import { InvitationsService } from './invitations.service';
import { SampleContentService } from './sample-content.service';

/** Wizard steps (Phase 4.5.3, G30). Order drives the UI; backend just validates membership. */
export const ONBOARDING_STEPS = [
  'profile',
  'teaching',
  'payments',
  'invite',
  'sample-content',
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface OnboardingStateDto {
  completed: boolean;
  currentStep: string | null;
  steps: Record<string, unknown>;
}

const EMPTY_STATE: OnboardingStateDto = { completed: false, currentStep: null, steps: {} };

/**
 * Resumable signup config wizard state (Phase 4.5.3). Persisted on
 * `School.onboardingState` (JSON) so progress survives reloads. School-scoped: the
 * current admin edits their own school (schoolId from tenant context). Each step
 * write is idempotent (overwrites that step's slice), so the wizard is skippable
 * and resumable.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const logger = new Logger('SchoolOnboardingService');

/** Parse a block of newline/comma-separated emails; silently drop malformed entries. */
function parseInviteEmails(raw: unknown): string[] {
  if (typeof raw !== 'string') return [];
  return raw
    .split(/[\n,]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => EMAIL_RE.test(e));
}

@Injectable()
export class SchoolOnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly invitations: InvitationsService,
    private readonly sampleContent: SampleContentService,
    private readonly paymentSettings: PaymentSettingsService,
  ) {}

  private parseState(raw: Prisma.JsonValue | null | undefined): OnboardingStateDto {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...EMPTY_STATE };
    const obj = raw as Record<string, unknown>;
    const steps =
      obj.steps && typeof obj.steps === 'object' && !Array.isArray(obj.steps)
        ? (obj.steps as Record<string, unknown>)
        : {};
    return {
      completed: obj.completed === true,
      currentStep: typeof obj.currentStep === 'string' ? obj.currentStep : null,
      steps,
    };
  }

  async getState(): Promise<OnboardingStateDto> {
    const schoolId = this.tenant.requireSchoolId();
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { onboardingState: true },
    });
    return this.parseState(school?.onboardingState);
  }

  private assertAdmin(): void {
    if (this.tenant.membershipRole !== 'ADMIN') {
      throw new ForbiddenException('Only a school admin can change onboarding');
    }
  }

  async saveStep(step: string, data: Record<string, unknown>): Promise<OnboardingStateDto> {
    this.assertAdmin();
    if (!ONBOARDING_STEPS.includes(step as OnboardingStep)) {
      throw new BadRequestException(`Unknown onboarding step: ${step}`);
    }
    const schoolId = this.tenant.requireSchoolId();
    const current = await this.getState();
    const next: OnboardingStateDto = {
      ...current,
      currentStep: step,
      steps: { ...current.steps, [step]: data ?? {} },
    };
    await this.prisma.school.update({
      where: { id: schoolId },
      data: { onboardingState: next as unknown as Prisma.InputJsonValue },
    });

    // Side effects — fire-and-forget (wizard state is already persisted above)
    if (step === 'invite') {
      void this.dispatchInvites(data, schoolId);
    }
    if (step === 'sample-content' && data['seed'] !== 'no') {
      const adminUserId = this.tenant.userId;
      if (adminUserId) void this.sampleContent.seed(schoolId, adminUserId).catch((err) => {
        logger.warn(`Sample content seed failed for school ${schoolId}: ${String(err)}`);
      });
    }
    if (step === 'payments') {
      void this.applyPaymentsStep(data).catch((err) => {
        logger.warn(`Payments step failed for school ${schoolId}: ${String(err)}`);
      });
    }

    return next;
  }

  /**
   * Parse emails from the `invite` step and create `SchoolInvitation` entries.
   * Each email becomes a TEACHER invitation (the most common onboarding use-case;
   * admins can change role later). Already-member and duplicate emails are silently
   * skipped by `InvitationsService.create` (it throws — we catch per-item).
   */
  private async dispatchInvites(data: Record<string, unknown>, schoolId: string): Promise<void> {
    const emails = parseInviteEmails(data['emails']);
    if (emails.length === 0) return;
    const adminUserId = this.tenant.userId;
    if (!adminUserId) return;
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { emailVerifiedAt: true },
    });
    if (!admin?.emailVerifiedAt) {
      logger.warn(`Invite dispatch skipped — admin ${adminUserId} email not verified (schoolId=${schoolId})`);
      return;
    }
    for (const email of emails) {
      try {
        await this.invitations.create({ email, role: 'TEACHER' }, adminUserId);
      } catch (err) {
        // Skip already-member / already-invited — don't fail the whole batch
        logger.warn(`Onboarding invite skipped for ${email} (schoolId=${schoolId}): ${String(err)}`);
      }
    }
  }

  /**
   * Enable the payment methods selected in the wizard's "payments" step.
   * Keeps the existing config (packages, manual-invoice methods, etc.) — only the
   * enabled methods list changes. Validates against the platform allowlist via
   * PaymentSettingsService (throws BadRequestException on violation — caught upstream).
   */
  private async applyPaymentsStep(data: Record<string, unknown>): Promise<void> {
    const raw = data['methods'];
    if (!Array.isArray(raw) || raw.length === 0) return;
    const methods = raw.filter((m): m is string => typeof m === 'string');
    if (methods.length === 0) return;

    const current = await this.paymentSettings.getPaymentSettings();
    await this.paymentSettings.updatePaymentSettings({
      enabledMethods: methods as UpdatePaymentSettingsRequestDto['enabledMethods'],
      config: current.config,
    });
  }

  async complete(): Promise<OnboardingStateDto> {
    this.assertAdmin();
    const schoolId = this.tenant.requireSchoolId();
    const current = await this.getState();
    const next: OnboardingStateDto = { ...current, completed: true, currentStep: null };
    await this.prisma.school.update({
      where: { id: schoolId },
      data: { onboardingState: next as unknown as Prisma.InputJsonValue },
    });
    return next;
  }
}
