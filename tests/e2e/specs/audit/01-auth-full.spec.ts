/**
 * АУДИТ Етап 1 — Публічні / Auth: повне покриття відкритих пунктів плану.
 * 1A.3/4/7/8, 1B (signup), 1C.2, 1D (reset-password), 1E.1/2/4.
 * (1A.6 / 1C.3 rate-limit — не тестуються: E2E шле x-e2e-skip-throttle bypass.)
 */
import { test, expect } from '@playwright/test';
import { shot, expectNoA11yViolations } from '../../helpers/a11y';
import { LoginPage } from '../../pages/LoginPage';

test.use({ storageState: { cookies: [], origins: [] } });

/** Signup catalog label is "Work email", not bare "Email". */
const signupEmail = (page: import('@playwright/test').Page) =>
  page.locator('#signup-email');
const signupPassword = (page: import('@playwright/test').Page) =>
  page.locator('#signup-password');

// ──────────────────────────────────────────────────────
// 1A. /login
// ──────────────────────────────────────────────────────
test.describe('1A. login', () => {
  test('1A.3 empty fields → validation, no network request', async ({ page }) => {
    let loginCalled = false;
    await page.route('**/api/auth/login', (r) => { loginCalled = true; void r.continue(); });
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    expect(loginCalled, 'no network request on empty submit').toBe(false);
  });

  test('1A.4 invalid email format → validation, no network request', async ({ page }) => {
    let loginCalled = false;
    await page.route('**/api/auth/login', (r) => { loginCalled = true; void r.continue(); });
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill('not-an-email');
    await page.getByLabel('Password', { exact: true }).fill('whatever');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
    expect(loginCalled).toBe(false);
  });

  test('1A.7 show-password toggle reveals the value', async ({ page }) => {
    await page.goto('/login');
    const pwd = page.getByLabel('Password', { exact: true });
    await pwd.fill('SecretPass1');
    await expect(pwd).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: /show password/i }).click();
    await expect(pwd).toHaveAttribute('type', 'text');
  });

  for (const role of ['teacher', 'admin', 'super-admin'] as const) {
    test(`1A.8 login as ${role} → /dashboard`, async ({ page }) => {
      const login = new LoginPage(page);
      await login.goto();
      await login.login(`jest-${role}@arvilio.test`, 'TestPass123!');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  }
});

// ──────────────────────────────────────────────────────
// 1B. /signup
// ──────────────────────────────────────────────────────
test.describe('1B. signup', () => {
  test('1B.1 renders school/name/email/password fields + axe', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /create your school/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(/school name/i)).toBeVisible();
    await expect(page.getByLabel(/work email|email/i)).toBeVisible();
    await expect(signupPassword(page)).toBeVisible();
    const accept = page.getByRole('button', { name: /accept/i });
    if (await accept.isVisible({ timeout: 1_500 }).catch(() => false)) await accept.click();
    await expectNoA11yViolations(page);
  });

  test('1B.2 disposable email → error', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/school name/i).fill('Disposable Probe');
    await signupEmail(page).fill(`probe-${Date.now()}@mailinator.com`);
    await signupPassword(page).fill('TestPass123!');
    await page.getByRole('button', { name: /create school/i }).click();
    await expect(page.getByRole('alert').filter({ hasText: /.+/ }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/signup/);
  });

  test('1B.3 weak password → error (no account created)', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/school name/i).fill('Weak Pass Probe');
    await signupEmail(page).fill(`weak-${Date.now()}@arvilio.test`);
    await signupPassword(page).fill('123');
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('register-school'), { timeout: 10_000 }).catch(() => null),
      page.getByRole('button', { name: /create school/i }).click(),
    ]);
    if (resp) expect(resp.status()).toBeGreaterThanOrEqual(400);
    await expect(page).toHaveURL(/\/signup/);
  });

  test('1B.4 duplicate email → error', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/school name/i).fill('Dup Probe');
    await signupEmail(page).fill('jest-admin@arvilio.test'); // already exists
    await signupPassword(page).fill('TestPass123!');
    await page.getByRole('button', { name: /create school/i }).click();
    await expect(page.getByText(/already registered|already exists/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/signup/);
  });

  test('1B.6 success → auto-login → onboarding', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/school name/i).fill('Signup Success Probe');
    await signupEmail(page).fill(`ok-${Date.now()}@arvilio.test`);
    await signupPassword(page).fill('TestPass123!');
    await page.getByRole('button', { name: /create school/i }).click();
    await page.waitForURL(/\/onboarding/, { timeout: 20_000 });
  });
});

// ──────────────────────────────────────────────────────
// 1C. /forgot-password
// ──────────────────────────────────────────────────────
test.describe('1C. forgot-password', () => {
  test('1C.2 invalid email → validation (stays on page)', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByRole('textbox', { name: /email/i }).fill('not-an-email');
    await page.getByRole('button', { name: /send|reset|link/i }).first().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/forgot-password/);
    // native email validity or app-level error — no success state
    await expect(page.getByText(/check your inbox/i)).toHaveCount(0);
  });
});

// ──────────────────────────────────────────────────────
// 1D. /reset-password
// ──────────────────────────────────────────────────────
test.describe('1D. reset-password', () => {
  test('1D.1 ?token=... → new-password form shown', async ({ page }) => {
    await page.goto('/reset-password?token=some-token-value');
    await expect(page.getByLabel(/new password/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await shot(page, '01-auth/1D-reset-form');
  });

  test('1D.2 missing token → friendly message, no form', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.getByText(/reset link is (incomplete|missing|invalid)/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(/new password/i)).toHaveCount(0);
  });

  test('1D.2b invalid/expired token → error on submit', async ({ page }) => {
    await page.goto('/reset-password?token=invalid-expired-token');
    await page.getByLabel(/new password/i).fill('NewTestPass123!');
    await page.getByLabel(/confirm password/i).fill('NewTestPass123!');
    await page.getByRole('button', { name: /update password/i }).click();
    await expect(page.getByRole('alert').filter({ hasText: /.+/ }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/reset-password/);
  });
});

// ──────────────────────────────────────────────────────
// 1E. Static + axe
// ──────────────────────────────────────────────────────
test.describe('1E. static pages', () => {
  test('1E.1 /privacy → 200 + content', async ({ page }) => {
    const res = await page.goto('/privacy');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible({ timeout: 10_000 });
  });

  test('1E.2 /status → 200', async ({ page }) => {
    const res = await page.goto('/status');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: /system status/i })).toBeVisible({ timeout: 10_000 });
  });

  test('1E.4 axe: /login, /signup, /forgot-password, /privacy', async ({ page }) => {
    for (const path of ['/login', '/signup', '/forgot-password', '/privacy']) {
      await page.goto(path);
      await page.locator('main, [data-auth-route], body').first().waitFor({ state: 'visible', timeout: 10_000 });
      const accept = page.getByRole('button', { name: /accept/i });
      if (await accept.isVisible({ timeout: 1_000 }).catch(() => false)) await accept.click();
      await expectNoA11yViolations(page);
    }
  });
});
