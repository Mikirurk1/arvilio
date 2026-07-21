/**
 * АУДИТ Етап 12 — Ask Arvi chat (SSE route-mock).
 * No live LLM. Separate from B7 poses and human /chat.
 */
import { test, expect, type Page } from '@playwright/test';
import { expectNoA11yViolations } from '../../helpers/a11y';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.student });

function sseBody(events: Array<{ event: string; data: unknown }>): string {
  return events
    .map((e) => `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n`)
    .join('\n');
}

async function mockStatus(
  page: Page,
  opts: { ready?: boolean; message?: string | null; status?: number; body?: unknown },
) {
  await page.route('**/api/assistant/status', async (route) => {
    if (opts.status && opts.status >= 400) {
      await route.fulfill({
        status: opts.status,
        contentType: 'application/json',
        body: JSON.stringify(opts.body ?? { message: 'blocked' }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ready: opts.ready ?? true,
        message: opts.message ?? null,
        enabled: opts.ready ?? true,
        modelConfigured: true,
        apiKeyConfigured: true,
        source: 'platform',
      }),
    });
  });
}

async function mockChatSse(
  page: Page,
  events: Array<{ event: string; data: unknown }>,
) {
  await page.route('**/api/assistant/chat', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
      body: sseBody(events),
    });
  });
}

async function openAskArvi(page: Page) {
  await page.goto('/dashboard');
  await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });
  const openBtn = page.getByRole('button', { name: /open arvi help chat/i });
  await expect(openBtn).toBeVisible({ timeout: 10_000 });
  await openBtn.click();
  await expect(page.locator('[data-arvi-chat]')).toBeVisible({ timeout: 8_000 });
}

