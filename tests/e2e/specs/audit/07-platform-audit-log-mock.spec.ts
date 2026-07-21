/**
 * АУДИТ Етап 7 — 7.5 Audit log: search + infinite list (REST mocked).
 * Requires PLATFORM_BASE_URL. Run under project=public.
 */
import { test, expect, type Page, type Route } from '@playwright/test';

const PLATFORM = process.env.PLATFORM_BASE_URL ?? 'http://localhost:4300';

function auditPage(opts: { q?: string; cursor?: string | null }) {
  const page1 = {
    items: [
      {
        id: 'aud_1',
        createdAt: new Date().toISOString(),
        actorName: 'Jest Super Admin',
        action: 'platform.smtp.update',
        targetSchoolId: 'school_seed',
        ip: '127.0.0.1',
      },
      {
        id: 'aud_2',
        createdAt: new Date().toISOString(),
        actorName: 'Jest Super Admin',
        action: 'school.suspend',
        targetSchoolId: 'school_seed',
        ip: '127.0.0.1',
      },
    ],
    total: 3,
    hasMore: true,
    nextCursor: 'cursor_page_2',
  };
  const page2 = {
    items: [
      {
        id: 'aud_3',
        createdAt: new Date().toISOString(),
        actorName: 'Jest Super Admin',
        action: 'platform.llm.test',
        targetSchoolId: null,
        ip: null,
      },
    ],
    total: 3,
    hasMore: false,
    nextCursor: null,
  };

  if (opts.q) {
    return {
      items: page1.items.filter((e) => e.action.includes(opts.q!)),
      total: 1,
      hasMore: false,
      nextCursor: null,
    };
  }
  if (opts.cursor) return page2;
  return page1;
}

async function loginAs(page: Page, email: string) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: 'TestPass123!' },
  });
  expect(res.status(), `login ${email}`).toBe(201);
}

async function mockAuditLog(route: Route) {
  const req = route.request();
  if (req.method() !== 'GET' || !req.url().includes('/api/platform/audit-log')) {
    await route.continue();
    return;
  }
  const url = new URL(req.url());
  const body = auditPage({
    q: url.searchParams.get('q') ?? undefined,
    cursor: url.searchParams.get('cursor'),
  });
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

test.describe('7.5 Audit log', () => {
  test.beforeEach(async ({ page }) => {
    const probe = await page.request.get(`${PLATFORM}/audit-log`).catch(() => null);
    if (!probe || probe.status() >= 500) {
      test.skip(true, `Platform unreachable at ${PLATFORM}`);
    }
  });

  test('chrome: heading + search + mocked rows', async ({ page }) => {
    await page.route('**/api/platform/audit-log**', mockAuditLog);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/audit-log`);

    await expect(page.getByRole('heading', { name: /audit log/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByLabel(/^search$/i)).toBeVisible();
    await expect(page.getByText(/platform\.smtp\.update/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/showing 2 of 3/i)).toBeVisible();
    await expect(page.getByText(/scroll for more/i)).toBeVisible();
  });

  test('search filters via q= query param', async ({ page }) => {
    await page.route('**/api/platform/audit-log**', mockAuditLog);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/audit-log`);
    await expect(page.getByText(/platform\.smtp\.update/i).first()).toBeVisible({
      timeout: 10_000,
    });

    const resPromise = page.waitForResponse((r) => {
      if (!r.url().includes('/api/platform/audit-log') || r.request().method() !== 'GET') {
        return false;
      }
      return new URL(r.url()).searchParams.get('q') === 'school.suspend';
    });
    await page.getByLabel(/^search$/i).fill('school.suspend');
    await resPromise;
    await expect(page.getByText(/school\.suspend/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/platform\.smtp\.update/i)).toHaveCount(0);
  });

  test('7.5.3 cursor load-more via scroll', async ({ page }) => {
    let pageCalls = 0;
    await page.route('**/api/platform/audit-log**', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      pageCalls += 1;
      const url = new URL(route.request().url());
      const body = auditPage({
        q: url.searchParams.get('q') ?? undefined,
        cursor: url.searchParams.get('cursor'),
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });

    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/audit-log`);
    await expect(page.getByText(/showing 2 of 3.*scroll for more/i)).toBeVisible({
      timeout: 15_000,
    });

    const showing = page.getByText(/showing 2 of 3/i);
    const scrollViewport = async () => {
      await showing.evaluate((el) => {
        const scroll = el.parentElement?.querySelector(
          'div[style*="max-height"], [class*="scroll"]',
        ) as HTMLElement | null;
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      });
      await page.locator('table').first().hover().catch(() => undefined);
      await page.mouse.wheel(0, 5000);
    };
    await scrollViewport();
    await expect
      .poll(async () => {
        if (pageCalls < 2) await scrollViewport();
        return pageCalls;
      }, { timeout: 15_000 })
      .toBeGreaterThanOrEqual(2);
    await expect(page.getByText(/showing 3 of 3/i)).toBeVisible({ timeout: 12_000 });
    await expect(page.getByText(/platform\.llm\.test/i).first()).toBeVisible();
  });

  test('7.5.4 campus link navigates to /schools/[id]', async ({ page }) => {
    await page.route('**/api/platform/audit-log**', mockAuditLog);
    await loginAs(page, 'jest-super-admin@arvilio.test');
    await page.goto(`${PLATFORM}/audit-log`);
    await expect(page.getByText(/platform\.smtp\.update/i).first()).toBeVisible({
      timeout: 10_000,
    });

    const campusLink = page.getByRole('link', { name: /^school_seed$/i }).first();
    await expect(campusLink).toBeVisible();
    await campusLink.click();
    await expect(page).toHaveURL(/\/schools\/school_seed/, { timeout: 15_000 });
  });
});
