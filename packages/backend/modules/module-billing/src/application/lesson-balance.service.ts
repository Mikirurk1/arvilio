import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { LessonBalanceLedgerKind } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import type {
  AdjustStudentLessonBalanceRequestDto,
  LessonBalanceLedgerEntryDto,
  StudentLessonBalanceDto,
  UpdateStudentLessonBillingRequestDto,
} from '@pkg/types';
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

type StaffRole = 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
const BALANCE_ROW_SELECT = {
  userId: true,
  balance: true,
  pricePerLessonMinor: true,
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
    return this.buildBalanceDto(studentId);
  }

  async updateStudentPricing(
    actor: { id: string; role: StaffRole },
    studentId: string,
    pricePerLessonMinor: number | null,
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
    await this.ensureBalanceRow(studentId);
    await this.prisma.studentLessonBalance.update({
      where: { userId: studentId },
      data: { pricePerLessonMinor },
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
    await this.appendLedgerEntry({
      userId: body.studentId,
      delta: lessons,
      kind: 'MANUAL_CREDIT',
      createdById: actor.id,
      note: body.note?.trim() || null,
    });
    return this.buildBalanceDto(body.studentId);
  }

  async grantPurchaseLessons(params: {
    userId: string;
    lessons: number;
    paymentId: string;
  }): Promise<void> {
    if (params.lessons <= 0) return;
    await this.appendLedgerEntry({
      userId: params.userId,
      delta: params.lessons,
      kind: 'PURCHASE',
      paymentId: params.paymentId,
      note: null,
    });
  }

  async syncLessonCharge(lessonId: string): Promise<void> {
    const lesson = await this.prisma.scheduledLesson.findUnique({
      where: { id: lessonId },
      select: { id: true, studentId: true, status: true, credited: true },
    });
    if (!lesson) return;

    const charge = shouldChargeLesson(lesson.status, lesson.credited);
    const consumption = await this.prisma.lessonBalanceLedger.findUnique({
      where: {
        scheduledLessonId_kind: {
          scheduledLessonId: lessonId,
          kind: 'CONSUMPTION',
        },
      },
    });

    if (charge && !consumption) {
      await this.appendLedgerEntry({
        userId: lesson.studentId,
        delta: -1,
        kind: 'CONSUMPTION',
        scheduledLessonId: lessonId,
        note: null,
      });
      return;
    }

    if (!charge && consumption) {
      const reversal = await this.prisma.lessonBalanceLedger.findUnique({
        where: {
          scheduledLessonId_kind: {
            scheduledLessonId: lessonId,
            kind: 'REVERSAL',
          },
        },
      });
      if (!reversal) {
        await this.appendLedgerEntry({
          userId: lesson.studentId,
          delta: 1,
          kind: 'REVERSAL',
          scheduledLessonId: lessonId,
          note: null,
        });
      }
    }
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
      },
    });
    const balance = balanceRow.balance;
    const pricing = await this.paymentSettings.resolvePricePerLessonMinor(studentId);
    const packages = resolveStudentPackages(
      platformSettings.config,
      pricing.resolvedPricePerLessonMinor,
      pricing.isCustomPrice,
      billingMode,
      packageOverrides,
    );
    const showPerLessonPricing = billingMode !== 'packages';
    const showSelfServePackages = billingMode !== 'per_lesson';
    return {
      balance,
      isDebt: balance < 0,
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
      defaultCurrency: pricing.defaultCurrency,
      isCustomPrice: pricing.isCustomPrice,
      packages,
      recentLedger: recent.map(toLedgerDto),
      lemonSqueezyVariantCurrency: platformSettings.enabledMethods.includes('lemonsqueezy')
        ? getLemonSqueezyActiveVariantCurrency(platformSettings.config.lemonsqueezy)
        : null,
    };
  }

  private async ensureBalanceRow(userId: string) {
    return this.prisma.studentLessonBalance.upsert({
      where: { userId },
      create: { userId, balance: 0 },
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
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const row = await tx.studentLessonBalance.upsert({
        where: { userId: params.userId },
        create: { userId: params.userId, balance: 0 },
        update: {},
      });
      const nextBalance = row.balance + params.delta;
      await tx.studentLessonBalance.update({
        where: { userId: params.userId },
        data: { balance: nextBalance },
      });
      try {
        await tx.lessonBalanceLedger.create({
          data: {
            userId: params.userId,
            delta: params.delta,
            balanceAfter: nextBalance,
            kind: params.kind,
            scheduledLessonId: params.scheduledLessonId ?? null,
            paymentId: params.paymentId ?? null,
            createdById: params.createdById ?? null,
            note: params.note,
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
}): LessonBalanceLedgerEntryDto {
  return {
    id: row.id,
    delta: row.delta,
    balanceAfter: row.balanceAfter,
    kind: row.kind,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    scheduledLessonId: row.scheduledLessonId,
  };
}
