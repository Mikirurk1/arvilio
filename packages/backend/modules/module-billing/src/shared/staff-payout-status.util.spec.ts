import { computeNextPayDate, computePayoutStatus } from './staff-payout-status.util';

describe('staff-payout-status.util', () => {
  it('finds next weekly pay date after reference day', () => {
    const next = computeNextPayDate('weekly', 5, 1, new Date('2026-06-02T12:00:00.000Z'));
    expect(next.toISOString()).toBe('2026-06-05T00:00:00.000Z');
  });

  it('finds next monthly pay date in the same or following month', () => {
    const next = computeNextPayDate('monthly', 5, 10, new Date('2026-06-02T12:00:00.000Z'));
    expect(next.toISOString()).toBe('2026-06-10T00:00:00.000Z');

    const rolled = computeNextPayDate('monthly', 5, 1, new Date('2026-06-02T12:00:00.000Z'));
    expect(rolled.toISOString()).toBe('2026-07-01T00:00:00.000Z');
  });

  it('returns ok when no outstanding balance', () => {
    expect(
      computePayoutStatus(0, new Date('2026-06-01T00:00:00.000Z'), 3, new Date('2026-06-10T00:00:00.000Z')),
    ).toBe('ok');
  });

  it('returns ok before pay date with outstanding balance', () => {
    expect(
      computePayoutStatus(
        10000,
        new Date('2026-06-10T00:00:00.000Z'),
        3,
        new Date('2026-06-09T00:00:00.000Z'),
      ),
    ).toBe('ok');
  });

  it('returns due on pay date through grace window', () => {
    expect(
      computePayoutStatus(
        10000,
        new Date('2026-06-10T00:00:00.000Z'),
        3,
        new Date('2026-06-10T00:00:00.000Z'),
      ),
    ).toBe('due');
    expect(
      computePayoutStatus(
        10000,
        new Date('2026-06-10T00:00:00.000Z'),
        3,
        new Date('2026-06-13T00:00:00.000Z'),
      ),
    ).toBe('due');
  });

  it('returns overdue after grace window', () => {
    expect(
      computePayoutStatus(
        10000,
        new Date('2026-06-10T00:00:00.000Z'),
        3,
        new Date('2026-06-14T00:00:00.000Z'),
      ),
    ).toBe('overdue');
  });
});
