/**
 * АУДИТ Етап 7 — 7.10 Users directory (list REST mocked).
 * Requires PLATFORM_BASE_URL. Run under project=public.
 */
import { test, expect, type Page, type Route } from '@playwright/test';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';

const mockUsers = {
  items: [
    {
      id: 'user_1',
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      status: 'ACTIVE',
      membershipCount: 1,
      memberships: [{ schoolId: 'school_a', schoolName: 'Seed Campus', role: 'ADMIN' }],
      isPlatformOperator: false,
      platformRole: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_2',
      displayName: 'Ops Admin',
      email: 'ops@arvilio.test',
      status: 'ACTIVE',
      membershipCount: 0,
      memberships: [],
      isPlatformOperator: true,
      platformRole: 'PLATFORM_ADMIN',
      createdAt: new Date().toISOString(),
    },
  ],
  total: 2,
  hasMore: false,
  nextCursor: null,
};

function userRow(i: number) {
  return {
    id: `user_${i}`,
    displayName: `User ${String(i).padStart(2, '0')}`,
    email: `user${i}@example.com`,
    status: 'ACTIVE' as const,
    membershipCount: 1,
    memberships: [{ schoolId: 'school_a', schoolName: 'Seed Campus', role: 'STUDENT' as const }],
    isPlatformOperator: false,
    platformRole: null,
    createdAt: new Date().toISOString(),
  };
}

async function loginAs(page: Page, email: string) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: 'TestPass123!' },
  });
  expect(res.status(), `login ${email}`).toBe(201);
}

async function mockUsersList(route: Route) {
  const req = route.request();
  if (req.method() !== 'GET' || !req.url().includes('/api/platform/users')) {
    await route.continue();
    return;
  }
  // Don't mock /users/stats — SSR already hydrated; list is client-side.
  if (req.url().includes('/users/stats')) {
    await route.continue();
    return;
  }
  const url = new URL(req.url());
  const q = (url.searchParams.get('q') ?? '').toLowerCase();
  const items = q
    ? mockUsers.items.filter(
        (u) => u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q),
      )
    : mockUsers.items;
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ...mockUsers, items, total: items.length }),
  });
}

test.describe('7.10 Users directory', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/users`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('chrome: stats labels + filters', async ({ page }) => {
    await page.route('**/api/platform/users**', mockUsersList);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/users`);

    await expect(page.getByRole('heading', { name: /^users$/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/total users/i).first()).toBeVisible();
    await expect(page.getByLabel(/^search$/i)).toBeVisible();
    await expect(page.getByLabel(/account status/i)).toBeVisible();
    await expect(page.getByLabel(/membership role/i)).toBeVisible();
    await expect(page.getByLabel(/^scope$/i)).toBeVisible();
  });

  test('lists mocked users and filters by search', async ({ page }) => {
    await page.route('**/api/platform/users**', mockUsersList);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/users`);

    await expect(page.getByText('Ada Lovelace').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('ada@example.com').first()).toBeVisible();

    const resPromise = page.waitForResponse((r) => {
      if (!r.url().includes('/api/platform/users') || r.request().method() !== 'GET') return false;
      if (r.url().includes('/stats')) return false;
      return new URL(r.url()).searchParams.get('q') === 'ops@';
    });
    await page.getByLabel(/^search$/i).fill('ops@');
    await resPromise;
    await expect(page.getByText('Ops Admin').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Ada Lovelace')).toHaveCount(0);
  });

  test('7.10.6 infinite scroll loads next page', async ({ page }) => {
    let pageCalls = 0;
    await page.route('**/api/platform/users**', async (route) => {
      if (route.request().method() !== 'GET' || route.request().url().includes('/stats')) {
        await route.continue();
        return;
      }
      pageCalls += 1;
      const url = new URL(route.request().url());
      const cursor = url.searchParams.get('cursor');
      if (!cursor) {
        await route.fulfill({
          json: {
            items: Array.from({ length: 25 }, (_, i) => userRow(i + 1)),
            total: 35,
            hasMore: true,
            nextCursor: 'users-cursor-2',
          },
        });
        return;
      }
      await route.fulfill({
        json: {
          items: Array.from({ length: 10 }, (_, i) => userRow(i + 26)),
          total: 35,
          hasMore: false,
          nextCursor: null,
        },
      });
    });

    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/users`);
    await expect(page.getByText(/showing 25 of 35.*scroll for more/i)).toBeVisible({
      timeout: 15_000,
    });

    const showing = page.getByText(/showing 25 of 35/i);
    const scrollViewport = async () => {
      await showing.evaluate((el) => {
        const scroll = el.parentElement?.querySelector(
          'div[style*="max-height"], [class*="scroll"]',
        ) as HTMLElement | null;
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      });
      await page.mouse.wheel(0, 5000);
    };
    await scrollViewport();
    await expect
      .poll(async () => {
        if (pageCalls < 2) await scrollViewport();
        return pageCalls;
      }, { timeout: 15_000 })
      .toBeGreaterThanOrEqual(2);
    await expect(page.getByText(/showing 35 of 35/i)).toBeVisible({ timeout: 12_000 });
    await expect(page.getByText('User 35').first()).toBeVisible();
  });
});
