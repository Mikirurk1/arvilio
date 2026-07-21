/**
 * Thin leftovers — 2.14 Help encyclopedia + 3K.8 offer↔payment packages.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

const PKG = {
  id: 'pkg-cross-10',
  lessons: 10,
  label: 'CrossCheck Pack 10',
  description: 'E2E cross-check package',
  currency: 'UAH',
  amountMinor: 500000,
  pricePerLessonMinor: 50000,
  creditTrack: 'INDIVIDUAL',
};

test.describe('2.14 Help encyclopedia', () => {
  test.use({ storageState: STATE.student });

  test('Header ? opens Help track (not ProductTour reset)', async ({ page }) => {
    await suppressTour(page);
    await page.addInitScript(() => {
      try {
        localStorage.setItem('arvi.learningMode', 'on');
      } catch {
        /* private mode */
      }
    });
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 12_000 });

    const help = page.getByRole('button', { name: /^(help|довідка)$/i });
    if (!(await help.isVisible({ timeout: 6_000 }).catch(() => false))) {
      test.skip(true, 'Help button hidden (learning mode off / guest)');
      return;
    }
    await help.click();

    const card = page.locator('[data-tour-card]');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-tour-mode="help"]').first()).toBeVisible({
      timeout: 8_000,
    });
    // Student help dashboard copy (first step titles)
    await expect(
      card.getByText(/your next step|quick actions|help|dashboard/i).first(),
    ).toBeVisible({ timeout: 8_000 });

    const next = page.getByRole('button', { name: /^next$/i });
    if (await next.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await next.click();
      await expect(card).toBeVisible();
      await expect(page.locator('[data-tour-mode="help"]').first()).toBeVisible();
    }
  });
});

test.describe('3K.8 offer ↔ payment packages', () => {
  test.use({ storageState: STATE.student });

  test('same package label on /offer and /payment (mocked)', async ({ page }) => {
    await page.route('**/api/school/public-offer', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schoolName: 'E2E School',
          packages: [PKG],
          enabledOnlineMethods: ['stripe'],
          allowedProductsNote: 'Credits only',
        }),
      });
    });

    await page.route('**/api/graphql', async (route) => {
      const post = route.request().postData() ?? '';
      if (post.includes('myLessonBalance') || post.includes('MyLessonBalance')) {
        await route.fulfill({
          json: {
            data: {
              myLessonBalance: {
                balance: 2,
                isDebt: false,
                groupBalance: 0,
                groupIsDebt: false,
                lessonFormat: 'individual_only',
                showSelfServePackages: true,
                showPerLessonPricing: true,
                billingMode: 'hybrid',
                packages: [PKG],
                platformPackages: [PKG],
                packageOverrides: [],
                availableMethods: ['stripe', 'manual_invoice'],
                enabledPaymentMethods: ['stripe', 'manual_invoice'],
                paymentMethodSelection: {
                  allowedMethods: ['stripe', 'manual_invoice'],
                  restrictToAllowlistOnly: false,
                },
                manualInvoiceMethods: [],
                platformManualInvoiceMethods: [],
                manualInvoiceSelection: { allowedMethodIds: [], defaultMethodId: null },
                allowedCurrencies: ['UAH'],
                minPackageLessons: 1,
                pricePerLessonMinor: 50000,
                defaultPricePerLessonMinor: 50000,
                resolvedPricePerLessonMinor: 50000,
                groupPricePerLessonMinor: null,
                defaultGroupPricePerLessonMinor: 0,
                resolvedGroupPricePerLessonMinor: 0,
                groupCurrency: 'UAH',
                defaultCurrency: 'UAH',
                isCustomPrice: false,
                isCustomGroupPrice: false,
                recentLedger: [],
                lemonSqueezyVariantCurrency: null,
                groupMemberships: [],
              },
            },
          },
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/offer');
    await expect(page.getByText(/CrossCheck Pack 10/i)).toBeVisible({ timeout: 12_000 });

    await page.goto('/payment');
    await expect(page.locator('main')).toBeVisible({ timeout: 12_000 });
    await expect(page.getByText(/CrossCheck Pack 10/i).first()).toBeVisible({ timeout: 12_000 });
  });
});
