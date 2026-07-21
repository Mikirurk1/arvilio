/**
 * АУДИТ Етап 6 — 6.15 System deep saves (GraphQL/REST mock).
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.admin });

test.beforeEach(async ({ page }) => {
  await suppressTour(page);
});

async function openSystemTab(page: Page, name: RegExp) {
  await page.goto('/system');
  await expect(page.locator('main').first()).toBeVisible({ timeout: 12_000 });
  const tab = page
    .getByRole('tab', { name })
    .or(page.getByRole('button', { name }))
    .first();
  if (!(await tab.isVisible({ timeout: 6_000 }).catch(() => false))) {
    test.skip(true, `No tab matching ${name}`);
    return false;
  }
  await tab.click({ force: true });
  return true;
}

test.describe('6.15 System deep saves (mocked)', () => {
  test('6.15.1 Payments Save (updatePaymentSettings mock)', async ({ page }) => {
    let saveCalled = false;
    await page.route('**/api/graphql', async (route) => {
      const post = route.request().postData() ?? '';
      if (post.includes('updatePaymentSettings')) {
        saveCalled = true;
        await route.fulfill({
          json: {
            data: {
              updatePaymentSettings: {
                enabledMethods: ['manual_invoice'],
                methods: [],
                secretStatuses: {},
                config: {
                  defaultPricePerLessonMinor: 50_000,
                  defaultCurrency: 'UAH',
                  allowedCurrencies: ['UAH', 'USD'],
                  minPackageLessons: 1,
                  packages: [],
                  manualInvoiceMethods: ['bank_transfer'],
                },
              },
            },
          },
        });
        return;
      }
      await route.continue();
    });

    if (!(await openSystemTab(page, /^payments$/i))) return;
    await expect(page.getByRole('button', { name: /save payment settings/i })).toBeVisible({
      timeout: 12_000,
    });

    const enableBtn = page.getByRole('button', { name: /^enable$/i }).first();
    if (await enableBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await enableBtn.click();
    } else {
      const price = page.getByLabel(/price per lesson|uah|usd/i).first();
      if (await price.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await price.fill('501');
      }
    }

    await page.getByRole('button', { name: /save payment settings/i }).click();
    await expect.poll(() => saveCalled, { timeout: 10_000 }).toBe(true);
    await expect(page.getByText(/payment settings saved/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('6.15.2 Payouts defaults Save', async ({ page }) => {
    await page.route('**/api/graphql', async (route) => {
      const post = route.request().postData() ?? '';
      if (post.includes('updateStaffPayoutDefaults')) {
        await route.fulfill({
          json: {
            data: {
              updateStaffPayoutDefaults: {
                defaultMode: 'PER_LESSON',
                defaultPerLessonRateMinor: 50000,
                defaultSalaryMinor: 0,
                defaultCurrency: 'UAH',
                defaultPayFrequency: 'MONTHLY',
                defaultPayDayOfWeek: 1,
                defaultPayDayOfMonth: 1,
                defaultGraceDays: 3,
              },
            },
          },
        });
        return;
      }
      await route.continue();
    });

    if (!(await openSystemTab(page, /payouts/i))) return;
    const save = page.getByRole('button', { name: /save payout defaults/i });
    await expect(save).toBeVisible({ timeout: 12_000 });
    // Touch a field so dirty if required
    const rate = page.getByLabel(/per.?lesson|rate|amount/i).first();
    if (await rate.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await rate.fill('520');
    }
    await save.click();
    await expect(page.getByText(/payout defaults saved/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('6.15.3 Connections Save Zoom field', async ({ page }) => {
    await page.route('**/api/graphql', async (route) => {
      const post = route.request().postData() ?? '';
      if (post.includes('updatePlatformIntegrationSettings')) {
        await route.fulfill({
          json: {
            data: {
              updatePlatformIntegrationSettings: {
                config: { zoom: { clientId: 'e2e-zoom-client' } },
                secrets: {},
                secretStatuses: {},
                secretsStorageAvailable: true,
              },
            },
          },
        });
        return;
      }
      await route.continue();
    });

    if (!(await openSystemTab(page, /connections/i))) return;
    const zoomId = page.locator('#zoom-client-id');
    if (!(await zoomId.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'Zoom client id field not visible');
      return;
    }
    await zoomId.fill('e2e-zoom-client');
    await page.getByRole('button', { name: /^save$/i }).click();
    await expect(
      page.getByText(/saved\. new credentials apply immediately/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('6.15.4 Dictionary select provider + Save', async ({ page }) => {
    await page.route('**/api/graphql', async (route) => {
      const post = route.request().postData() ?? '';
      if (post.includes('wordDictionarySettings') && !post.includes('updateWordDictionaryProvider')) {
        await route.fulfill({
          json: {
            data: {
              wordDictionarySettings: {
                activeProvider: 'dictionary_api_dev',
                providers: [
                  {
                    id: 'dictionary_api_dev',
                    name: 'Free Dictionary API',
                    description: 'Open API',
                    docsUrl: 'https://example.com',
                  },
                  {
                    id: 'wiktionary',
                    name: 'Wiktionary',
                    description: 'MediaWiki',
                    docsUrl: 'https://example.com',
                  },
                ],
              },
            },
          },
        });
        return;
      }
      if (post.includes('updateWordDictionaryProvider')) {
        await route.fulfill({
          json: {
            data: {
              updateWordDictionaryProvider: {
                activeProvider: 'wiktionary',
                providers: [
                  {
                    id: 'dictionary_api_dev',
                    name: 'Free Dictionary API',
                    description: 'Open API',
                    docsUrl: 'https://example.com',
                  },
                  {
                    id: 'wiktionary',
                    name: 'Wiktionary',
                    description: 'MediaWiki',
                    docsUrl: 'https://example.com',
                  },
                ],
              },
            },
          },
        });
        return;
      }
      await route.continue();
    });

    if (!(await openSystemTab(page, /dictionary/i))) return;
    await expect(page.getByText(/dictionary|provider/i).first()).toBeVisible({ timeout: 12_000 });

    const radios = page.locator('input[name="wordDictionaryProvider"]');
    const count = await radios.count();
    if (count < 2) {
      // Live settings may already have 2+ — pick a non-active card by name
      const words = page.getByText(/wordsapi|datamuse|oxford|merriam/i).first();
      if (await words.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await words.click();
      } else {
        test.skip(true, 'Need ≥2 dictionary providers to dirty selection');
        return;
      }
    } else {
      await radios.nth(1).check();
    }

    const save = page.getByRole('button', { name: /save provider/i });
    await expect(save).toBeEnabled({ timeout: 5_000 });
    await save.click();
    await expect(page.getByText(/dictionary provider updated/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('6.15.5 Branding hex → Save → CSS var', async ({ page }) => {
    await page.route('**/api/school/branding', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ brandColor: null, logoUrl: null }),
        });
        return;
      }
      if (method === 'PATCH' || method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ brandColor: '#159970', logoUrl: null }),
        });
        return;
      }
      await route.continue();
    });

    if (!(await openSystemTab(page, /branding/i))) return;
    const color = page.getByLabel(/brand color/i);
    await expect(color).toBeVisible({ timeout: 10_000 });
    await color.fill('#159970');
    await page.getByRole('button', { name: /save branding/i }).click();
    await expect(page.getByText(/^saved\.?$/i).first()).toBeVisible({ timeout: 10_000 });
    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim(),
    );
    expect(accent.toLowerCase()).toContain('159970');
  });
});
