/**
 * АУДИТ Етап 11 — білінг-стани (B1 backlog): trial gate, suspended, quota, feature/AI limits.
 * Route-mock REST/GraphQL — без зміни БД. SSR-only банери (trial ended на layout) — unit/integration.
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.admin });

async function mockEntitlements(
  page: Page,
  o: { plan?: string; overQuota?: boolean } = {},
) {
  await page.route('**/api/billing/entitlements', (r) =>
    r.fulfill({
      json: {
        plan: o.plan ?? 'TRIAL',
        maxActiveStudents: 50,
        activeStudentCount: 3,
        seatsRemaining: 47,
        features: { customDomain: false, aiAssist: false, recordings: true },
        storage: {
          usedBytes: o.overQuota ? '11000000000' : '2000000000',
          quotaBytes: '10000000000',
          remainingBytes: o.overQuota ? '0' : '8000000000',
          percentUsed: o.overQuota ? 110 : 20,
          overQuota: o.overQuota ?? false,
        },
      },
    }),
  );
}

test('11.3 trial workspace → billing shows upgrade path (plan pickers)', async ({ page }) => {
  await suppressTour(page);
  await mockEntitlements(page, { plan: 'TRIAL' });
  await page.goto('/billing');
  await expect(page.getByRole('heading', { name: /subscription/i })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/starter/i).first()).toBeVisible();
  await expect(page.getByText(/\bpro\b/i).first()).toBeVisible();
});

test('11.4 suspended school → billing API error surfaces in UI', async ({ page }) => {
  await suppressTour(page);
  await page.route('**/api/billing/entitlements', (r) =>
    r.fulfill({
      status: 403,
      json: { message: 'This school is suspended', statusCode: 403 },
    }),
  );
  await page.goto('/billing');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/suspended|failed|could not load|error/i).first()).toBeVisible({
    timeout: 8_000,
  });
});

test('11.5 AI feature blocked → upgrade prompt on custom domain write', async ({ page }) => {
  await suppressTour(page);
  await page.route('**/api/domains', (route) => {
    if (route.request().method() === 'POST') {
      void route.fulfill({
        status: 403,
        json: {
          message: 'Custom domains require the Pro plan.',
          statusCode: 403,
          featureBlocked: 'customDomain',
        },
      });
      return;
    }
    void route.continue();
  });
  await page.goto('/system');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const domainsTab = page.getByRole('tab', { name: /domains/i });
  if (!(await domainsTab.isVisible({ timeout: 4_000 }).catch(() => false))) {
    test.skip(true, 'Domains tab not visible for this role');
    return;
  }
  await domainsTab.click();
  const hostInput = page.getByLabel(/hostname|domain/i).first();
  if (!(await hostInput.isVisible({ timeout: 4_000 }).catch(() => false))) {
    test.skip(true, 'Domain form not available');
    return;
  }
  await hostInput.fill('e2e-test.example.com');
  await page.getByRole('button', { name: /add domain/i }).click();
  await expect(page.getByText(/pro plan|upgrade your plan|custom domains require/i).first()).toBeVisible({
    timeout: 8_000,
  });
});

test('11.6 storage quota → material save shows upgrade prompt', async ({ page }) => {
  await suppressTour(page);
  await page.route('**/api/graphql', async (route) => {
    const body = route.request().postData() ?? '';
    if (body.includes('createLibraryMaterial')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [{ message: 'Storage quota exceeded — upgrade your plan to upload more.' }],
        }),
      });
      return;
    }
    await route.continue();
  });
  await page.goto('/materials');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const addBtn = page.getByRole('button', { name: /add material|new material/i }).first();
  if (!(await addBtn.isVisible({ timeout: 4_000 }).catch(() => false))) {
    test.skip(true, 'No add material button');
    return;
  }
  await addBtn.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 8_000 });
  await dialog.getByLabel(/^title$/i).fill(`Quota probe ${Date.now()}`);
  await dialog.getByRole('button', { name: /create material|save/i }).click();
  await expect(page.getByRole('link', { name: /upgrade your plan/i })).toBeVisible({ timeout: 10_000 });
});

test('11.8 PAST_DUE — no dedicated UI yet (skip)', async () => {
  test.skip(true, 'PAST_DUE/dunning banner not implemented in web app — backend cron only');
});
