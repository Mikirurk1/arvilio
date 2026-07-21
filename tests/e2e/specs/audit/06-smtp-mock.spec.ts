/**
 * АУДИТ Етап 6 — 6.5 SMTP (B6 route-mock): verify, preset, save, send test.
 * Mocks GraphQL only — no live SMTP provider.
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.admin });

test.beforeEach(async ({ page }) => {
  await suppressTour(page);
});

/** Desktop Field `as="select"` uses AdaptiveSelect (button+listbox), not native <select>. */
async function selectSmtpPreset(page: Page, optionLabel: RegExp) {
  await page.locator('#smtp-preset').click();
  await page.locator('#smtp-preset-listbox').getByRole('button', { name: optionLabel }).click();
}

async function openEmailTab(page: Page) {
  await page.goto('/system');
  await expect(page.locator('main').first()).toBeVisible({ timeout: 10_000 });
  const emailTab = page
    .getByRole('tab', { name: /email/i })
    .or(page.getByRole('button', { name: /^email$/i }))
    .first();
  if (!(await emailTab.isVisible({ timeout: 8_000 }).catch(() => false))) {
    test.skip(true, 'No Email tab (RBAC)');
    return false;
  }
  await emailTab.click({ force: true });
  await expect(page.getByText(/email \(smtp\)/i)).toBeVisible({ timeout: 8_000 });
  const customMode = page.getByRole('radio', { name: /custom smtp/i });
  await expect(customMode).toBeVisible({ timeout: 12_000 });
  return true;
}

test('6.5 SMTP verify connection shows success (mocked GraphQL)', async ({ page }) => {
  await page.route('**/api/graphql', async (route) => {
    const postData = route.request().postData() ?? '';
    if (postData.includes('verifySmtpConnection')) {
      await route.fulfill({
        json: { data: { verifySmtpConnection: { ok: true, message: 'SMTP connection verified.' } } },
      });
      return;
    }
    await route.continue();
  });

  if (!(await openEmailTab(page))) return;

  await page.getByRole('radio', { name: /custom smtp/i }).click();
  await page.locator('#smtp-host').fill('smtp.example.com');

  const verifyBtn = page.getByRole('button', { name: /verify connection/i });
  await expect(verifyBtn).toBeVisible({ timeout: 8_000 });
  await expect(verifyBtn).toBeEnabled({ timeout: 4_000 });
  await verifyBtn.click();
  await expect(page.getByText(/smtp connection verified|verified/i).first()).toBeVisible({
    timeout: 10_000,
  });
});

test('6.5 SMTP Resend preset fills host and port', async ({ page }) => {
  if (!(await openEmailTab(page))) return;

  await page.getByRole('radio', { name: /custom smtp/i }).click();
  await selectSmtpPreset(page, /^resend$/i);
  await expect(page.locator('#smtp-host')).toHaveValue('smtp.resend.com');
  await expect(page.locator('#smtp-port')).toHaveValue('465');
});

test('6.5 SMTP save settings shows success (mocked GraphQL)', async ({ page }) => {
  await page.route('**/api/graphql', async (route) => {
    const postData = route.request().postData() ?? '';
    if (postData.includes('updatePlatformIntegrationSettings')) {
      await route.fulfill({
        json: {
          data: {
            updatePlatformIntegrationSettings: {
              config: {
                smtp: {
                  mode: 'custom',
                  host: 'smtp.resend.com',
                  port: 465,
                  user: 'resend',
                  mailFrom: 'noreply@example.com',
                  secure: true,
                },
              },
              secrets: { smtpPass: null },
              secretStatuses: {
                smtpPass: { configured: true, source: 'stored' },
              },
              secretsStorageAvailable: true,
            },
          },
        },
      });
      return;
    }
    if (postData.includes('systemMailStatus')) {
      await route.fulfill({
        json: {
          data: {
            systemMailStatus: {
              configured: true,
              smtpHost: 'smtp.resend.com',
              smtpPort: 465,
              mailFrom: 'noreply@example.com',
              templatesDir: '/tmp',
              smtpMode: 'custom',
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
  await selectSmtpPreset(page, /^resend$/i);
  await page.getByRole('button', { name: /save smtp/i }).click();
  await expect(page.getByText(/smtp settings saved/i).first()).toBeVisible({ timeout: 10_000 });
});

test('6.5 SMTP send test welcome shows success (mocked GraphQL)', async ({ page }) => {
  await page.route('**/api/graphql', async (route) => {
    const postData = route.request().postData() ?? '';
    if (postData.includes('systemMailStatus')) {
      await route.fulfill({
        json: {
          data: {
            systemMailStatus: {
              configured: true,
              smtpHost: 'smtp.resend.com',
              smtpPort: 465,
              mailFrom: 'noreply@example.com',
              templatesDir: '/tmp',
              smtpMode: 'custom',
            },
          },
        },
      });
      return;
    }
    if (postData.includes('sendTestWelcomeEmail')) {
      await route.fulfill({
        json: {
          data: {
            sendTestWelcomeEmail: {
              sent: true,
              message: 'Test email sent. Check your inbox (or provider dashboard).',
            },
          },
        },
      });
      return;
    }
    await route.continue();
  });

  if (!(await openEmailTab(page))) return;

  await page.locator('#system-test-email').fill('auditor@example.com');
  const sendBtn = page.getByRole('button', { name: /send test welcome email/i });
  await expect(sendBtn).toBeEnabled({ timeout: 8_000 });
  await sendBtn.click();
  await expect(page.getByText(/test email sent|check your inbox/i).first()).toBeVisible({
    timeout: 10_000,
  });
});
