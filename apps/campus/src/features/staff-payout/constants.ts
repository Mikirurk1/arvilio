import {
  PAYMENT_CURRENCY_OPTIONS,
  type PaymentCurrencyCode,
  type StaffCompensationModeDto,
  type StaffPayFrequencyDto,
  type StatsRange,
} from '@pkg/types';
import { staffCompensationModeLabel, staffPayFrequencyLabel } from '../../lib/staff-payout-ui';

export const STAFF_FINANCE_RANGE_OPTIONS: Array<{ value: StatsRange; label: string }> = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
];

export const STAFF_COMPENSATION_MODE_OPTIONS: StaffCompensationModeDto[] = [
  'per_lesson',
  'salary',
  'mixed',
];

export const STAFF_PAY_FREQUENCY_OPTIONS: StaffPayFrequencyDto[] = ['weekly', 'monthly'];

export const STAFF_PAY_WEEKDAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

export const STAFF_PAY_MONTH_DAY_OPTIONS = Array.from({ length: 28 }, (_, index) => index + 1);

export const STAFF_PAYOUT_CURRENCY_OPTIONS: PaymentCurrencyCode[] = [...PAYMENT_CURRENCY_OPTIONS];

export function staffCompensationModeSelectOptions() {
  return STAFF_COMPENSATION_MODE_OPTIONS.map((mode) => ({
    value: mode,
    label: staffCompensationModeLabel(mode),
  }));
}

export function staffPayFrequencySelectOptions() {
  return STAFF_PAY_FREQUENCY_OPTIONS.map((frequency) => ({
    value: frequency,
    label: staffPayFrequencyLabel(frequency),
  }));
}
