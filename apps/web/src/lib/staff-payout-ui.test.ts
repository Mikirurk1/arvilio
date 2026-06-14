import {
  staffCompensationModeLabel,
  staffPayFrequencyLabel,
  staffPayoutStatusBadgeVariant,
  staffPayoutStatusLabel,
  staffPayoutStatusTone,
} from './staff-payout-ui';

describe('staff-payout-ui', () => {
  it('maps payout status to labels and tones', () => {
    expect(staffPayoutStatusLabel('ok')).toBe('On track');
    expect(staffPayoutStatusLabel('due')).toBe('Due');
    expect(staffPayoutStatusLabel('overdue')).toBe('Overdue');
    expect(staffPayoutStatusTone('ok')).toBe('green');
    expect(staffPayoutStatusTone('due')).toBe('yellow');
    expect(staffPayoutStatusTone('overdue')).toBe('red');
  });

  it('maps payout status to Badge variants', () => {
    expect(staffPayoutStatusBadgeVariant('ok')).toBe('green');
    expect(staffPayoutStatusBadgeVariant('due')).toBe('amber');
    expect(staffPayoutStatusBadgeVariant('overdue')).toBe('rose');
  });

  it('labels compensation modes and pay frequency', () => {
    expect(staffCompensationModeLabel('per_lesson')).toBe('Per lesson');
    expect(staffCompensationModeLabel('salary')).toBe('Salary');
    expect(staffCompensationModeLabel('mixed')).toBe('Mixed');
    expect(staffPayFrequencyLabel('weekly')).toBe('Weekly');
    expect(staffPayFrequencyLabel('monthly')).toBe('Monthly');
  });
});
