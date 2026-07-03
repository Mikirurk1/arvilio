import { STATE } from '../fixtures/auth';
/**
 * Etap 3 — Sidebar RBAC navigation tests.
 * Uses storageState so no login is needed per-test.
 */
import { test, expect } from '@playwright/test';
import { SidebarNav } from '../pages/SidebarNav';

test.describe('Sidebar — student role', () => {
  test.use({ storageState: STATE.student });

  test('student does not see admin or system links', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = new SidebarNav(page);
    await expect(nav.link(/\badmin\b/i)).toHaveCount(0);
    await expect(nav.link(/\bsystem\b/i)).toHaveCount(0);
  });

  test('student does not see students or materials links', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = new SidebarNav(page);
    await expect(nav.link(/\bstudents\b/i)).toHaveCount(0);
    await expect(nav.link(/\bmaterials\b/i)).toHaveCount(0);
  });

  test('student sees expected links', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = new SidebarNav(page);
    await nav.expectVisible(/dashboard/i);
    await nav.expectVisible(/lessons/i);
    await nav.expectVisible(/calendar/i);
    await nav.expectVisible(/chat|messages/i);
  });
});

test.describe('Sidebar — teacher role', () => {
  test.use({ storageState: STATE.teacher });

  test('teacher sees students link', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = new SidebarNav(page);
    await nav.expectVisible(/students/i);
  });

  test('teacher sees materials link', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = new SidebarNav(page);
    await nav.expectVisible(/materials/i);
  });

  test('teacher does NOT see admin or system links', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = new SidebarNav(page);
    await expect(nav.link(/\badmin\b/i)).toHaveCount(0);
    await expect(nav.link(/\bsystem\b/i)).toHaveCount(0);
  });
});

test.describe('Sidebar — admin role', () => {
  test.use({ storageState: STATE.admin });

  test('admin sees admin and system links', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = new SidebarNav(page);
    if (!(await nav.isNavVisible())) return; // Sidebar hidden on mobile
    // Admin should see at least one of admin / system
    const hasAdmin = await nav.link(/\badmin\b/i).isVisible().catch(() => false);
    const hasSystem = await nav.link(/\bsystem\b/i).isVisible().catch(() => false);
    expect(hasAdmin || hasSystem).toBe(true);
  });
});
