/**
 * Thin leftovers — 7.2.5 infinite scroll, 7.9B campus-plans overrides.
 * Requires PLATFORM_BASE_URL. Run under project=public.
 */
import { test, expect, type Page } from '@playwright/test';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';

async function loginAs(page: Page, email: string) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: 'TestPass123!' },
  });
  expect(res.status(), `login ${email}`).toBe(201);
}

function schoolRow(i: number, status: 'ACTIVE' | 'TRIAL' = 'ACTIVE') {
  return {
    id: `sch_${i}`,
    name: `Campus ${String(i).padStart(2, '0')}`,
    slug: `campus-${i}`,
    status,
    memberCount: i,
    subscriptionStatus: status === 'TRIAL' ? 'TRIALING' : 'ACTIVE',
    ownerDisplayName: `Owner ${i}`,
  };
}

test.describe('7.2.5 Campuses infinite scroll', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/schools`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('Showing N of M · scroll for more → loads next page', async ({ page }) => {
    let pageCalls = 0;
    await page.route('**/api/platform/schools**', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      pageCalls += 1;
      const url = new URL(route.request().url());
      const cursor = url.searchParams.get('cursor');
      if (!cursor) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: Array.from({ length: 25 }, (_, i) => schoolRow(i + 1)),
            total: 40,
            hasMore: true,
            nextCursor: 'cursor-page-2',
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: Array.from({ length: 15 }, (_, i) => schoolRow(i + 26)),
          total: 40,
          hasMore: false,
          nextCursor: null,
        }),
      });
    });

    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/schools`);
    await expect(page.getByText(/showing 25 of 40.*scroll for more/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('Campus 01').first()).toBeVisible();

    // Scroll the InfiniteDataTable viewport (sibling of "Showing N of M") for IO sentinel
    const showing = page.getByText(/showing 25 of 40/i);
    const scrollViewport = async () => {
      await showing.evaluate((el) => {
        const scroll = el.parentElement?.querySelector(
          'div[style*="max-height"], [class*="scroll"]',
        ) as HTMLElement | null;
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      });
      const table = page.locator('table').first();
      await table.hover().catch(() => undefined);
      await page.mouse.wheel(0, 5000);
    };
    await scrollViewport();
    await expect
      .poll(async () => {
        if (pageCalls < 2) await scrollViewport();
        return pageCalls;
      }, { timeout: 15_000 })
      .toBeGreaterThanOrEqual(2);
    await expect(page.getByText(/showing 40 of 40/i)).toBeVisible({ timeout: 12_000 });
    await expect(page.getByText('Campus 40').first()).toBeVisible();
  });
});

test.describe('7.9B Campus plans country override', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/billing/campus-plans`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('7.9B.3 Add country override row', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/billing/campus-plans`);
    await expect(page.getByRole('heading', { name: /campus plans/i })).toBeVisible({
      timeout: 15_000,
    });

    if (await page.getByText(/no payment rails are ready/i).isVisible().catch(() => false)) {
      test.skip(true, 'No availableRails — configure Payment rails first');
      return;
    }

    await page.getByRole('button', { name: /add country/i }).click();
    await expect(page.getByLabel(/country \(iso/i).first()).toBeVisible({ timeout: 8_000 });
    await page.getByLabel(/country \(iso/i).first().fill('UA');
    await expect(page.getByText(/^UA$/).first()).toBeVisible({ timeout: 5_000 });
  });

  test('7.9B.4 Payment rail picker only lists available rails', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/billing/campus-plans`);
    await expect(page.getByRole('heading', { name: /campus plans/i })).toBeVisible({
      timeout: 15_000,
    });

    if (await page.getByText(/no payment rails are ready/i).isVisible().catch(() => false)) {
      test.skip(true, 'No availableRails');
      return;
    }

    const railSelect = page.getByLabel(/^payment rail$/i).first();
    await expect(railSelect).toBeVisible({ timeout: 8_000 });
    const options = railSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const value = await options.nth(i).getAttribute('value');
      expect(value).toBeTruthy();
      expect(value).not.toBe('disabled-not-configured');
    }
  });
});
