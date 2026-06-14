import type { PaymentCurrencyCode } from './payment-billing';
import type { StatsDateRange, StatsRange } from './statistics-dashboard';

export type StaffCompensationModeDto = 'per_lesson' | 'salary' | 'mixed';
export type StaffPayFrequencyDto = 'weekly' | 'monthly';
export type StaffPayoutStatusDto = 'ok' | 'due' | 'overdue';

export type StaffPayoutDefaultsDto = {
  defaultMode: StaffCompensationModeDto;
  defaultPerLessonRateMinor: number;
  defaultSalaryMinor: number;
  defaultCurrency: PaymentCurrencyCode;
  defaultPayFrequency: StaffPayFrequencyDto;
  defaultPayDayOfWeek: number;
  defaultPayDayOfMonth: number;
  defaultGraceDays: number;
};

export const DEFAULT_STAFF_PAYOUT_DEFAULTS: StaffPayoutDefaultsDto = {
  defaultMode: 'per_lesson',
  defaultPerLessonRateMinor: 0,
  defaultSalaryMinor: 0,
  defaultCurrency: 'UAH',
  defaultPayFrequency: 'monthly',
  defaultPayDayOfWeek: 5,
  defaultPayDayOfMonth: 1,
  defaultGraceDays: 3,
};

export type ResolvedStaffCompensationDto = {
  userId: string;
  mode: StaffCompensationModeDto;
  perLessonRateMinor: number;
  salaryMinor: number;
  currency: PaymentCurrencyCode;
  payFrequency: StaffPayFrequencyDto;
  payDayOfWeek: number;
  payDayOfMonth: number;
  graceDays: number;
};

export type StaffCompensationProfileDto = {
  userId: string;
  mode?: StaffCompensationModeDto | null;
  perLessonRateMinor?: number | null;
  salaryMinor?: number | null;
  currency?: PaymentCurrencyCode | null;
  payFrequency?: StaffPayFrequencyDto | null;
  payDayOfWeek?: number | null;
  payDayOfMonth?: number | null;
  graceDays?: number | null;
};

export type UpdateStaffCompensationProfileRequestDto = StaffCompensationProfileDto;

export type UpdateStaffPayoutDefaultsRequestDto = StaffPayoutDefaultsDto;

export type RecordStaffPayoutRequestDto = {
  userId: string;
  amountMinor: number;
  currency: PaymentCurrencyCode;
  paidAt: string;
  periodFrom?: string | null;
  periodTo?: string | null;
  note?: string | null;
};

export type StaffPayoutDto = {
  id: string;
  userId: string;
  userDisplayName: string;
  amountMinor: number;
  currency: PaymentCurrencyCode;
  paidAt: string;
  periodFrom?: string | null;
  periodTo?: string | null;
  note?: string | null;
  createdByUserId: string;
  createdByDisplayName: string;
  createdAt: string;
};

