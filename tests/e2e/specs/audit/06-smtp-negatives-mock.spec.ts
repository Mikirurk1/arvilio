/**
 * АУДИТ Етап 6 — 6.5.6–7 SMTP server-default + negatives (GraphQL mock).
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

async function openEmailTab(page: Page) {
  await page.goto('/system');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const emailTab = page.getByRole('tab', { name: /^email$/i }).first();
  if (!(await emailTab.isVisible({ timeout: 6_000 }).catch(() => false))) {
    test.skip(true, 'No Email tab (RBAC)');
    return false;
  }
  await emailTab.click();
  await expect(page.getByText(/email \(smtp\)/i)).toBeVisible({ timeout: 8_000 });
  return true;
}

test('6.5.6 Server default mode hides custom host', async ({ page }) => {
  if (!(await openEmailTab(page))) return;

  await page.getByRole('radio', { name: /server default/i }).click();
  await expect(
    page.getByText(/using deployment environment variables|switch to custom smtp/i).first(),
  ).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('#smtp-host')).toHaveCount(0);
});

test('6.5.7 Verify fail shows error (mocked GraphQL)', async ({ page }) => {
  await page.route('**/api/graphql', async (route) => {
    const postData = route.request().postData() ?? '';
    if (postData.includes('verifySmtpConnection')) {
      await route.fulfill({
        json: {
          data: {
            verifySmtpConnection: {
              ok: false,
              message: 'SMTP verification failed: connection refused.',
            },
          },
        },
      });
      return;
    }
    await route.continue();
  });

  if (!(await openEmailTab(page))) return;

  await page.getByRole('radio', { name: /custom smtp/i }).click();
  await page.locator('#smtp-host').fill('smtp.bad.example');
  await page.getByRole('button', { name: /verify connection/i }).click();
  await expect(
    page.getByText(/verification failed|connection refused|failed/i).first(),
  ).toBeVisible({ timeout: 10_000 });
});

test('6.5.7 Save fail shows error (mocked GraphQL)', async ({ page }) => {
  await page.route('**/api/graphql', async (route) => {
    const postData = route.request().postData() ?? '';
    if (postData.includes('updatePlatformIntegrationSettings')) {
      await route.fulfill({
        status: 200,
        json: {
          errors: [{ message: 'Failed to save SMTP settings' }],
          data: null,
        },
      });
      return;
    }
    await route.continue();
  });

  if (!(await openEmailTab(page))) return;

  await page.getByRole('radio', { name: /custom smtp/i }).click();
  await page.locator('#smtp-host').fill('smtp.example.com');
  await page.getByRole('button', { name: /save smtp/i }).click();
  await expect(page.getByText(/save failed|failed to save|error/i).first()).toBeVisible({
    timeout: 10_000,
  });
});
