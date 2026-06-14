import type { StaffPayoutStatusDto } from '@pkg/types';

export function staffPayoutStatusLabel(status: StaffPayoutStatusDto): string {
  if (status === 'due') return 'Due';
  if (status === 'overdue') return 'Overdue';
  return 'On track';
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

export function staffCompensationModeLabel(mode: string): string {
  if (mode === 'salary') return 'Salary';
  if (mode === 'mixed') return 'Mixed';
  return 'Per lesson';
}

export function staffPayFrequencyLabel(frequency: string): string {
  return frequency === 'weekly' ? 'Weekly' : 'Monthly';
}

export function formatStaffPayDayLabel(
  payFrequency: string,
  payDayOfWeek: number,
  payDayOfMonth: number,
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
  return `Day ${payDayOfMonth}`;
}