test.describe('12 Ask Arvi (mocked SSE)', () => {
  test('12.1 open panel shows Ask Arvi + student welcome', async ({ page }) => {
    await mockStatus(page, { ready: true });
    await openAskArvi(page);

    const panel = page.locator('[data-arvi-chat]');
    await expect(panel.getByText(/ask arvi/i).first()).toBeVisible();
    await expect(panel.getByText(/student|learn|practice|calendar/i).first()).toBeVisible();
    await expect(panel.getByRole('listitem').first()).toBeVisible();
  });

  test('12.2 feature-blocked aiAssist shows Pro upgrade copy', async ({ page }) => {
    await mockStatus(page, {
      status: 403,
      body: { featureBlocked: 'aiAssist', message: 'Feature not available' },
    });
    await openAskArvi(page);

    const panel = page.locator('[data-arvi-chat]');
    await expect(panel.getByText(/pro|upgrade|plan/i).first()).toBeVisible({
      timeout: 8_000,
    });
    await expect(panel.getByLabel(/how do i/i)).toBeDisabled();
  });

  test('12.3 not ready disables composer', async ({ page }) => {
    await mockStatus(page, {
      ready: false,
      message: 'Arvi assistant is not configured.',
    });
    await openAskArvi(page);

    const panel = page.locator('[data-arvi-chat]');
    await expect(panel.getByText(/not configured|unavailable|disabled/i).first()).toBeVisible({
      timeout: 8_000,
    });
    await expect(panel.getByLabel(/how do i|unavailable/i)).toBeDisabled();
  });

  test('12.4 send message streams SSE reply', async ({ page }) => {
    await mockStatus(page, { ready: true });
    await mockChatSse(page, [
      { event: 'delta', data: { text: 'Hello ' } },
      { event: 'delta', data: { text: 'from Arvi' } },
      {
        event: 'done',
        data: { text: 'Hello from Arvi', promptTokens: 1, completionTokens: 2 },
      },
    ]);
    await openAskArvi(page);

    const panel = page.locator('[data-arvi-chat]');
    await panel.getByLabel(/how do i/i).fill('Where is calendar?');
    await panel.getByRole('button', { name: /^send$/i }).click();
    await expect(panel.getByText('Hello from Arvi')).toBeVisible({ timeout: 10_000 });
  });

  test('12.5 NAVIGATE allowlist shows Open button', async ({ page }) => {
    await mockStatus(page, { ready: true });
    await mockChatSse(page, [
      { event: 'delta', data: { text: 'Open the calendar.' } },
      { event: 'navigate', data: { path: '/calendar' } },
      {
        event: 'done',
        data: { text: 'Open the calendar.', promptTokens: 1, completionTokens: 1 },
      },
    ]);
    await openAskArvi(page);

    const panel = page.locator('[data-arvi-chat]');
    await panel.getByLabel(/how do i/i).fill('calendar please');
    await panel.getByRole('button', { name: /^send$/i }).click();
    await expect(panel.getByRole('button', { name: /open.*\/calendar/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('12.6 academic refusal copy in thread', async ({ page }) => {
    await mockStatus(page, { ready: true });
    await mockChatSse(page, [
      {
        event: 'refused',
        data: {
          reason: 'academic',
          message: "I can't help with homework answers — ask your teacher.",
        },
      },
      {
        event: 'done',
        data: {
          text: "I can't help with homework answers — ask your teacher.",
          promptTokens: 0,
          completionTokens: 0,
        },
      },
    ]);
    await openAskArvi(page);

    const panel = page.locator('[data-arvi-chat]');
    await panel.getByLabel(/how do i/i).fill('Give me the homework answers for this quiz');
    await panel.getByRole('button', { name: /^send$/i }).click();
    await expect(panel.getByText(/homework|ask your teacher/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('12.7 Escape closes; history persists in sessionStorage', async ({ page }) => {
    await mockStatus(page, { ready: true });
    await mockChatSse(page, [
      { event: 'delta', data: { text: 'Saved reply' } },
      {
        event: 'done',
        data: { text: 'Saved reply', promptTokens: 1, completionTokens: 1 },
      },
    ]);
    await openAskArvi(page);

    const panel = page.locator('[data-arvi-chat]');
    await panel.getByLabel(/how do i/i).fill('ping');
    await panel.getByRole('button', { name: /^send$/i }).click();
    await expect(panel.getByText('Saved reply')).toBeVisible({ timeout: 10_000 });

    const stored = await page.evaluate(() => sessionStorage.getItem('arvi.assistant.history'));
    expect(stored).toBeTruthy();
    expect(stored!).toMatch(/Saved reply/);

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-arvi-chat]')).toHaveCount(0, { timeout: 5_000 });

    await page.getByRole('button', { name: /open arvi help chat/i }).click();
    await expect(page.locator('[data-arvi-chat]').getByText('Saved reply')).toBeVisible({
      timeout: 8_000,
    });
  });

  test('12.8 axe on open panel', async ({ page }) => {
    await mockStatus(page, { ready: true });
    await openAskArvi(page);
    await expectNoA11yViolations(page);
  });

  test('12.9 chat error never shows raw API key material', async ({ page }) => {
    await mockStatus(page, { ready: true });
    await page.route('**/api/assistant/chat', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
        },
        body: sseBody([
          {
            event: 'error',
            data: {
              message:
                'Assistant is misconfigured (authentication failed). Ask your school admin to check AI settings.',
            },
          },
        ]),
      });
    });
    await openAskArvi(page);

    const panel = page.locator('[data-arvi-chat]');
    await panel.getByLabel(/how do i/i).fill('hello');
    await panel.getByRole('button', { name: /^send$/i }).click();
    await expect(panel.getByText(/misconfigured|admin|unavailable/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(panel.locator('text=/sk-[A-Za-z0-9]/')).toHaveCount(0);
  });
});

test.describe('12 Ask Arvi — teacher welcome', () => {
  test.use({ storageState: STATE.teacher });

  test('12.1 teacher welcome capabilities', async ({ page }) => {
    await mockStatus(page, { ready: true });
    await openAskArvi(page);
    const panel = page.locator('[data-arvi-chat]');
    await expect(panel.getByText(/material|student|schedule|teacher/i).first()).toBeVisible();
  });
});

test.describe('12 Ask Arvi — admin welcome', () => {
  test.use({ storageState: STATE.admin });

  test('12.1 admin welcome capabilities', async ({ page }) => {
    await mockStatus(page, { ready: true });
    await openAskArvi(page);
    const panel = page.locator('[data-arvi-chat]');
    await expect(panel.getByText(/system|finance|billing|admin/i).first()).toBeVisible();
  });
});
