/**
 * Etap 1 — Auth flows (public project, no storageState).
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.use({ storageState: { cookies: [], origins: [] } });

const email = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'jest-student@arvilio.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

test.describe('Login page', () => {
  test('renders branding logo and form fields', async ({ page }) => {
    await page.goto('/login');
    // Logo is rendered as branded text, not an <img>
    await expect(page.getByText(/arvilio/i).first()).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|увійти/i })).toBeVisible();
  });

  test('shows error on wrong credentials', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.getByLabel('Email', { exact: true }).fill('wrong@example.com');
    await page.getByLabel('Password', { exact: true }).fill('wrongpass');
    await page.getByRole('button', { name: /sign in|увійти/i }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 8_000 });
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('redirects to dashboard after successful login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, password);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('forgot-password link navigates to reset page', async ({ page }) => {
    await page.goto('/login');
    const link = page.getByRole('link', { name: /forgot|забули/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/forgot-password|\/reset/);
  });

  test('unauthenticated /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Forgot password page', () => {
  test('renders email field and submit button', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send|надіслати/i })).toBeVisible();
  });

  test('shows success state after submitting valid email', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill(email);
    await page.getByRole('button', { name: /send|надіслати/i }).click();
    // Success message: "Check your inbox"
    await expect(
      page.getByText(/check your inbox|check your email|перевірте пошту/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