export type StaffPayoutHistoryPageDto = {
  items: StaffPayoutDto[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type StaffEarningsTrendPointDto = {
  label: string;
  accruedMinor: number;
  paidMinor: number;
};

export type StaffEarningsSectionDto = {
  completedLessons: number;
  lessonHours: number;
  accruedMinor: number;
  paidMinor: number;
  outstandingMinor: number;
  currency: PaymentCurrencyCode;
  mode: StaffCompensationModeDto;
  perLessonRateMinor: number;
  salaryMinor: number;
  payFrequency: StaffPayFrequencyDto;
  nextPayDate: string;
  payoutStatus: StaffPayoutStatusDto;
  trend: StaffEarningsTrendPointDto[];
};

export type StaffFinanceStaffRowDto = {
  userId: string;
  displayName: string;
  role: string;
  mode: StaffCompensationModeDto;
  completedLessons: number;
  accruedMinor: number;
  paidMinor: number;
  outstandingMinor: number;
  currency: PaymentCurrencyCode;
  nextPayDate: string;
  payoutStatus: StaffPayoutStatusDto;
};

export type StaffFinanceOverviewDto = {
  range: StatsRange;
  rangeLabel: string;
  rangeBounds: StatsDateRange;
  currency: PaymentCurrencyCode;
  totalAccruedMinor: number;
  totalPaidMinor: number;
  totalOutstandingMinor: number;
  staff: StaffFinanceStaffRowDto[];
  trend: StaffEarningsTrendPointDto[];
  recentPayouts: StaffPayoutDto[];
};

export function staffCompensationModeFromDto(
  value: string | null | undefined,
): StaffCompensationModeDto {
  if (value === 'salary') return 'salary';
  if (value === 'mixed') return 'mixed';
  return 'per_lesson';
}

export function staffCompensationModeToDto(
  value: StaffCompensationModeDto,
): 'PER_LESSON' | 'SALARY' | 'MIXED' {
  if (value === 'salary') return 'SALARY';
  if (value === 'mixed') return 'MIXED';
  return 'PER_LESSON';
}

export function staffPayFrequencyFromDto(
  value: string | null | undefined,
): StaffPayFrequencyDto {
  return value === 'weekly' ? 'weekly' : 'monthly';
}

export function staffPayFrequencyToDto(
  value: StaffPayFrequencyDto,
): 'WEEKLY' | 'MONTHLY' {
  return value === 'weekly' ? 'WEEKLY' : 'MONTHLY';
}

export function parseStaffPayoutDefaults(
  raw: unknown,
  fallbackCurrency: PaymentCurrencyCode = 'UAH',
): StaffPayoutDefaultsDto {
  const base = {
    ...DEFAULT_STAFF_PAYOUT_DEFAULTS,
    defaultCurrency: fallbackCurrency,
  };
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Record<string, unknown>;
  const mode =
    obj['defaultMode'] === 'salary'
      ? 'salary'
      : obj['defaultMode'] === 'mixed'
        ? 'mixed'
        : 'per_lesson';
  const frequency = obj['defaultPayFrequency'] === 'weekly' ? 'weekly' : 'monthly';
  const currencyRaw =
    typeof obj['defaultCurrency'] === 'string' ? obj['defaultCurrency'].trim().toUpperCase() : fallbackCurrency;
  return {
    defaultMode: mode,
    defaultPerLessonRateMinor:
      typeof obj['defaultPerLessonRateMinor'] === 'number'
        ? Math.max(0, Math.round(obj['defaultPerLessonRateMinor']))
        : base.defaultPerLessonRateMinor,
    defaultSalaryMinor:
      typeof obj['defaultSalaryMinor'] === 'number'
        ? Math.max(0, Math.round(obj['defaultSalaryMinor']))
        : base.defaultSalaryMinor,
    defaultCurrency: (['UAH', 'USD', 'EUR', 'GBP', 'PLN'] as const).includes(
      currencyRaw as PaymentCurrencyCode,
    )
      ? (currencyRaw as PaymentCurrencyCode)
      : fallbackCurrency,
    defaultPayFrequency: frequency,
    defaultPayDayOfWeek:
      typeof obj['defaultPayDayOfWeek'] === 'number'
        ? Math.min(6, Math.max(0, Math.round(obj['defaultPayDayOfWeek'])))
        : base.defaultPayDayOfWeek,
    defaultPayDayOfMonth:
      typeof obj['defaultPayDayOfMonth'] === 'number'
        ? Math.min(28, Math.max(1, Math.round(obj['defaultPayDayOfMonth'])))
        : base.defaultPayDayOfMonth,
    defaultGraceDays:
      typeof obj['defaultGraceDays'] === 'number'
        ? Math.max(0, Math.round(obj['defaultGraceDays']))
        : base.defaultGraceDays,
  };
}

export function staffPayoutDefaultsToJson(
  settings: StaffPayoutDefaultsDto,
): Record<string, unknown> {
  return {
    defaultMode: settings.defaultMode,
    defaultPerLessonRateMinor: settings.defaultPerLessonRateMinor,
    defaultSalaryMinor: settings.defaultSalaryMinor,
    defaultCurrency: settings.defaultCurrency,
    defaultPayFrequency: settings.defaultPayFrequency,
    defaultPayDayOfWeek: settings.defaultPayDayOfWeek,
    defaultPayDayOfMonth: settings.defaultPayDayOfMonth,
    defaultGraceDays: settings.defaultGraceDays,
  };
}

export function resolveStaffCompensation(
  defaults: StaffPayoutDefaultsDto,
  profile: StaffCompensationProfileDto | null | undefined,
): ResolvedStaffCompensationDto {
  const userId = profile?.userId ?? '';
  return {
    userId,
    mode: profile?.mode ?? defaults.defaultMode,
    perLessonRateMinor: profile?.perLessonRateMinor ?? defaults.defaultPerLessonRateMinor,
    salaryMinor: profile?.salaryMinor ?? defaults.defaultSalaryMinor,
    currency: profile?.currency ?? defaults.defaultCurrency,
    payFrequency: profile?.payFrequency ?? defaults.defaultPayFrequency,
    payDayOfWeek: profile?.payDayOfWeek ?? defaults.defaultPayDayOfWeek,
    payDayOfMonth: profile?.payDayOfMonth ?? defaults.defaultPayDayOfMonth,
    graceDays: profile?.graceDays ?? defaults.defaultGraceDays,
  };
}
