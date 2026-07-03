/**
 * АУДИТ Етап 11 — Edge cases: 404, невалідні id, API 500 → UI-помилка.
 * Запускати project=teacher. (Стани trial/suspended/quota — беклог, потрібні фікстури.)
 */
import { test, expect, type Page } from '@playwright/test';
import { shot } from '../../helpers/a11y';
import { STATE } from '../../fixtures/auth';

const DIR = '11-edge';

test.use({ storageState: STATE.teacher });

async function suppressTour(page: Page) {
  await page.route('**/api/onboarding/tour**', (r) => {
    if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
    else void r.continue();
  });
}

/** Сторінка не повинна бути білим екраном: або main із текстом, або явна error/404. */
async function expectNotBlank(page: Page, label: string) {
  const text = await page.locator('body').innerText();
  expect(text.trim().length, `${label}: page should not be blank`).toBeGreaterThan(20);
}

// ──────────────────────────────────────────────────────
// 11.1 404
// ──────────────────────────────────────────────────────
test('11.1 /zzz → 404 page', async ({ page }) => {
  await page.goto('/zzz-does-not-exist');
  await page.waitForTimeout(800);
  await shot(page, `${DIR}/11-1-404`);
  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body).toMatch(/404|not found|нема|знайдено/);
});

// ──────────────────────────────────────────────────────
// 11.2 невалідні id → дружня помилка, не білий екран
// ──────────────────────────────────────────────────────
for (const path of ['/lessons/zzz-bad-id', '/students/zzz-bad-id', '/staff/zzz-bad-id', '/materials/view/zzz-bad-id']) {
  test(`11.2 ${path} → friendly error`, async ({ page }) => {
    await suppressTour(page);
    await page.goto(path);
    await page.waitForTimeout(1_500);
    await shot(page, `${DIR}/11-2${path.replace(/\//g, '-')}`);
    await expectNotBlank(page, path);
    // не «завис» на вічному лоадері
    const stuckLoading = await page.getByText(/^loading|loading…$/i).first().isVisible().catch(() => false);
    expect(stuckLoading, `${path}: must not be stuck on a loader`).toBe(false);
  });
}

// ──────────────────────────────────────────────────────
// 11.9 API 500 → UI-помилка, не білий екран
// ──────────────────────────────────────────────────────
test('11.9 /lessons with 500 from scheduled-lessons API → error UI', async ({ page }) => {
  await suppressTour(page);
  await page.route('**/api/scheduled-lessons**', (r) =>
    r.fulfill({ status: 500, json: { statusCode: 500, message: 'Internal server error' } }),
  );
  await page.goto('/lessons');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(1_500);
  await shot(page, `${DIR}/11-9-lessons-500`);
  await expectNotBlank(page, '/lessons 500');
});

test('11.9 /students with 500 from GraphQL → error UI', async ({ page }) => {
  // /students тягне список через GraphQL (students-store → graphqlRequest)
  await page.route('**/api/graphql**', (r) =>
    r.fulfill({ status: 500, json: { errors: [{ message: 'Internal server error' }] } }),
  );
  await page.goto('/students');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(1_500);
  await shot(page, `${DIR}/11-9-students-500`);
  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body).toMatch(/could not load|error|failed|try again|не вдалося/);
});
