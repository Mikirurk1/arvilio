import {
  buildOrderSummary,
  filterCheckoutMethodsForPackage,
  formatCheckoutAmount,
  getUnavailableCheckoutReason,
} from './checkout-display';
import { providerSupportsCheckoutCurrency } from '@pkg/types';

describe('checkout-display', () => {
  it('formats minor units with currency code', () => {
    expect(formatCheckoutAmount(450000, 'UAH')).toBe('4500.00 UAH');
  });

  it('filters checkout methods by package currency', () => {
    const methods = filterCheckoutMethodsForPackage(['stripe', 'liqpay', 'lemonsqueezy'], 'GBP', 'USD');
    expect(methods).toEqual(['stripe']);
  });

  it('builds order summary from resolved package', () => {
    const summary = buildOrderSummary({
      id: 'p1',
      label: '10 lessons',
      lessons: 10,
      currency: 'UAH',
      amountMinor: 450000,
      pricePerLessonMinor: 45000,
      isCustomPrice: false,
      lessonsLocked: false,
      creditTrack: 'individual',
    });
    expect(summary.amountLabel).toBe('4500.00 UAH');
    expect(summary.balanceAfterLabel).toContain('+10 lessons');
  });
});

describe('providerSupportsCheckoutCurrency', () => {
  it('matches Lemon Squeezy to configured variant currency only', () => {
    expect(
      providerSupportsCheckoutCurrency('lemonsqueezy', 'USD', {
        lemonSqueezyVariantCurrency: 'USD',
      }),
    ).toBe(true);
    expect(
      providerSupportsCheckoutCurrency('lemonsqueezy', 'UAH', {
        lemonSqueezyVariantCurrency: 'USD',
      }),
    ).toBe(false);
  });

  it('explains unavailable methods for students', () => {
    expect(getUnavailableCheckoutReason('liqpay', 'GBP')).toContain('GBP');
  });
});
