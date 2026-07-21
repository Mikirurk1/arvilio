/**
 * АУДИТ Етап 6 — 6.14 school LLM override (REST route-mock).
 * No live LLM provider.
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

const schoolLlmDto = {
  effective: {
    enabled: true,
    provider: 'openai_compat' as const,
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    maxTokens: 384,
    temperature: 0.3,
    source: 'platform' as const,
    apiKeyConfigured: true,
  },
  platformDefaults: {
    enabled: true,
    provider: 'openai_compat' as const,
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    maxTokens: 384,
    temperature: 0.3,
    secretStatuses: {
      llmApiKey: { configured: true, source: 'stored' },
      anthropicApiKey: { configured: false, source: 'none' },
    },
  },
  override: {
    overrideEnabled: false,
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
      llmApiKey: { configured: false, source: 'none' },
      anthropicApiKey: { configured: false, source: 'none' },
    },
  },
  canOverride: true,
  secretsStorageAvailable: true,
};

async function openAiTab(page: Page) {
  await page.goto('/system');
  await expect(page.locator('main')).toBeVisible({ timeout: 12_000 });
  const aiTab = page.getByRole('tab', { name: /ai assistant/i }).first();
  if (!(await aiTab.isVisible({ timeout: 6_000 }).catch(() => false))) {
    test.skip(true, 'No AI assistant tab (RBAC)');
    return false;
  }
  await aiTab.click();
  await expect(page.getByText(/platform defaults|school override|runtime/i).first()).toBeVisible({
    timeout: 10_000,
  });
  return true;
}

test.describe('6.14 School LLM override (mocked REST)', () => {
  test('6.14.2 enable override + Save', async ({ page }) => {
    await page.route('**/api/system/llm**', async (route) => {
      const req = route.request();
      const method = req.method();
      const url = req.url();

      if (method === 'GET' && /\/system\/llm\/?(\?|$)/.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(schoolLlmDto),
        });
        return;
      }
      if (method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...schoolLlmDto,
            override: {
              ...schoolLlmDto.override,
              overrideEnabled: true,
            },
            effective: {
              ...schoolLlmDto.effective,
              source: 'school',
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    if (!(await openAiTab(page))) return;

    const override = page.getByLabel(/use school override/i);
    await expect(override).toBeVisible({ timeout: 8_000 });
    await override.check();
    await page.getByRole('button', { name: /save ai assistant/i }).click();
    await expect(page.getByText(/ai assistant settings saved|saved/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('6.14.3 Test connection (mocked)', async ({ page }) => {
    await page.route('**/api/system/llm**', async (route) => {
      const req = route.request();
      const method = req.method();
      const url = req.url();

      if (method === 'GET' && /\/system\/llm\/?(\?|$)/.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(schoolLlmDto),
        });
        return;
      }
      if (method === 'POST' && url.includes('/llm/test')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            message: 'Connection OK',
            latencyMs: 11,
          }),
        });
        return;
      }
      await route.continue();
    });

    if (!(await openAiTab(page))) return;

    await page.getByRole('button', { name: /test connection/i }).click();
    await expect(page.getByText(/connection ok/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('6.14.4 feature-gate without aiAssist (canOverride false)', async ({ page }) => {
    await page.route('**/api/system/llm**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...schoolLlmDto, canOverride: false }),
        });
        return;
      }
      await route.continue();
    });

    if (!(await openAiTab(page))) return;

    await expect(page.getByText(/pro|upgrade|plan/i).first()).toBeVisible({ timeout: 8_000 });
    await expect(page.getByLabel(/use school override/i)).toHaveCount(0);
  });
});
