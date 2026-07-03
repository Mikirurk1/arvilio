import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import { PrismaService, TenantPrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';
import type {
  PaymentCurrencyCode,
  RecordStaffPayoutRequestDto,
  ResolvedStaffCompensationDto,
  StaffCompensationProfileDto,
  StaffEarningsSectionDto,
  StaffEarningsTrendPointDto,
  StaffFinanceOverviewDto,
  StaffFinanceStaffRowDto,
  StaffPayoutDefaultsDto,
  StaffPayoutDto,
  StatsDateRange,
  StatsRange,
  UpdateStaffCompensationProfileRequestDto,
  UpdateStaffPayoutDefaultsRequestDto,
} from '@pkg/types';
import {
  parseStaffPayoutDefaults,
  resolveStaffCompensation,
  staffCompensationModeFromDto,
  staffCompensationModeToDto,
  staffPayFrequencyFromDto,
  staffPayFrequencyToDto,
  staffPayoutDefaultsToJson,
  utcDateKey,
} from '@pkg/types';
import { PaymentSettingsService } from './payment-settings.service';
import { computeTotalAccrualMinor } from '../shared/staff-accrual.util';
import { computeNextPayDate, computePayoutStatus } from '../shared/staff-payout-status.util';

const SETTINGS_ID = 'default';
/** Single-school seam: defaults live on PlatformSettings singleton; extract per-tenant SchoolPayrollSettings when SaaS ships. */
const STAFF_ROLES: UserRole[] = ['TEACHER', 'ADMIN', 'SUPER_ADMIN'];

@Injectable()
export class StaffPayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly paymentSettings: PaymentSettingsService,
    private readonly tenantPrisma: TenantPrismaService,
  ) {}

  /** Tenant-scoped client: StaffCompensationProfile/StaffPayout are auto-filtered by school (admin-only paths). */
  private get db() {
    return this.tenantPrisma.client;
  }

  async getDefaults(): Promise<StaffPayoutDefaultsDto> {
    const row = await this.ensureSettingsRow();
    const { config } = await this.paymentSettings.getRuntimePaymentSettings();
    return parseStaffPayoutDefaults(row.staffPayoutDefaults, config.defaultCurrency as PaymentCurrencyCode);
  }

  async updateDefaults(body: UpdateStaffPayoutDefaultsRequestDto): Promise<StaffPayoutDefaultsDto> {
    await this.ensureSettingsRow();
    const normalized = parseStaffPayoutDefaults(staffPayoutDefaultsToJson(body), body.defaultCurrency);
    await this.prisma.platformSettings.update({
      where: { id: SETTINGS_ID },
      data: { staffPayoutDefaults: staffPayoutDefaultsToJson(normalized) as object },
    });
    return normalized;
  }

  async getCompensationProfile(userId: string): Promise<StaffCompensationProfileDto> {
    await this.assertStaffUser(userId);
    const profile = await this.db.staffCompensationProfile.findUnique({ where: { userId } });
    return profile ? this.mapProfile(profile) : { userId };
  }

  async updateCompensationProfile(
    body: UpdateStaffCompensationProfileRequestDto,
  ): Promise<StaffCompensationProfileDto> {
    await this.assertStaffUser(body.userId);
    const data = {
      mode: body.mode ? staffCompensationModeToDto(body.mode) : null,
      perLessonRateMinor: body.perLessonRateMinor ?? null,
      salaryMinor: body.salaryMinor ?? null,
      currency: body.currency ?? null,
      payFrequency: body.payFrequency ? staffPayFrequencyToDto(body.payFrequency) : null,
      payDayOfWeek: body.payDayOfWeek ?? null,
      payDayOfMonth: body.payDayOfMonth ?? null,
      graceDays: body.graceDays ?? null,
    };
    const profile = await this.db.staffCompensationProfile.upsert({
      where: { userId: body.userId },
      create: {
        userId: body.userId,
        schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
        ...data,
      },
      update: data,
    });
    return this.mapProfile(profile);
  }

  async recordPayout(
    actorUserId: string,
    body: RecordStaffPayoutRequestDto,
  ): Promise<StaffPayoutDto> {
    await this.assertStaffUser(body.userId);
    if (body.amountMinor <= 0) {
      throw new BadRequestException('Payout amount must be positive');
    }
    const paidAt = new Date(body.paidAt);
    if (Number.isNaN(paidAt.getTime())) {
      throw new BadRequestException('Invalid payout date');
    }
    const row = await this.db.staffPayout.create({
      data: {
        userId: body.userId,
        schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
        amountMinor: body.amountMinor,
        currency: body.currency,
        paidAt,
        periodFrom: body.periodFrom ? new Date(body.periodFrom) : null,
        periodTo: body.periodTo ? new Date(body.periodTo) : null,
        note: body.note?.trim() || null,
        createdByUserId: actorUserId,
      },
      include: {
        user: { select: { displayName: true } },
        createdBy: { select: { displayName: true } },
      },
    });
    return this.mapPayout(row);
  }

  async listPayoutHistory(userId?: string, bounds?: StatsDateRange): Promise<StaffPayoutDto[]> {
    const page = await this.listPayoutHistoryPage({ userId, bounds, limit: 100 });
    return page.items;
  }

  async listPayoutHistoryPage(params: {
    userId?: string;
    bounds?: StatsDateRange;
    cursor?: string;
    limit?: number;
  }): Promise<{ items: StaffPayoutDto[]; hasMore: boolean; nextCursor: string | null }> {
    const limit = Math.min(Math.max(params.limit ?? 25, 1), 100);
    const cursor = params.cursor ? decodePayoutCursor(params.cursor) : null;
    const rows = await this.db.staffPayout.findMany({
      where: {
        ...(params.userId ? { userId: params.userId } : {}),
        ...(params.bounds
          ? {
              paidAt: {
                gte: new Date(params.bounds.from),
                lte: new Date(params.bounds.to),
              },
            }
          : {}),
        ...(cursor
          ? {
              OR: [
                { paidAt: { lt: cursor.paidAt } },
                { AND: [{ paidAt: cursor.paidAt }, { id: { lt: cursor.id } }] },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { displayName: true } },
        createdBy: { select: { displayName: true } },
      },
      orderBy: [{ paidAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });
    const hasMore = rows.length > limit;
    const slice = rows.slice(0, limit);
    const items = slice.map((row) => this.mapPayout(row));
    const last = items[items.length - 1];
    const nextCursor =
      hasMore && last ? encodePayoutCursor(last.paidAt, last.id) : null;
    return { items, hasMore, nextCursor };
  }

  async buildMyEarnings(
    userId: string,
    range: StatsRange,
    rangeBounds: StatsDateRange,
    rangeLabel: string,
  ): Promise<StaffEarningsSectionDto> {
    await this.assertStaffUser(userId);
    const compensation = await this.resolveCompensationForUser(userId);
    return this.buildEarningsSection(userId, compensation, rangeBounds, rangeLabel);
  }

  async buildFinanceOverview(
    range: StatsRange,
    rangeBounds: StatsDateRange,
    rangeLabel: string,
  ): Promise<StaffFinanceOverviewDto> {
    const defaults = await this.getDefaults();
    const staffUsers = await this.prisma.user.findMany({
      where: { role: { in: STAFF_ROLES } },
      select: { id: true, displayName: true, role: true },
      orderBy: { displayName: 'asc' },
    });

    const staffRows: StaffFinanceStaffRowDto[] = [];
    let totalAccrued = 0;
    let totalPaid = 0;

    for (const user of staffUsers) {
      const compensation = await this.resolveCompensationForUser(user.id, defaults);
      const summary = await this.summarizeStaffPeriod(user.id, compensation, rangeBounds);
      staffRows.push({
        userId: user.id,
        displayName: user.displayName,
        role: user.role.toLowerCase(),
        mode: compensation.mode,
        completedLessons: summary.completedLessons,
        accruedMinor: summary.accruedMinor,
        paidMinor: summary.paidMinor,
        outstandingMinor: summary.outstandingMinor,
        currency: compensation.currency,
        nextPayDate: summary.nextPayDate,
        payoutStatus: summary.payoutStatus,
      });
      totalAccrued += summary.accruedMinor;
      totalPaid += summary.paidMinor;
    }

    const trend = await this.buildSchoolTrend(rangeBounds, defaults);
    const recentPayouts = await this.listPayoutHistory(undefined, rangeBounds);

    return {
      range,
      rangeLabel,
      rangeBounds,
      currency: defaults.defaultCurrency,
      totalAccruedMinor: totalAccrued,
      totalPaidMinor: totalPaid,
      totalOutstandingMinor: Math.max(0, totalAccrued - totalPaid),
      staff: staffRows,
      trend,
      recentPayouts,
    };
  }

  private async buildEarningsSection(
    userId: string,
    compensation: ResolvedStaffCompensationDto,
    rangeBounds: StatsDateRange,
    rangeLabel: string,
  ): Promise<StaffEarningsSectionDto> {
    const summary = await this.summarizeStaffPeriod(userId, compensation, rangeBounds);
    const trend = await this.buildUserTrend(userId, compensation, rangeBounds);
    return {
      completedLessons: summary.completedLessons,
      lessonHours: summary.lessonHours,
      accruedMinor: summary.accruedMinor,
      paidMinor: summary.paidMinor,
      outstandingMinor: summary.outstandingMinor,
      currency: compensation.currency,
      mode: compensation.mode,
      perLessonRateMinor: compensation.perLessonRateMinor,
      salaryMinor: compensation.salaryMinor,
      payFrequency: compensation.payFrequency,
      nextPayDate: summary.nextPayDate,
      payoutStatus: summary.payoutStatus,
      trend,
    };
  }

  private async summarizeStaffPeriod(
    userId: string,
    compensation: ResolvedStaffCompensationDto,
    bounds: StatsDateRange,
  ) {
    const from = new Date(bounds.from);
    const to = new Date(bounds.to);
    const lessons = await this.db.scheduledLesson.findMany({
      where: {
        teacherId: userId,
        status: 'COMPLETED',
        date: { gte: utcDateKey(from), lte: utcDateKey(to) },
      },
      select: { duration: true },
    });
    const completedLessons = lessons.length;
    const lessonMinutes = lessons.reduce((sum, row) => sum + (row.duration ?? 0), 0);
    const accruedMinor = computeTotalAccrualMinor(
      compensation,
      { completedLessons, lessonMinutes },
      bounds.from,
      bounds.to,
    );
    const paidAgg = await this.db.staffPayout.aggregate({
      where: {
        userId,
        paidAt: { gte: from, lte: to },
      },
      _sum: { amountMinor: true },
    });
    const paidMinor = paidAgg._sum.amountMinor ?? 0;
    const outstandingMinor = Math.max(0, accruedMinor - paidMinor);
    const nextPayDate = computeNextPayDate(
      compensation.payFrequency,
      compensation.payDayOfWeek,
      compensation.payDayOfMonth,
    );
    return {
      completedLessons,
      lessonHours: Math.round((lessonMinutes / 60) * 10) / 10,
      accruedMinor,
      paidMinor,
      outstandingMinor,
      nextPayDate: nextPayDate.toISOString(),
      payoutStatus: computePayoutStatus(outstandingMinor, nextPayDate, compensation.graceDays),
    };
  }

  private async buildUserTrend(
    userId: string,
    compensation: ResolvedStaffCompensationDto,
    bounds: StatsDateRange,
  ): Promise<StaffEarningsTrendPointDto[]> {
    const from = startOfUtcDay(new Date(bounds.from));
    const to = startOfUtcDay(new Date(bounds.to));
    const points: StaffEarningsTrendPointDto[] = [];
    let cursor = new Date(from);
    while (cursor <= to) {
      const weekEnd = addUtcDays(cursor, 6);
      const sliceEnd = weekEnd > to ? to : weekEnd;
      const sliceBounds = {
        from: cursor.toISOString(),
        to: sliceEnd.toISOString(),
      };
      const summary = await this.summarizeStaffPeriod(userId, compensation, sliceBounds);
      points.push({
        label: utcDateKey(cursor).slice(5),
        accruedMinor: summary.accruedMinor,
        paidMinor: summary.paidMinor,
      });
      cursor = addUtcDays(sliceEnd, 1);
    }
    return points.slice(-12);
  }

  private async buildSchoolTrend(
    bounds: StatsDateRange,
    defaults: StaffPayoutDefaultsDto,
  ): Promise<StaffEarningsTrendPointDto[]> {
    const staffUsers = await this.prisma.user.findMany({
      where: { role: { in: STAFF_ROLES } },
      select: { id: true },
    });
    const from = startOfUtcDay(new Date(bounds.from));
    const to = startOfUtcDay(new Date(bounds.to));
    const points: StaffEarningsTrendPointDto[] = [];
    let cursor = new Date(from);
    while (cursor <= to) {
      const weekEnd = addUtcDays(cursor, 6);
      const sliceEnd = weekEnd > to ? to : weekEnd;
      const sliceBounds = {
        from: cursor.toISOString(),
        to: sliceEnd.toISOString(),
      };
      let accruedMinor = 0;
      let paidMinor = 0;
      for (const user of staffUsers) {
        const compensation = await this.resolveCompensationForUser(user.id, defaults);
        const summary = await this.summarizeStaffPeriod(user.id, compensation, sliceBounds);
        accruedMinor += summary.accruedMinor;
        paidMinor += summary.paidMinor;
      }
      points.push({
        label: utcDateKey(cursor).slice(5),
        accruedMinor,
        paidMinor,
      });
      cursor = addUtcDays(sliceEnd, 1);
    }
    return points.slice(-12);
  }

  private async resolveCompensationForUser(
    userId: string,
    defaults?: StaffPayoutDefaultsDto,
  ): Promise<ResolvedStaffCompensationDto> {
    const baseDefaults = defaults ?? (await this.getDefaults());
    const profile = await this.db.staffCompensationProfile.findUnique({ where: { userId } });
    return resolveStaffCompensation(baseDefaults, profile ? this.mapProfile(profile) : { userId });
  }

  private async assertStaffUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || !STAFF_ROLES.includes(user.role)) {
      throw new BadRequestException('User is not eligible for staff payouts');
    }
  }

  private async ensureSettingsRow() {
    return this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    });
  }

  private mapProfile(row: {
    userId: string;
    mode: string | null;
    perLessonRateMinor: number | null;
    salaryMinor: number | null;
    currency: string | null;
    payFrequency: string | null;
    payDayOfWeek: number | null;
    payDayOfMonth: number | null;
    graceDays: number | null;
  }): StaffCompensationProfileDto {
    return {
      userId: row.userId,
      mode: row.mode ? staffCompensationModeFromDto(row.mode.toLowerCase()) : null,
      perLessonRateMinor: row.perLessonRateMinor,
      salaryMinor: row.salaryMinor,
      currency: (row.currency as PaymentCurrencyCode | null) ?? null,
      payFrequency: row.payFrequency
        ? staffPayFrequencyFromDto(row.payFrequency.toLowerCase())
        : null,
      payDayOfWeek: row.payDayOfWeek,
      payDayOfMonth: row.payDayOfMonth,
      graceDays: row.graceDays,
    };
  }

  private mapPayout(row: {
    id: string;
    userId: string;
    amountMinor: number;
    currency: string;
    paidAt: Date;
    periodFrom: Date | null;
    periodTo: Date | null;
    note: string | null;
    createdByUserId: string;
    createdAt: Date;
    user: { displayName: string };
    createdBy: { displayName: string };
  }): StaffPayoutDto {
    return {
      id: row.id,
      userId: row.userId,
      userDisplayName: row.user.displayName,
      amountMinor: row.amountMinor,
      currency: row.currency as PaymentCurrencyCode,
      paidAt: row.paidAt.toISOString(),
      periodFrom: row.periodFrom?.toISOString() ?? null,
      periodTo: row.periodTo?.toISOString() ?? null,
      note: row.note,
      createdByUserId: row.createdByUserId,
      createdByDisplayName: row.createdBy.displayName,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function encodePayoutCursor(paidAt: string, id: string): string {
  return `${paidAt}|${id}`;
}

function decodePayoutCursor(cursor: string): { paidAt: Date; id: string } | null {
  const separatorIndex = cursor.lastIndexOf('|');
  if (separatorIndex <= 0) return null;
  const paidAt = new Date(cursor.slice(0, separatorIndex));
  const id = cursor.slice(separatorIndex + 1);
  if (Number.isNaN(paidAt.getTime()) || !id) return null;
  return { paidAt, id };
}
