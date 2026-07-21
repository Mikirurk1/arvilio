/**
 * АУДИТ Етап 7 — 7.6 Platform Settings LLM panel (REST route-mock).
 * Mutating calls mocked; no live LLM provider. Requires PLATFORM_BASE_URL.
 * Run under project=public.
 */
import { test, expect, type Page, type Route } from '@playwright/test';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';

const llmDto = {
  config: {
    enabled: true,
    provider: 'openai_compat' as const,
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    maxTokens: 384,
    temperature: 0.3,
  },
  secrets: { llmApiKey: null as string | null, anthropicApiKey: null as string | null },
  secretStatuses: {
    llmApiKey: { configured: true, source: 'stored' },
    anthropicApiKey: { configured: false, source: 'none' },
  },
  secretsStorageAvailable: true,
};

async function loginAs(page: Page, email: string) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: 'TestPass123!' },
  });
  expect(res.status(), `login ${email}`).toBe(201);
}

async function mockLlmMutations(route: Route) {
  const req = route.request();
  const method = req.method();
  const url = req.url();

  if (method === 'POST' && url.includes('/llm/test')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Connection OK',
        latencyMs: 12,
        model: 'gpt-4o-mini',
        provider: 'openai_compat',
      }),
    });
    return;
  }
  if (method === 'PUT' && /\/llm\/?(\?|$)/.test(url)) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...llmDto,
        config: { ...llmDto.config, model: 'gpt-4o-mini', maxTokens: 512 },
      }),
    });
    return;
  }
  await route.continue();
}

test.describe('7.6 Platform LLM (mocked REST)', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/settings`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('panel chrome visible on /settings', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/arvi ai/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /save default llm/i })).toBeVisible();
    await expect(page.getByLabel(/^provider$/i)).toBeVisible();
  });

  test('switch provider to Anthropic shows Anthropic key field', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/arvi ai/i).first()).toBeVisible({ timeout: 15_000 });

    await page.getByLabel(/^provider$/i).selectOption('anthropic');
    await expect(page.getByLabel(/anthropic api key/i)).toBeVisible();
    await expect(page.getByLabel(/^base url$/i)).toHaveCount(0);
  });

  test('Test connection shows success (mocked)', async ({ page }) => {
    await page.route('**/api/platform/llm**', mockLlmMutations);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/arvi ai/i).first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: /test connection/i }).click();
    await expect(page.getByText(/connection ok/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Save default LLM shows Saved (mocked)', async ({ page }) => {
    await page.route('**/api/platform/llm**', mockLlmMutations);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/settings`);
    await expect(page.getByText(/arvi ai/i).first()).toBeVisible({ timeout: 15_000 });

    await page.getByLabel(/^model$/i).fill('gpt-4o-mini');
    await page.getByRole('button', { name: /save default llm/i }).click();
    await expect(page.getByText(/^saved\.$/i)).toBeVisible({ timeout: 10_000 });
  });
});
