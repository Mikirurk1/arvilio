/**
 * АУДИТ Етап 7 — 7.6 Platform Settings SMTP panel (REST route-mock).
 * Mutating calls mocked; no live SMTP. Requires platform app (PLATFORM_BASE_URL).
 * Run under project=public.
 */
import { test, expect, type Page, type Route } from '@playwright/test';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';

const smtpDto = {
  config: {
    mode: 'server_default' as const,
    host: null as string | null,
    port: 587 as number | null,
    user: null as string | null,
    mailFrom: 'noreply@localhost',
    secure: false,
  },
  secrets: { smtpPass: null as string | null },
  secretStatuses: { smtpPass: { configured: false, source: 'none' } },
  secretsStorageAvailable: true,
  runtime: {
    configured: true,
    host: 'localhost',
    port: 1025,
    mailFrom: 'noreply@localhost',
    source: 'server_default' as const,
  },
};

async function loginAs(page: Page, email: string) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: 'TestPass123!' },
  });
  expect(res.status(), `login ${email}`).toBe(201);
}

async function mockSmtpMutations(route: Route) {
  const req = route.request();
  const method = req.method();
  const url = req.url();

  if (method === 'POST' && url.includes('/smtp/verify')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, message: 'SMTP connection verified.' }),
    });
    return;
  }
  if (method === 'POST' && url.includes('/smtp/test')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ sent: true, message: 'Test welcome email sent.' }),
    });
    return;
  }
  if (method === 'PUT' && /\/smtp\/?(\?|$)/.test(url)) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...smtpDto,
        config: {
          mode: 'custom',
          host: 'smtp.resend.com',
          port: 465,
          user: 'resend',
          mailFrom: 'noreply@example.com',
          secure: true,
        },
        runtime: {
          configured: true,
          host: 'smtp.resend.com',
          port: 465,
          mailFrom: 'noreply@example.com',
          source: 'custom',
        },
        secretStatuses: { smtpPass: { configured: true, source: 'stored' } },
      }),
    });
    return;
  }
  await route.continue();
}

test.describe('7.6 Platform SMTP (mocked REST)', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/settings`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('panel chrome visible on /settings', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/transactional email/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /^save smtp$/i })).toBeVisible();
    await expect(page.getByLabel(/^mode$/i)).toBeVisible();
  });

  test('Custom + Resend preset fills smtp.resend.com', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/transactional email/i).first()).toBeVisible({ timeout: 15_000 });

    await page.getByLabel(/^mode$/i).selectOption('custom');
    await page.getByLabel(/provider preset/i).selectOption('resend');
    await expect(page.getByLabel(/^host$/i)).toHaveValue('smtp.resend.com');
  });

  test('Verify connection shows success (mocked)', async ({ page }) => {
    await page.route('**/api/platform/smtp**', mockSmtpMutations);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/transactional email/i).first()).toBeVisible({ timeout: 15_000 });

    await page.getByLabel(/^mode$/i).selectOption('custom');
    await page.getByLabel(/provider preset/i).selectOption('resend');
    await page.getByRole('button', { name: /verify connection/i }).click();
    await expect(page.getByText(/smtp connection verified|smtp verified/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('Save SMTP shows Saved (mocked)', async ({ page }) => {
    await page.route('**/api/platform/smtp**', mockSmtpMutations);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/transactional email/i).first()).toBeVisible({ timeout: 15_000 });

    await page.getByLabel(/^mode$/i).selectOption('custom');
    await page.getByLabel(/provider preset/i).selectOption('resend');
    await page.getByRole('button', { name: /^save smtp$/i }).click();
    await expect(page.getByText(/^saved\.$/i)).toBeVisible({ timeout: 10_000 });
  });

  test('Send test email shows success (mocked)', async ({ page }) => {
    await page.route('**/api/platform/smtp**', mockSmtpMutations);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/transactional email/i).first()).toBeVisible({ timeout: 15_000 });

    await page.getByLabel(/send test to/i).fill('auditor@example.com');
    await page.getByRole('button', { name: /send test email/i }).click();
    await expect(page.getByText(/test welcome email sent/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('7.6A.6 Verify fail shows error (REST 400)', async ({ page }) => {
    await page.route('**/api/platform/smtp**', async (route) => {
      if (route.request().method() === 'POST' && route.request().url().includes('/smtp/verify')) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'SMTP verification failed: connection refused.' }),
        });
        return;
      }
      await mockSmtpMutations(route);
    });
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/transactional email/i).first()).toBeVisible({ timeout: 15_000 });
    await page.getByLabel(/^mode$/i).selectOption('custom');
    await page.getByRole('button', { name: /verify connection/i }).click();
    await expect(
      page.getByText(/verification failed|connection refused|verify failed/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('7.6A.6 Save fail shows error (REST 400)', async ({ page }) => {
    await page.route('**/api/platform/smtp**', async (route) => {
      const url = route.request().url();
      if (route.request().method() === 'PUT' && /\/smtp\/?(\?|$)/.test(url)) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Failed to save SMTP settings' }),
        });
        return;
      }
      await mockSmtpMutations(route);
    });
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/transactional email/i).first()).toBeVisible({ timeout: 15_000 });
    await page.getByLabel(/^mode$/i).selectOption('custom');
    await page.getByRole('button', { name: /^save smtp$/i }).click();
    await expect(page.getByText(/failed to save|save failed/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
