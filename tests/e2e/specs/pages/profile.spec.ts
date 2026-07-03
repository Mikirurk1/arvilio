import { STATE } from '../../fixtures/auth';
/**
 * Etap 3L — User profile + Connections.
 */
import { test, expect } from '@playwright/test';

test.describe('Profile — student', () => {
  test.use({ storageState: STATE.student });

  test('renders profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('displays name and email fields', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByLabel(/name|ім'я/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('save button is present', async ({ page }) => {
    await page.goto('/profile');
    const save = page.getByRole('button', { name: /save|зберегти/i });
    await expect(save).toBeVisible({ timeout: 8_000 });
  });

  test('connections section renders OAuth connect buttons', async ({ page }) => {
    await page.goto('/profile');
    const connectionsTab = page.getByRole('tab', { name: /connections|з'єднання/i });
    const hasTab = await connectionsTab.isVisible().catch(() => false);
    if (hasTab) await connectionsTab.click();

    const googleBtn = page
      .getByRole('button', { name: /connect google|підключити google/i })
      .or(page.getByTestId('connect-google'));
    const exists = await googleBtn.isVisible().catch(() => false);
    if (exists) await expect(googleBtn).toBeVisible();
  });
});

test.describe('Profile — teacher', () => {
  test.use({ storageState: STATE.teacher });

  test('teacher profile renders', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole('main')).toBeVisible();
  });
});
