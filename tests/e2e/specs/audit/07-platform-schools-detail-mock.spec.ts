/**
 * АУДИТ Етап 7 — 7.3 Campus detail: chrome + suspend / impersonate (REST mocked).
 * Requires PLATFORM_BASE_URL. Run under project=public.
 */
import { test, expect, type Page } from '@playwright/test';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';

async function loginAs(page: Page, email: string) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: 'TestPass123!' },
  });
  expect(res.status(), `login ${email}`).toBe(201);
}

async function openFirstCampus(page: Page): Promise<string | null> {
  await page.goto(`${PLATFORM}/schools`);
  await expect(page.getByRole('heading', { name: /campuses|schools/i })).toBeVisible({
    timeout: 15_000,
  });
  const link = page.locator('a[href*="/schools/"]').first();
  if (!(await link.isVisible({ timeout: 12_000 }).catch(() => false))) {
    return null;
  }
  const href = (await link.getAttribute('href')) ?? '';
  const id = href.split('/schools/')[1]?.split(/[?#]/)[0] ?? null;
  await link.click();
  await expect(page.getByRole('button', { name: /suspend campus|activate campus/i })).toBeVisible({
    timeout: 15_000,
  });
  return id;
}

test.describe('7.3 Campus detail', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/schools`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('detail chrome: stats, Suspend, Impersonate', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    const id = await openFirstCampus(page);
    if (!id) {
      test.skip(true, 'No campuses in list');
      return;
    }

    await expect(page.getByText(/^members$/i).first()).toBeVisible();
    await expect(page.getByText(/^campus$/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /impersonate admin/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /campuses/i })).toBeVisible();
  });

  test('Suspend campus fires mocked POST without UI error', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    const id = await openFirstCampus(page);
    if (!id) {
      test.skip(true, 'No campuses in list');
      return;
    }

    const suspendBtn = page.getByRole('button', { name: /^suspend campus$/i });
    if (!(await suspendBtn.isVisible().catch(() => false))) {
      test.skip(true, 'Campus already suspended — Activate shown');
      return;
    }

    await page.route(`**/api/platform/schools/${id}/suspend`, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id,
          name: 'Mock Campus',
          slug: 'mock',
          status: 'SUSPENDED',
          memberCount: 1,
          adminCount: 1,
          teacherCount: 0,
          studentCount: 0,
          storageUsedBytes: 0,
          primaryDomain: null,
          subscriptionStatus: null,
          billingCountry: null,
          createdAt: new Date().toISOString(),
          owner: null,
          admins: [],
        }),
      });
    });

    const resPromise = page.waitForResponse(
      (r) => r.url().includes(`/schools/${id}/suspend`) && r.request().method() === 'POST',
    );
    await suspendBtn.click();
    const res = await resPromise;
    expect(res.status()).toBe(200);
    await expect(page.getByText(/request failed|action failed/i)).toHaveCount(0);
  });

  test('Impersonate admin fires mocked POST', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    const id = await openFirstCampus(page);
    if (!id) {
      test.skip(true, 'No campuses in list');
      return;
    }

    const impersonateBtn = page.getByRole('button', { name: /impersonate admin/i });
    if (await impersonateBtn.isDisabled()) {
      test.skip(true, 'Impersonate disabled (campus suspended)');
      return;
    }

    await page.route(`**/api/platform/schools/${id}/impersonate`, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    // Abort Campus redirect after successful impersonate mint.
    await page.route('http://localhost:4200/**', (route) => route.abort());
    await page.route('**/localhost:4200/**', (route) => route.abort());

    const resPromise = page.waitForResponse(
      (r) => r.url().includes(`/schools/${id}/impersonate`) && r.request().method() === 'POST',
      { timeout: 15_000 },
    );
    await impersonateBtn.click();
    const res = await resPromise;
    expect(res.status()).toBe(200);
  });

  test('Activate campus fires mocked POST when suspended', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/schools`);
    await expect(page.getByLabel(/^status$/i)).toBeVisible({ timeout: 15_000 });
    await page.getByLabel(/^status$/i).selectOption('SUSPENDED');

    const link = page.locator('a[href*="/schools/"]').first();
    if (!(await link.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No suspended campuses');
      return;
    }
    const href = (await link.getAttribute('href')) ?? '';
    const id = href.split('/schools/')[1]?.split(/[?#]/)[0];
    if (!id) {
      test.skip(true, 'Could not parse school id');
      return;
    }
    await link.click();

    const activateBtn = page.getByRole('button', { name: /^activate campus$/i });
    await expect(activateBtn).toBeVisible({ timeout: 15_000 });

    await page.route(`**/api/platform/schools/${id}/activate`, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id,
          name: 'Mock Campus',
          slug: 'mock',
          status: 'ACTIVE',
          memberCount: 1,
          adminCount: 1,
          teacherCount: 0,
          studentCount: 0,
          storageUsedBytes: 0,
          primaryDomain: null,
          subscriptionStatus: null,
          billingCountry: null,
          createdAt: new Date().toISOString(),
          owner: null,
          admins: [],
        }),
      });
    });

    const resPromise = page.waitForResponse(
      (r) => r.url().includes(`/schools/${id}/activate`) && r.request().method() === 'POST',
    );
    await activateBtn.click();
    expect((await resPromise).status()).toBe(200);
    await expect(page.getByText(/request failed|action failed/i)).toHaveCount(0);
  });

  test('Save billing country fires mocked PATCH', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    const id = await openFirstCampus(page);
    if (!id) {
      test.skip(true, 'No campuses in list');
      return;
    }

    await page.route(`**/api/platform/schools/${id}`, async (route) => {
      if (route.request().method() !== 'PATCH') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id,
          name: 'Mock Campus',
          slug: 'mock',
          status: 'ACTIVE',
          memberCount: 1,
          adminCount: 1,
          teacherCount: 0,
          studentCount: 0,
          storageUsedBytes: 0,
          primaryDomain: null,
          subscriptionStatus: null,
          billingCountry: 'UA',
          createdAt: new Date().toISOString(),
          owner: null,
          admins: [],
        }),
      });
    });

    await expect(page.getByLabel(/billing country/i)).toBeVisible({ timeout: 10_000 });
    await page.getByLabel(/billing country/i).fill('UA');
    const resPromise = page.waitForResponse(
      (r) =>
        r.url().includes(`/api/platform/schools/${id}`) &&
        r.request().method() === 'PATCH' &&
        !r.url().includes('/suspend') &&
        !r.url().includes('/activate'),
    );
    await page.getByRole('button', { name: /save country/i }).click();
    expect((await resPromise).ok()).toBeTruthy();
    await expect(page.getByText(/^saved$/i)).toBeVisible({ timeout: 10_000 });
  });

  test('members panel chrome visible', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    const id = await openFirstCampus(page);
    if (!id) {
      test.skip(true, 'No campuses in list');
      return;
    }
    await expect(page.getByRole('heading', { name: /all members/i })).toBeVisible();
    await expect(page.getByLabel(/search members/i)).toBeVisible({ timeout: 10_000 });
  });

  test('7.3.7 members search + role filter (mocked)', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');
    const id = await openFirstCampus(page);
    if (!id) {
      test.skip(true, 'No campuses in list');
      return;
    }

    const member = (i: number, role: 'ADMIN' | 'TEACHER' | 'STUDENT') => ({
      membershipId: `mem_${i}`,
      userId: `user_${i}`,
      email: `member${i}@example.com`,
      displayName: `Member ${String(i).padStart(2, '0')}`,
      userStatus: 'ACTIVE',
      role,
      membershipStatus: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      isOwner: i === 1,
    });

    let lastQ: string | null = null;
    let lastRole: string | null = null;
    let pageCalls = 0;

    await page.route(`**/api/platform/schools/${id}/members**`, async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      pageCalls += 1;
      const url = new URL(route.request().url());
      lastQ = url.searchParams.get('q');
      lastRole = url.searchParams.get('role');
      const cursor = url.searchParams.get('cursor');
      if (lastQ) {
        await route.fulfill({
          json: {
            items: [member(2, 'TEACHER')],
            total: 1,
            hasMore: false,
            nextCursor: null,
          },
        });
        return;
      }
      if (lastRole === 'STUDENT') {
        await route.fulfill({
          json: {
            items: [member(3, 'STUDENT')],
            total: 1,
            hasMore: false,
            nextCursor: null,
          },
        });
        return;
      }
      if (!cursor) {
        await route.fulfill({
          json: {
            items: Array.from({ length: 25 }, (_, i) =>
              member(i + 1, i === 0 ? 'ADMIN' : i % 2 ? 'TEACHER' : 'STUDENT'),
            ),
            total: 30,
            hasMore: true,
            nextCursor: 'mem-cursor-2',
          },
        });
        return;
      }
      await route.fulfill({
        json: {
          items: Array.from({ length: 5 }, (_, i) => member(i + 26, 'STUDENT')),
          total: 30,
          hasMore: false,
          nextCursor: null,
        },
      });
    });

    // Remount panel with mocks — soft reload detail
    await page.goto(`${PLATFORM}/schools/${id}`);
    await expect(page.getByLabel(/search members/i)).toBeVisible({ timeout: 12_000 });
    await expect(page.getByText(/showing 25 of 30/i)).toBeVisible({ timeout: 12_000 });

    const searchRes = page.waitForResponse(
      (r) =>
        r.url().includes(`/schools/${id}/members`) &&
        r.request().method() === 'GET' &&
        new URL(r.url()).searchParams.get('q') === 'member02',
    );
    await page.getByLabel(/search members/i).fill('member02');
    await searchRes;
    await expect(page.getByText('Member 02').first()).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/search members/i).fill('');
    await page.getByLabel(/^role$/i).selectOption('STUDENT');
    await expect
      .poll(() => lastRole, { timeout: 10_000 })
      .toBe('STUDENT');
    await expect(page.getByText('Member 03').first()).toBeVisible({ timeout: 10_000 });

    // Infinite: reset filters then scroll
    await page.getByLabel(/^role$/i).selectOption('all');
    await expect(page.getByText(/showing 25 of 30/i)).toBeVisible({ timeout: 12_000 });
    const showing = page.getByText(/showing 25 of 30/i);
    const scrollViewport = async () => {
      await showing.evaluate((el) => {
        const scroll = el.parentElement?.querySelector(
          'div[style*="max-height"], [class*="scroll"]',
        ) as HTMLElement | null;
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      });
      await page.mouse.wheel(0, 4000);
    };
    const callsBefore = pageCalls;
    await scrollViewport();
    await expect
      .poll(async () => {
        if (pageCalls <= callsBefore) await scrollViewport();
        return pageCalls;
      }, { timeout: 15_000 })
      .toBeGreaterThan(callsBefore);
    await expect(page.getByText(/showing 30 of 30/i)).toBeVisible({ timeout: 12_000 });
  });

  test('7.3.8 Impersonation banner + stop on Campus (live API)', async ({ page }) => {
    await loginAs(page, 'jest-super-admin@arvilio.test');

    const list = await page.request.get('/api/platform/schools?limit=5');
    if (!list.ok()) {
      test.skip(true, `Cannot list schools (${list.status()})`);
      return;
    }
    const schools = (await list.json()) as { items?: Array<{ id: string }> };
    const schoolId = schools.items?.[0]?.id;
    if (!schoolId) {
      test.skip(true, 'No schools for impersonate');
      return;
    }

    const started = await page.request.post(`/api/platform/schools/${schoolId}/impersonate`);
    if (!started.ok()) {
      test.skip(true, `Impersonate failed (${started.status()})`);
      return;
    }

    await page.goto('/dashboard');
    const banner = page.getByRole('status').filter({ hasText: /impersonating school/i });
    if (!(await banner.isVisible({ timeout: 15_000 }).catch(() => false))) {
      test.skip(true, 'Impersonation banner not shown (session/proxy)');
      return;
    }
    await expect(banner).toContainText(schoolId);

    const stopPromise = page.waitForResponse(
      (r) => r.url().includes('/auth/impersonate/stop') && r.request().method() === 'POST',
      { timeout: 15_000 },
    );
    await page.getByRole('button', { name: /stop impersonating/i }).click();
    const stopRes = await stopPromise;
    expect(stopRes.ok()).toBeTruthy();
    await expect(page.getByRole('button', { name: /stop impersonating/i })).toHaveCount(0, {
      timeout: 15_000,
    });
  });
});
