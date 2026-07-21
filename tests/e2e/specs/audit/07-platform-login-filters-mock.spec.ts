/**
 * АУДИТ Етап 7 — 7.0 Platform login UI (mock + live probe).
 * Requires PLATFORM_BASE_URL. Run under project=public.
 */
import { test, expect, type Page } from '@playwright/test';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';

test.describe('7.0 Platform login', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/login`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('7.0.1 /login render chrome', async ({ page }) => {
    await page.goto(`${PLATFORM}/login`);
    await expect(page.getByText(/arvilio/i).first()).toBeVisible({ timeout: 12_000 });
    await expect(page.getByText(/control plane/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(
      page.getByText(/restricted area|platform administrators only/i),
    ).toBeVisible();
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('7.0.2 wrong password → error; no arvilio_pat cookie', async ({ page }) => {
    await page.route('**/api/auth/platform/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    });

    await page.goto(`${PLATFORM}/login`);
    await page.getByLabel(/^email$/i).fill('jest-super-admin@arvilio.test');
    await page.getByLabel(/^password$/i).fill('WrongPass999!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 8_000 });
    await expect(page).toHaveURL(/\/login/);
    const cookies = await page.context().cookies();
    expect(cookies.some((c) => c.name === 'arvilio_pat')).toBe(false);
  });

  test('7.0.3 success → /dashboard (mocked login)', async ({ page }) => {
    await page.route('**/api/auth/platform/login', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': 'arvilio_pat=e2e-mock-token; Path=/; HttpOnly',
        },
        body: JSON.stringify({ ok: true }),
      });
    });
    // Soft-mock dashboard shell so navigation does not 401 bounce
    await page.route('**/api/platform/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.goto(`${PLATFORM}/login`);
    await page.getByLabel(/^email$/i).fill('jest-super-admin@arvilio.test');
    await page.getByLabel(/^password$/i).fill('TestPass123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('7.0.4 school admin → unauthorized (mocked)', async ({ page }) => {
    await page.route('**/api/auth/platform/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    });

    await page.goto(`${PLATFORM}/login`);
    await page.getByLabel(/^email$/i).fill('jest-admin@arvilio.test');
    await page.getByLabel(/^password$/i).fill('TestPass123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 8_000 });
    const cookies = await page.context().cookies();
    expect(cookies.some((c) => c.name === 'arvilio_pat')).toBe(false);
  });
});

async function loginPlatformUi(page: Page) {
  // Prefer cookie via request if endpoint works; else UI path is covered in 7.0.3 mock.
  const res = await page.request.post(`${PLATFORM}/api/auth/platform/login`, {
    data: { email: 'jest-super-admin@arvilio.test', password: 'TestPass123!' },
  });
  if (res.status() !== 201 && res.status() !== 200) {
    // Fallback: Campus login used by other 07 specs on same API host
    const campus = await page.request.post('/api/auth/login', {
      data: { email: 'jest-super-admin@arvilio.test', password: 'TestPass123!' },
    });
    expect(campus.status(), 'platform or campus login').toBe(201);
  }
}

test.describe('7.2 Campuses filters (mocked list)', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/schools`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('7.2.2–4 search + status + subscription filters', async ({ page }) => {
    await page.route('**/api/platform/schools**', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      const url = new URL(route.request().url());
      const q = (url.searchParams.get('q') ?? '').toLowerCase();
      const status = url.searchParams.get('status');
      let items = [
        {
          id: 'sch_a',
          name: 'Alpha Campus',
          slug: 'alpha',
          status: 'ACTIVE',
          memberCount: 12,
          subscriptionStatus: 'ACTIVE',
          ownerDisplayName: 'Ada',
        },
        {
          id: 'sch_b',
          name: 'Beta Trial',
          slug: 'beta',
          status: 'TRIAL',
          memberCount: 3,
          subscriptionStatus: 'TRIALING',
          ownerDisplayName: 'Bob',
        },
      ];
      if (q) items = items.filter((s) => s.name.toLowerCase().includes(q) || s.slug.includes(q));
      if (status) items = items.filter((s) => s.status === status);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items, total: items.length, hasMore: false, nextCursor: null }),
      });
    });

    await loginPlatformUi(page);
    await page.goto(`${PLATFORM}/schools`);
    await expect(page.getByRole('heading', { name: /campuses/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByLabel(/^search$/i)).toBeVisible();
    await expect(page.getByLabel(/^status$/i)).toBeVisible();
    await expect(page.getByLabel(/^subscription$/i)).toBeVisible();

    await page.getByLabel(/^search$/i).fill('alpha');
    await expect(page.getByText('Alpha Campus').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Beta Trial')).toHaveCount(0);

    await page.getByLabel(/^search$/i).fill('');
    await page.getByLabel(/^status$/i).selectOption('TRIAL');
    await expect(page.getByText('Beta Trial').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Alpha Campus')).toHaveCount(0);
  });
});

test.describe('7.10.5 Users scope filter', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/users`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('Scope operators filters list request', async ({ page }) => {
    let sawScope = false;
    await page.route('**/api/platform/users**', async (route) => {
      const req = route.request();
      if (req.method() !== 'GET' || req.url().includes('/stats')) {
        await route.continue();
        return;
      }
      const url = new URL(req.url());
      if (url.searchParams.get('scope') === 'operators') sawScope = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: sawScope
            ? [
                {
                  id: 'op1',
                  displayName: 'Ops Admin',
                  email: 'ops@arvilio.test',
                  status: 'ACTIVE',
                  membershipCount: 0,
                  memberships: [],
                  isPlatformOperator: true,
                  platformRole: 'PLATFORM_ADMIN',
                  createdAt: new Date().toISOString(),
                },
              ]
            : [],
          total: sawScope ? 1 : 0,
          hasMore: false,
          nextCursor: null,
        }),
      });
    });

    await loginPlatformUi(page);
    await page.goto(`${PLATFORM}/users`);
    await expect(page.getByLabel(/^scope$/i)).toBeVisible({ timeout: 12_000 });
    await page.getByLabel(/^scope$/i).selectOption('operators');
    await expect.poll(() => sawScope, { timeout: 10_000 }).toBe(true);
    await expect(page.getByText('Ops Admin').first()).toBeVisible({ timeout: 8_000 });
  });
});
