/**
 * АУДИТ Етап 8 — RBAC негативні сценарії
 * Перевірка редіректів по ролях (route-policy.ts — джерело істини) + API без сесії.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

// ──────────────────────────────────────────────────────
// 8.1 STUDENT заборони
// ──────────────────────────────────────────────────────
test.describe('8.1 student denials', () => {
  test.use({ storageState: STATE.student });

  for (const path of ['/students', '/admin', '/system', '/staff', '/finance', '/billing', '/materials']) {
    test(`student → ${path} → redirect`, async ({ page }) => {
      await page.goto(path);
      await expect(page).not.toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`), { timeout: 10_000 });
      await expect(page).toHaveURL(/\/dashboard|\/login/, { timeout: 10_000 });
    });
  }
});

// ──────────────────────────────────────────────────────
// 8.2 TEACHER заборони
// ──────────────────────────────────────────────────────
test.describe('8.2 teacher denials', () => {
  test.use({ storageState: STATE.teacher });

  for (const path of ['/admin', '/system', '/staff', '/finance', '/billing', '/payment']) {
    test(`teacher → ${path} → redirect`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/dashboard|\/login/, { timeout: 10_000 });
    });
  }
});

// ──────────────────────────────────────────────────────
// 8.3 / 8.4 ADMIN: /system дозволено (код), /payment заборонено
// ──────────────────────────────────────────────────────
test.describe('8.3/8.4 admin scope', () => {
  test.use({ storageState: STATE.admin });

  test('admin → /system → allowed (route-policy)', async ({ page }) => {
    await page.goto('/system');
    await expect(page).toHaveURL(/\/system/, { timeout: 10_000 });
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  });

  test('admin → /payment → redirect (student-only)', async ({ page }) => {
    await page.goto('/payment');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });
});

// ──────────────────────────────────────────────────────
// 8.5 guest → редірект на /login
// ──────────────────────────────────────────────────────
test.describe('8.5 guest denials', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const path of ['/dashboard', '/lessons', '/system', '/billing']) {
    test(`guest → ${path} → /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    });
  }
});

// ──────────────────────────────────────────────────────
// 8.7 тенантна ізоляція: admin школи B не бачить даних school_default
// ──────────────────────────────────────────────────────
test.describe('8.7 tenant isolation', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('fresh-school admin sees no default-school data over HTTP', async ({ page }) => {
    // Реєструємо ізольовану школу через публічний signup (auto-login у context)
    const email = `e2e-isolation-${Date.now()}@soenglish.test`;
    const reg = await page.request.post('/api/auth/register-school', {
      data: { schoolName: 'Isolation Probe School', email, password: 'TestPass123!' },
    });
    expect(reg.status()).toBe(201);

    // GraphQL students — школа щойно створена, чужих студентів бути не може
    const gql = await page.request.post('/api/graphql', {
      data: { query: '{ students { id email } }' },
    });
    expect(gql.status()).toBe(200);
    const students = (await gql.json()) as { data?: { students?: Array<{ email: string }> } };
    const emails = (students.data?.students ?? []).map((s) => s.email);
    expect(emails, 'must not leak default-school students').not.toContain('jest-student@soenglish.test');

    // /students UI — порожній стан, а не ростер default-школи
    await page.goto('/students');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.getByText(/loading students/i).waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    await expect(page.getByText(/jest student/i)).toHaveCount(0);

    // /materials — сідовий матеріал default-школи не видно
    await page.goto('/materials');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    await expect(page.getByText(/Seed material — grammar book/i)).toHaveCount(0);

    // GraphQL adminUsers (Accounts overview) — тільки члени своєї школи
    const admins = await page.request.post('/api/graphql', {
      data: { query: '{ adminUsers { id email } }' },
    });
    expect(admins.status()).toBe(200);
    const adminBody = (await admins.json()) as { data?: { adminUsers?: Array<{ email: string }> } };
    const adminEmails = (adminBody.data?.adminUsers ?? []).map((u) => u.email);
    expect(adminEmails, 'adminUsers must not leak cross-tenant accounts').not.toContain(
      'jest-teacher@soenglish.test',
    );
    // сам admin новоствореної школи — має бути єдиним акаунтом
    expect(adminEmails).toContain(email);
  });
});

// ──────────────────────────────────────────────────────
// 8.6 API без сесії → 401
// ──────────────────────────────────────────────────────
test.describe('8.6 API without session', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const endpoint of ['/api/auth/me', '/api/users/students', '/api/billing/entitlements', '/api/onboarding/tour']) {
    test(`GET ${endpoint} → 401/403`, async ({ request }) => {
      const res = await request.get(endpoint);
      expect([401, 403]).toContain(res.status());
    });
  }
});
