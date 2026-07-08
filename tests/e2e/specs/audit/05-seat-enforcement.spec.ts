/**
 * АУДИТ Етап 5 — 5C.7 seat-enforcement UI: створення акаунта понад ліміт → 403.
 * Мокаємо ЛИШЕ мутацію createAdminUser (не shell-запит adminUsers), тож /admin
 * рендериться нормально, а submit показує помилку ліміту. Реальний enforcement —
 * backend (module-auth); тут перевіряємо, що UI дружньо обробляє відмову.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

test('5C.7 create account beyond seat limit → error shown, no navigation', async ({ page }) => {
  await page.route('**/api/graphql', async (route) => {
    let query = '';
    try {
      query = (route.request().postDataJSON() as { query?: string })?.query ?? '';
    } catch {
      query = route.request().postData() ?? '';
    }
    if (query.includes('createAdminUser')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ errors: [{ message: 'Seat limit reached — upgrade your plan to add more students.' }] }),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /account administration/i })).toBeVisible({ timeout: 10_000 });

  const emailField = page.getByLabel(/email/i).first();
  await emailField.fill(`seat-probe-${Date.now()}@soenglish.test`);
  await page.getByRole('button', { name: /create account/i }).click();

  // UI surfaces the seat-limit error and stays on /admin
  await expect(page.getByText(/seat limit|upgrade your plan|limit reached/i)).toBeVisible({ timeout: 8_000 });
  await expect(page).toHaveURL(/\/admin/);
});
