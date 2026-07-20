/**
 * АУДИТ Етап 7 — Platform console (:4300, super_admin)
 * Логін через API (cookie на host localhost діє і для :4300 — порт не входить у cookie-домен).
 * Запускати project=public.
 */
import { test, expect, type Page } from '@playwright/test';
import { shot, expectNoA11yViolations } from '../../helpers/a11y';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';
const DIR = '07-platform';

async function loginAs(page: Page, email: string) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: 'TestPass123!' },
  });
  expect(res.status(), `login ${email}`).toBe(201);
}

const PAGES = ['/dashboard', '/schools', '/promo-codes', '/audit-log', '/settings'];

test.describe('7.x super_admin console', () => {
  for (const path of PAGES) {
    test(`7 ${path}: render + screenshot + axe`, async ({ page }) => {
      await loginAs(page, 'jest-super-admin@arvilio.test');
      await page.goto(`${PLATFORM}${path}`);
      await expect(page.locator('body')).toBeVisible({ timeout: 15_000 });
      await page.waitForTimeout(800);
      await shot(page, `${DIR}/7${path.replace(/\//g, '-')}`);
      const body = (await page.locator('body').innerText()).toLowerCase();
      expect(body, `${path} should not show unauthorized`).not.toMatch(/unauthorized|forbidden/);
      await expectNoA11yViolations(page);
    });
  }

  test('7.2 /schools lists schools with statuses', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/schools`);
    await expect(page.getByRole('heading', { name: /schools/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/trial|active/i).first()).toBeVisible({ timeout: 10_000 });
    expect(await page.locator('a[href*="/schools/"]').count()).toBeGreaterThan(0);
  });
});

test.describe('7.7 access control', () => {
  test('school admin → unauthorized', async ({ page }) => {
    await loginAs(page, 'jest-admin@arvilio.test');
    await page.goto(`${PLATFORM}/dashboard`);
    await page.waitForTimeout(800);
    await shot(page, `${DIR}/7-7-admin-unauthorized`);
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).toMatch(/not authorized|unauthorized|forbidden|platform operator|sign in/);
  });

  test('guest → unauthorized', async ({ page }) => {
    await page.goto(`${PLATFORM}/dashboard`);
    await page.waitForTimeout(800);
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).toMatch(/not authorized|unauthorized|forbidden|platform operator|sign in/);
  });
});
