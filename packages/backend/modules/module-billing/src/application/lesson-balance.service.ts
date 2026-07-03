import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { LessonBalanceLedgerKind } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';
import type {
  AdjustStudentLessonBalanceRequestDto,
  LessonBalanceLedgerEntryDto,
  LessonCreditTrackDto,
  StudentLessonBalanceDto,
  UpdateStudentLessonBillingRequestDto,
} from '@pkg/types';
import { parseLessonCreditTrack } from '@pkg/types';
import { getLemonSqueezyActiveVariantCurrency } from '@pkg/types';
import { PaymentSettingsService } from './payment-settings.service';
import {
  parseStudentPaymentMethodSelection,
  resolveStudentPaymentMethods,
  shouldChargeLesson,
  studentPaymentMethodSelectionToJson,
  validateStudentPaymentMethodSelection,
} from '../shared/payment-map.util';
import {
  isManualInvoiceMethodConfigured,
  parseStudentManualInvoiceSelection,
  resolveStudentManualInvoiceMethods,
  studentManualInvoiceSelectionToJson,
  validateStudentManualInvoiceSelection,
} from '../shared/manual-invoice-map.util';
import {
  billingModeFromDto,
  billingModeToDto,
  mergeOverridesWithPlatformPackages,
  packageOverridesToJson,
  parsePackageOverrides,
  resolveStudentPackages,
} from '../shared/student-billing-map.util';
import { splitGroupPriceMinor } from '../shared/group-price-split.util';
import {
  lessonFormatToDto,
  toGroupMembershipSummaryDto,
} from '../shared/student-balance-map.util';

type StaffRole = 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
type CreditTrack = LessonCreditTrackDto;

const BALANCE_ROW_SELECT = {
  userId: true,
  balance: true,
  groupBalance: true,
  pricePerLessonMinor: true,
  groupPricePerLessonMinor: true,
  billingMode: true,
  packageOverrides: true,
  paymentMethodSelection: true,
  manualInvoiceSelection: true,
  updatedAt: true,
} satisfies Prisma.StudentLessonBalanceSelect;

