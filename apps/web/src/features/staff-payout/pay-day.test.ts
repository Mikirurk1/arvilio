import {
  PAY_DAY_OF_MONTH_DATE_MAX,
  PAY_DAY_OF_MONTH_DATE_MIN,
  payDayOfMonthFromDateValue,
  payDayOfMonthToDateValue,
} from './pay-day';

describe('pay-day helpers', () => {
  it('maps day of month to February anchor date', () => {
    expect(payDayOfMonthToDateValue(1)).toBe('2000-02-01');
    expect(payDayOfMonthToDateValue(15)).toBe('2000-02-15');
    expect(payDayOfMonthToDateValue(28)).toBe('2000-02-28');
    expect(payDayOfMonthToDateValue(31)).toBe('2000-02-28');
  });

  it('extracts day of month from date value', () => {
    expect(payDayOfMonthFromDateValue('2000-02-07')).toBe(7);
    expect(payDayOfMonthFromDateValue('2000-02-28')).toBe(28);
    expect(payDayOfMonthFromDateValue('')).toBe(1);
    expect(payDayOfMonthFromDateValue('invalid')).toBe(1);
  });

  it('exposes min/max for date picker bounds', () => {
    expect(PAY_DAY_OF_MONTH_DATE_MIN).toBe('2000-02-01');
    expect(PAY_DAY_OF_MONTH_DATE_MAX).toBe('2000-02-28');
  });
});
