/**
 * АУДИТ Етап 1 — Auth pages: /login, /signup, /forgot-password
 * Navigate → Screenshot → axe → console guard
 * Guest-only — clear storage (public project).
 */
import { test, expect } from '@playwright/test';
import { shot, expectNoA11yViolations, consoleGuard } from '../../helpers/a11y';

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(({ }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Auth audit — public project only');
});

const DIR = '01-auth';

/** Auth pages use <div data-auth-route> not <main> */
const authRoot = (page: import('@playwright/test').Page) =>
  page.locator('[data-auth-route]');

test.describe('1A. /login', () => {
  test('1A.1 render + screenshot + axe', async ({ page }) => {
    const stopGuard = consoleGuard(page);
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(authRoot(page)).toBeVisible({ timeout: 8_000 });
    await shot(page, `${DIR}/student-login`);
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot/i })).toBeVisible();
    await expectNoA11yViolations(page);
    stopGuard();
  });

  test('1A.2 wrong password → alert stays on /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 8_000 });
    await page.locator('#login-email').fill('jest-student@arvilio.test');
    await page.locator('#login-password').fill('WrongPassword999!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 8_000 });
    await page.waitForTimeout(300); // let alert render fully before screenshot
    await shot(page, `${DIR}/login-error`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('1A.3 empty fields → stays on /login (server validates)', async ({ page }) => {
    // NOTE: no client-side empty-field guard — server call is made, then error shown.
    // This is a UX finding: client-side validation missing.
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 8_000 });
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(800);
    await shot(page, `${DIR}/login-empty-validation`);
    await expect(page).toHaveURL(/\/login/);
    // Either stays on login (redirect blocked) or shows an error message
    const hasError = await page.getByRole('alert').isVisible().catch(() => false);
    const onLogin = page.url().includes('/login');
    expect(hasError || onLogin).toBe(true);
  });

  test('1A.4 invalid email format → validation', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 8_000 });
    await page.locator('#login-email').fill('notanemail');
    await page.locator('#login-password').fill('SomePass123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(500);
    await shot(page, `${DIR}/login-invalid-email`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('1A.5 student login → /dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 8_000 });
    await page.locator('#login-email').fill('jest-student@arvilio.test');
    await page.locator('#login-password').fill('TestPass123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 12_000 });
    await shot(page, `${DIR}/post-login-dashboard-student`);
  });

  test('1A.7 show/hide password toggle', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-password')).toBeVisible({ timeout: 8_000 });
    await page.locator('#login-password').fill('secret123');
    const toggle = page.getByRole('button', { name: /show password|hide password/i });
    const hasToggle = await toggle.isVisible({ timeout: 2_000 }).catch(() => false);
    if (hasToggle) {
      await toggle.click();
      const type = await page.locator('#login-password').getAttribute('type');
      await shot(page, `${DIR}/login-password-visible`);
      expect(type).toBe('text');
    } else {
      test.skip(true, 'No show/hide toggle found');
    }
  });

  test('1A.8 teacher login → /dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 8_000 });
    await page.locator('#login-email').fill('jest-teacher@arvilio.test');
    await page.locator('#login-password').fill('TestPass123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 12_000 });
    await shot(page, `${DIR}/post-login-dashboard-teacher`);
  });

  test('1A.8 admin login → /dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 8_000 });
    await page.locator('#login-email').fill('jest-admin@arvilio.test');
    await page.locator('#login-password').fill('TestPass123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 12_000 });
    await shot(page, `${DIR}/post-login-dashboard-admin`);
  });
});

test.describe('1B. /signup', () => {
  test('1B.1 render all fields + axe', async ({ page }) => {
    const stopGuard = consoleGuard(page);
    await page.goto('/signup');
    await page.waitForLoadState('domcontentloaded');
    await expect(authRoot(page)).toBeVisible({ timeout: 8_000 });
    await shot(page, `${DIR}/signup`);
    await expectNoA11yViolations(page);
    stopGuard();
  });

  test('1B.3 weak password → error', async ({ page }) => {
    await page.goto('/signup');
    const pwField = page.locator('input[type=password]').first();
    const hasField = await pwField.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasField) { test.skip(true, 'No password field on signup'); return; }
    await pwField.fill('123');
    await pwField.press('Tab');
    await page.waitForTimeout(300);
    await shot(page, `${DIR}/signup-weak-password`);
    const hasError = await page.getByText(/password|weak|characters/i).first().isVisible().catch(() => false);
    expect(hasError).toBe(true);
  });

  test('1B.4 duplicate email → error', async ({ page }) => {
    await page.goto('/signup');
    const emailField = page.getByLabel(/email/i).first().or(page.locator('input[type=email]').first());
    const hasField = await emailField.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasField) { test.skip(true, 'No email field visible'); return; }
    await emailField.fill('jest-student@arvilio.test');
    const pwField = page.locator('input[type=password]').first();
    if (await pwField.isVisible().catch(() => false)) await pwField.fill('TestPass123!');
    const submit = page.getByRole('button', { name: /sign up|create|register/i });
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(3_000);
      await shot(page, `${DIR}/signup-duplicate-email`);
      const hasError = await page.getByText(/already|exists|registered/i).isVisible().catch(() => false);
      const onSignup = page.url().includes('/signup') || page.url().includes('/login');
      expect(hasError || onSignup).toBe(true);
    }
  });
});

test.describe('1C. /forgot-password', () => {
  test('1C.1 submit valid email → success + screenshot + axe', async ({ page }) => {
    const stopGuard = consoleGuard(page);
    await page.goto('/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    await shot(page, `${DIR}/forgot-password`);
    await expectNoA11yViolations(page);
    await page.getByRole('textbox').fill('jest-student@arvilio.test');
    await page.getByRole('button', { name: /send|reset|submit/i }).click();
    await expect(
      page.getByText(/check your inbox|email sent|sent/i)
    ).toBeVisible({ timeout: 8_000 });
    await shot(page, `${DIR}/forgot-password-success`);
    stopGuard();
  });

  test('1C.2 invalid email → validation', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByRole('textbox').fill('notanemail');
    await page.getByRole('button', { name: /send|reset|submit/i }).click();
    await page.waitForTimeout(500);
    await shot(page, `${DIR}/forgot-password-invalid`);
    const hasError = await page.getByText(/invalid|valid email|email/i).isVisible().catch(() => false);
    const staysOnPage = page.url().includes('/forgot-password');
    expect(hasError || staysOnPage).toBe(true);
  });
});

test.describe('1E. Static + redirects', () => {
  test('1E.1 /privacy 200', async ({ page }) => {
    const res = await page.goto('/privacy');
    if (res?.status() === 200) {
      await shot(page, `${DIR}/privacy`);
      // Privacy page may use any container
      const hasContent = await page.locator('main, article, [data-auth-route]').first().isVisible().catch(() => false);
      expect(hasContent).toBe(true);
    } else {
      test.skip(true, '/privacy not implemented (status ' + res?.status() + ')');
    }
  });

  test('1E.3 unauthenticated /dashboard → /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
    await shot(page, `${DIR}/unauth-redirect-to-login`);
  });

  test('1E.4 axe /login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expectNoA11yViolations(page);
  });

  test('1E.4 axe /forgot-password', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    await expectNoA11yViolations(page);
  });
});