@Injectable()
export class LessonBalanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly paymentSettings: PaymentSettingsService,
  ) {}

  async getMyBalance(userId: string): Promise<StudentLessonBalanceDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'STUDENT') {
      throw new ForbiddenException('Only students have a lesson balance');
    }
    return this.buildBalanceDto(userId);
  }

  async getStudentBalance(
    actor: { id: string; role: StaffRole },
    studentId: string,
  ): Promise<StudentLessonBalanceDto> {
    await this.assertStaffCanViewStudent(actor, studentId);
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }
    const dto = await this.buildBalanceDto(studentId);
    return actor.role === 'TEACHER' ? this.redactPricingForTeacher(dto) : dto;
  }

  async updateStudentPricing(
    actor: { id: string; role: StaffRole },
    studentId: string,
    pricePerLessonMinor: number | null,
    groupPricePerLessonMinor?: number | null,
  ): Promise<StudentLessonBalanceDto> {
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admins can update student pricing');
    }
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }
    if (pricePerLessonMinor != null && (!Number.isInteger(pricePerLessonMinor) || pricePerLessonMinor < 0)) {
      throw new BadRequestException('pricePerLessonMinor must be a non-negative integer');
    }
    if (
      groupPricePerLessonMinor != null &&
      (!Number.isInteger(groupPricePerLessonMinor) || groupPricePerLessonMinor < 0)
    ) {
      throw new BadRequestException('groupPricePerLessonMinor must be a non-negative integer');
    }
    await this.ensureBalanceRow(studentId);
    await this.prisma.studentLessonBalance.update({
      where: { userId: studentId },
      data: {
        pricePerLessonMinor,
        ...(groupPricePerLessonMinor !== undefined ? { groupPricePerLessonMinor } : {}),
      },
    });
    return this.buildBalanceDto(studentId);
  }

  async updateStudentBilling(
    actor: { id: string; role: StaffRole },
    body: UpdateStudentLessonBillingRequestDto,
  ): Promise<StudentLessonBalanceDto> {
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admins can update student billing rules');
    }
    const student = await this.prisma.user.findUnique({
      where: { id: body.studentId },
      select: { role: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }
    const settings = await this.paymentSettings.getPaymentSettings();
    const minLessons = settings.config.minPackageLessons;
    for (const ov of body.packageOverrides) {
      if (!ov.enabled) continue;
      const platform = settings.config.packages.find((p) => p.id === ov.packageId);
      if (!platform) {
        throw new BadRequestException(`Unknown package id: ${ov.packageId}`);
      }
      const lessons = ov.lessons ?? platform.lessons;
      if (lessons < minLessons) {
        throw new BadRequestException(
          `Package "${platform.label}" must have at least ${minLessons} lessons`,
        );
      }
      if (ov.lessonsLocked && (ov.lessons == null || ov.lessons < minLessons)) {
        throw new BadRequestException(
          `Locked package "${platform.label}" needs a fixed lesson count (≥ ${minLessons})`,
        );
      }
    }
    let validatedPaymentMethodSelection;
    try {
      validatedPaymentMethodSelection = validateStudentPaymentMethodSelection(
        settings.enabledMethods,
        body.paymentMethodSelection,
        { strict: true },
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid payment method selection',
      );
    }
    let validatedManualSelection;
    try {
      validatedManualSelection = validateStudentManualInvoiceSelection(
        settings.config.manualInvoiceMethods,
        body.manualInvoiceSelection,
        { strict: true },
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid manual invoice selection',
      );
    }
    await this.ensureBalanceRow(body.studentId);
    await this.prisma.studentLessonBalance.update({
      where: { userId: body.studentId },
      data: {
        billingMode: billingModeFromDto(body.billingMode),
        packageOverrides: packageOverridesToJson(body.packageOverrides) as object,
        paymentMethodSelection:
          studentPaymentMethodSelectionToJson(validatedPaymentMethodSelection) as object,
        manualInvoiceSelection: studentManualInvoiceSelectionToJson(validatedManualSelection) as object,
      },
    });
    return this.buildBalanceDto(body.studentId);
  }

  async adjustBalance(
    actor: { id: string; role: StaffRole },
    body: AdjustStudentLessonBalanceRequestDto,
  ): Promise<StudentLessonBalanceDto> {
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admins can adjust lesson balance');
    }
    const lessons = body.lessons;
    if (!Number.isInteger(lessons) || lessons <= 0) {
      throw new BadRequestException('lessons must be a positive integer');
    }
    const student = await this.prisma.user.findUnique({
      where: { id: body.studentId },
      select: { role: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }
    const creditTrack = parseLessonCreditTrack(body.creditTrack);
    await this.appendLedgerEntry({
      userId: body.studentId,
      delta: lessons,
      kind: creditTrack === 'group' ? 'GROUP_MANUAL_CREDIT' : 'MANUAL_CREDIT',
      createdById: actor.id,
      note: body.note?.trim() || null,
      creditTrack,
    });
    return this.buildBalanceDto(body.studentId);
  }

  async grantPurchaseLessons(params: {
    userId: string;
    lessons: number;
    paymentId: string;
    creditTrack?: LessonCreditTrackDto;
  }): Promise<void> {
    if (params.lessons <= 0) return;
    // G2 (tenant-aware webhooks): PSP webhooks carry no auth/host, so the tenant
    // context isn't seeded by the auth guard. Resolve the school from the Payment
    // row (stamped at checkout) and seed it here so the credited ledger/balance
    // rows land in the right school instead of falling back to DEFAULT_SCHOOL_ID.
    const payment = await this.prisma.payment.findUnique({
      where: { id: params.paymentId },
      select: { schoolId: true, metadata: true },
    });
    if (payment?.schoolId && this.tenant.isActive() && !this.tenant.schoolId) {
      this.tenant.setSchoolId(payment.schoolId);
    }
    let creditTrack = params.creditTrack;
    if (!creditTrack) {
      const meta =
        payment?.metadata && typeof payment.metadata === 'object'
          ? (payment.metadata as Record<string, unknown>)
          : null;
      creditTrack = parseLessonCreditTrack(meta?.['creditTrack']);
    }
    await this.appendLedgerEntry({
      userId: params.userId,
      delta: params.lessons,
      kind: creditTrack === 'group' ? 'GROUP_PURCHASE' : 'PURCHASE',
      paymentId: params.paymentId,
      note: null,
      creditTrack,
    });
  }

  async syncLessonCharge(lessonId: string): Promise<void> {
    const lesson = await this.prisma.scheduledLesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        kind: true,
        studentId: true,
        status: true,
        credited: true,
        groupBillingMode: true,
        groupPriceMinor: true,
        groupCurrency: true,
        groupSplitMode: true,
        groupPayerUserId: true,
        participants: { orderBy: { sortOrder: 'asc' }, select: { userId: true } },
      },
    });
    if (!lesson) return;

    const charge = shouldChargeLesson(lesson.status, lesson.credited);
    const participantIds =
      lesson.participants.length > 0
        ? lesson.participants.map((row) => row.userId)
        : [lesson.studentId];

    if (lesson.kind === 'GROUP') {
      await this.syncGroupLessonCharges(lessonId, lesson, participantIds, charge);
      return;
    }

    await this.syncIndividualLessonCharge(lessonId, lesson.studentId, charge);
  }

  private async syncGroupLessonCreditCharge(
    lessonId: string,
    studentId: string,
    charge: boolean,
  ): Promise<void> {
    const consumption = await this.findLedgerEntry(lessonId, studentId, 'GROUP_CONSUMPTION');

    if (charge && !consumption) {
      await this.appendLedgerEntry({
        userId: studentId,
        delta: -1,
        kind: 'GROUP_CONSUMPTION',
        scheduledLessonId: lessonId,
        note: null,
        creditTrack: 'group',
      });
      return;
    }

    if (!charge && consumption) {
      const reversal = await this.findLedgerEntry(lessonId, studentId, 'GROUP_REVERSAL');
      if (!reversal) {
        await this.appendLedgerEntry({
          userId: studentId,
          delta: 1,
          kind: 'GROUP_REVERSAL',
          scheduledLessonId: lessonId,
          note: null,
          creditTrack: 'group',
        });
      }
    }
  }

  private async syncIndividualLessonCharge(
    lessonId: string,
    studentId: string,
    charge: boolean,
  ): Promise<void> {
    const consumption = await this.findLedgerEntry(lessonId, studentId, 'CONSUMPTION');

    if (charge && !consumption) {
      await this.appendLedgerEntry({
        userId: studentId,
        delta: -1,
        kind: 'CONSUMPTION',
        scheduledLessonId: lessonId,
        note: null,
      });
      return;
    }

    if (!charge && consumption) {
      const reversal = await this.findLedgerEntry(lessonId, studentId, 'REVERSAL');
      if (!reversal) {
        await this.appendLedgerEntry({
          userId: studentId,
          delta: 1,
          kind: 'REVERSAL',
          scheduledLessonId: lessonId,
          note: null,
        });
      }
    }
  }

  private async syncGroupLessonCharges(
    lessonId: string,
    lesson: {
      groupBillingMode: string | null;
      groupPriceMinor: number | null;
      groupCurrency: string | null;
      groupSplitMode: string | null;
      groupPayerUserId: string | null;
    },
    participantIds: string[],
    charge: boolean,
  ): Promise<void> {
    if (lesson.groupBillingMode === 'PER_MEMBER') {
      for (const userId of participantIds) {
        await this.syncGroupLessonCreditCharge(lessonId, userId, charge);
      }
      return;
    }

    if (lesson.groupBillingMode !== 'FIXED_TOTAL') return;

    const currency = lesson.groupCurrency ?? 'UAH';
    const totalMinor = lesson.groupPriceMinor ?? 0;
    const chargeTargets =
      lesson.groupSplitMode === 'SINGLE_PAYER' && lesson.groupPayerUserId
        ? [lesson.groupPayerUserId]
        : participantIds;
    const amountsByUser =
      lesson.groupSplitMode === 'EQUAL_SPLIT'
        ? splitGroupPriceMinor(totalMinor, participantIds)
        : new Map([[chargeTargets[0]!, totalMinor]]);

    if (charge) {
      for (const userId of chargeTargets) {
        const amountMinor = amountsByUser.get(userId) ?? totalMinor;
        if (amountMinor <= 0) continue;
        const existingCharge = await this.findLedgerEntry(lessonId, userId, 'GROUP_CHARGE');
        if (!existingCharge) {
          await this.appendLedgerEntry({
            userId,
            delta: 0,
            kind: 'GROUP_CHARGE',
            scheduledLessonId: lessonId,
            note: null,
            amountMinor,
            currency,
          });
        }
      }
      return;
    }

    const existingCharges = await this.prisma.lessonBalanceLedger.findMany({
      where: { scheduledLessonId: lessonId, kind: 'GROUP_CHARGE' },
      select: { userId: true, amountMinor: true, currency: true },
    });
    for (const row of existingCharges) {
      const reversal = await this.findLedgerEntry(lessonId, row.userId, 'GROUP_CHARGE_REVERSAL');
      if (!reversal) {
        await this.appendLedgerEntry({
          userId: row.userId,
          delta: 0,
          kind: 'GROUP_CHARGE_REVERSAL',
          scheduledLessonId: lessonId,
          note: null,
          amountMinor: row.amountMinor ?? amountsByUser.get(row.userId) ?? totalMinor,
          currency: row.currency ?? currency,
        });
      }
    }
  }

  private findLedgerEntry(
    lessonId: string,
    userId: string,
    kind: LessonBalanceLedgerKind,
  ) {
    return this.prisma.lessonBalanceLedger.findUnique({
      where: {
        scheduledLessonId_userId_kind: {
          scheduledLessonId: lessonId,
          userId,
          kind,
        },
      },
    });
  }

  async syncLessonsAfterAutoComplete(lessonIds: string[]): Promise<void> {
    for (const id of lessonIds) {
      await this.syncLessonCharge(id);
    }
  }

  private async buildBalanceDto(studentId: string): Promise<StudentLessonBalanceDto> {
    const balanceRow = await this.ensureBalanceRow(studentId);
    const billingMode = billingModeToDto(balanceRow.billingMode);
    const platformSettings = await this.paymentSettings.getPaymentSettings();
    const paymentMethodSelection = validateStudentPaymentMethodSelection(
      platformSettings.enabledMethods,
      parseStudentPaymentMethodSelection(balanceRow.paymentMethodSelection),
    );
    const availableMethods = resolveStudentPaymentMethods(
      platformSettings.enabledMethods,
      paymentMethodSelection,
    );
    const packageOverrides = mergeOverridesWithPlatformPackages(
      platformSettings.config.packages,
      parsePackageOverrides(balanceRow.packageOverrides),
    );
    const platformManualInvoiceMethods = platformSettings.config.manualInvoiceMethods;
    const manualInvoiceSelection = validateStudentManualInvoiceSelection(
      platformManualInvoiceMethods,
      parseStudentManualInvoiceSelection(balanceRow.manualInvoiceSelection),
    );
    const configuredManualInvoiceMethods = platformManualInvoiceMethods.filter(
      isManualInvoiceMethodConfigured,
    );
    const manualInvoiceMethods =
      availableMethods.includes('manual_invoice')
        ? resolveStudentManualInvoiceMethods(configuredManualInvoiceMethods, manualInvoiceSelection)
        : [];
    const recent = await this.prisma.lessonBalanceLedger.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        delta: true,
        balanceAfter: true,
        kind: true,
        note: true,
        createdAt: true,
        scheduledLessonId: true,
        amountMinor: true,
        currency: true,
      },
    });
    const groupLessonsEnabled = platformSettings.config.groupLessons?.enabled ?? false;
    let lessonFormat: ReturnType<typeof lessonFormatToDto> | null = null;
    let groupMemberships: ReturnType<typeof toGroupMembershipSummaryDto>[] | undefined;
    if (groupLessonsEnabled) {
      const studentUser = await this.prisma.user.findUnique({
        where: { id: studentId },
        select: { lessonFormat: true },
      });
      if (studentUser) {
        lessonFormat = lessonFormatToDto(studentUser.lessonFormat);
      }
      const memberships = await this.prisma.studentGroupMember.findMany({
        where: { userId: studentId },
        orderBy: { sortOrder: 'asc' },
        select: {
          studentGroup: {
            select: {
              id: true,
              name: true,
              groupBillingMode: true,
              groupPriceMinor: true,
              groupCurrency: true,
              groupSplitMode: true,
              groupPayerUserId: true,
            },
          },
        },
      });
      groupMemberships = memberships.map(toGroupMembershipSummaryDto);
    }
    const balance = balanceRow.balance;
    const groupBalance = balanceRow.groupBalance;
    const pricing = await this.paymentSettings.resolvePricePerLessonMinor(studentId);
    const groupPricing = await this.paymentSettings.resolveGroupPricePerLessonMinor(studentId);
    const packages = resolveStudentPackages(
      platformSettings.config,
      {
        individualPricePerLessonMinor: pricing.resolvedPricePerLessonMinor,
        individualIsCustomPrice: pricing.isCustomPrice,
        groupPricePerLessonMinor: groupPricing.resolvedGroupPricePerLessonMinor,
        groupIsCustomPrice: groupPricing.isCustomGroupPrice,
      },
      billingMode,
      packageOverrides,
    );
    const showPerLessonPricing = billingMode !== 'packages';
    const showSelfServePackages = billingMode !== 'per_lesson';
    return {
      balance,
      isDebt: balance < 0,
      groupBalance,
      groupIsDebt: groupBalance < 0,
      availableMethods,
      enabledPaymentMethods: platformSettings.enabledMethods,
      paymentMethodSelection,
      manualInvoiceMethods,
      platformManualInvoiceMethods,
      manualInvoiceSelection,
      billingMode,
      packageOverrides,
      platformPackages: platformSettings.config.packages,
      showPerLessonPricing,
      showSelfServePackages,
      allowedCurrencies: platformSettings.config.allowedCurrencies,
      minPackageLessons: platformSettings.config.minPackageLessons,
      pricePerLessonMinor: pricing.pricePerLessonMinor,
      defaultPricePerLessonMinor: pricing.defaultPricePerLessonMinor,
      resolvedPricePerLessonMinor: pricing.resolvedPricePerLessonMinor,
      groupPricePerLessonMinor: groupPricing.groupPricePerLessonMinor,
      defaultGroupPricePerLessonMinor: groupPricing.defaultGroupPricePerLessonMinor,
      resolvedGroupPricePerLessonMinor: groupPricing.resolvedGroupPricePerLessonMinor,
      groupCurrency: groupPricing.groupCurrency,
      defaultCurrency: pricing.defaultCurrency,
      isCustomPrice: pricing.isCustomPrice,
      isCustomGroupPrice: groupPricing.isCustomGroupPrice,
      packages,
      recentLedger: recent.map(toLedgerDto),
      lemonSqueezyVariantCurrency: platformSettings.enabledMethods.includes('lemonsqueezy')
        ? getLemonSqueezyActiveVariantCurrency(platformSettings.config.lemonsqueezy)
        : null,
      lessonFormat: lessonFormat ?? null,
      groupMemberships: groupMemberships ?? [],
    };
  }

  private redactPricingForTeacher(dto: StudentLessonBalanceDto): StudentLessonBalanceDto {
    return {
      ...dto,
      showPerLessonPricing: false,
      showSelfServePackages: false,
      pricePerLessonMinor: null,
      defaultPricePerLessonMinor: 0,
      resolvedPricePerLessonMinor: 0,
      groupPricePerLessonMinor: null,
      defaultGroupPricePerLessonMinor: 0,
      resolvedGroupPricePerLessonMinor: 0,
      groupCurrency: dto.groupCurrency,
      isCustomPrice: false,
      isCustomGroupPrice: false,
      packages: [],
      platformPackages: [],
      packageOverrides: [],
      groupMemberships: (dto.groupMemberships ?? []).map((membership) => ({
        ...membership,
        groupPriceMinor: null,
        groupCurrency: null,
      })),
      recentLedger: dto.recentLedger.map((entry) => ({
        ...entry,
        amountMinor: null,
        currency: null,
      })),
    };
  }

  private async ensureBalanceRow(userId: string) {
    return this.prisma.studentLessonBalance.upsert({
      where: { userId },
      create: {
        userId,
        schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
        balance: 0,
        groupBalance: 0,
      },
      update: {},
      select: BALANCE_ROW_SELECT,
    });
  }

  private async appendLedgerEntry(params: {
    userId: string;
    delta: number;
    kind: LessonBalanceLedgerKind;
    scheduledLessonId?: string | null;
    paymentId?: string | null;
    createdById?: string | null;
    note: string | null;
    amountMinor?: number | null;
    currency?: string | null;
    creditTrack?: CreditTrack;
  }): Promise<void> {
    const creditTrack = params.creditTrack ?? 'individual';
    await this.prisma.$transaction(async (tx) => {
      const row = await tx.studentLessonBalance.upsert({
        where: { userId: params.userId },
        create: {
          userId: params.userId,
          schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
          balance: 0,
          groupBalance: 0,
        },
        update: {},
      });
      const currentBalance = creditTrack === 'group' ? row.groupBalance : row.balance;
      const nextBalance = currentBalance + params.delta;
      await tx.studentLessonBalance.update({
        where: { userId: params.userId },
        data:
          creditTrack === 'group'
            ? { groupBalance: nextBalance }
            : { balance: nextBalance },
      });
      try {
        await tx.lessonBalanceLedger.create({
          data: {
            userId: params.userId,
            schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
            delta: params.delta,
            balanceAfter: nextBalance,
            kind: params.kind,
            scheduledLessonId: params.scheduledLessonId ?? null,
            paymentId: params.paymentId ?? null,
            createdById: params.createdById ?? null,
            note: params.note,
            amountMinor: params.amountMinor ?? null,
            currency: params.currency ?? null,
          },
        });
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          return;
        }
        throw error;
      }
    });
  }

  private async assertStaffCanViewStudent(
    actor: { id: string; role: StaffRole },
    studentId: string,
  ): Promise<void> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true, teacherId: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }
    if (actor.role === 'TEACHER' && student.teacherId !== actor.id) {
      throw new ForbiddenException('You can only view your own students');
    }
  }
}

function toLedgerDto(row: {
  id: string;
  delta: number;
  balanceAfter: number;
  kind: string;
  note: string | null;
  createdAt: Date;
  scheduledLessonId: string | null;
  amountMinor?: number | null;
  currency?: string | null;
}): LessonBalanceLedgerEntryDto {
  return {
    id: row.id,
    delta: row.delta,
    balanceAfter: row.balanceAfter,
    kind: row.kind,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    scheduledLessonId: row.scheduledLessonId,
    amountMinor: row.amountMinor ?? null,
    currency: row.currency ?? null,
  };
}
