import type { TranslateFn } from './cms/nav-i18n';
import type { StaffPayoutStatusDto } from '@pkg/types';

export function staffPayoutStatusLabel(status: StaffPayoutStatusDto, t?: TranslateFn): string {
  if (status === 'due') return t?.('staff.payout.due') ?? 'Due';
  if (status === 'overdue') return t?.('staff.payout.overdue') ?? 'Overdue';
  return t?.('staff.payout.onTrack') ?? 'On track';
}

export function staffPayoutStatusTone(
  status: StaffPayoutStatusDto,
): 'green' | 'yellow' | 'red' {
  if (status === 'due') return 'yellow';
  if (status === 'overdue') return 'red';
  return 'green';
}

export function staffPayoutStatusBadgeVariant(
  status: StaffPayoutStatusDto,
): 'green' | 'amber' | 'rose' {
  const tone = staffPayoutStatusTone(status);
  if (tone === 'yellow') return 'amber';
  if (tone === 'red') return 'rose';
  return 'green';
}

export function staffCompensationModeLabel(mode: string, t?: TranslateFn): string {
  if (mode === 'salary') return t?.('staff.compensation.salary') ?? 'Salary';
  if (mode === 'mixed') return t?.('staff.compensation.mixed') ?? 'Mixed';
  return t?.('staff.compensation.perLesson') ?? 'Per lesson';
}

export function staffPayFrequencyLabel(frequency: string, t?: TranslateFn): string {
  if (t) {
    return frequency === 'weekly'
      ? t('staff.compensation.frequency.weekly')
      : t('staff.compensation.frequency.monthly');
  }
  return frequency === 'weekly' ? 'Weekly' : 'Monthly';
}

export function formatStaffPayDayLabel(
  payFrequency: string,
  payDayOfWeek: number,
  payDayOfMonth: number,
  t?: TranslateFn,
): string {
  if (payFrequency === 'weekly') {
    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return weekdays[payDayOfWeek] ?? 'Monday';
  }
  if (t) {
    return t('system.payouts.fields.payDayMonthOption', { day: String(payDayOfMonth) });
  }
  return `Day ${payDayOfMonth}`;
}
