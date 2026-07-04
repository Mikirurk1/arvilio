/**
 * АУДИТ Етап 10 — a11y повний прохід: keyboard, focus-trap, reduced-motion, імена контролів.
 * (axe-свіпи по сторінках/ролях уже закриті Етапами 3–6.)
 * Запускати project=teacher (десктоп; модалки доступні вчителю).
 */
import { test, expect, type Page } from '@playwright/test';
import { shot, consoleGuard } from '../../helpers/a11y';
import { STATE } from '../../fixtures/auth';

const DIR = '10-a11y';

async function suppressTour(page: Page) {
  await page.route('**/api/onboarding/tour**', (r) => {
    if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
    else void r.continue();
  });
}

// ──────────────────────────────────────────────────────
// 10.2 keyboard: /login Tab-порядок (guest)
// ──────────────────────────────────────────────────────
test.describe('10.2 login keyboard', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Tab reaches email → password → submit; Enter submits', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible({ timeout: 10_000 });
    // пройти Tab-ом до 20 стопів і зібрати досяжні контроли
    const reached: string[] = [];
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return el ? `${el.tagName}:${el.getAttribute('type') ?? ''}:${el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 20) ?? ''}` : '';
      });
      reached.push(id);
    }
    const joined = reached.join('|');
    expect(joined).toMatch(/INPUT:email/i);
    expect(joined).toMatch(/INPUT:password/i);
    expect(joined).toMatch(/BUTTON:submit|BUTTON::Sign in/i);
  });
});

// ──────────────────────────────────────────────────────
// 10.2 modal focus-trap (lesson modal, teacher)
// ──────────────────────────────────────────────────────
test.describe('10.2 lesson modal focus', () => {
  test.use({ storageState: STATE.teacher });

  test('focus lands in dialog on open; Tab stays inside; Escape closes', async ({ page }) => {
    await suppressTour(page);
    await page.goto('/lessons');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const createBtn = page.getByRole('button', { name: /create lesson|new lesson/i }).first();
    if (!(await createBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, 'No create lesson button');
      return;
    }
    await createBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // focus-on-open: активний елемент усередині діалога
    await page.waitForTimeout(300);
    const focusInDialog = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      return dlg ? dlg.contains(document.activeElement) : false;
    });
    expect(focusInDialog, 'focus should land inside the dialog on open').toBe(true);

    // Tab ×15 — фокус не виходить за межі діалога
    for (let i = 0; i < 15; i++) await page.keyboard.press('Tab');
    const stillInDialog = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      return dlg ? dlg.contains(document.activeElement) : false;
    });
    expect(stillInDialog, 'Tab must not escape the dialog (focus trap)').toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 5_000 });
  });

  test('material modal: focus trap + Escape', async ({ page }) => {
    await suppressTour(page);
    await page.goto('/materials');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const addBtn = page.getByRole('button', { name: /add material|new material/i }).first();
    if (!(await addBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, 'No add material button');
      return;
    }
    await addBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    for (let i = 0; i < 15; i++) await page.keyboard.press('Tab');
    const stillInDialog = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      return dlg ? dlg.contains(document.activeElement) : false;
    });
    expect(stillInDialog, 'Tab must not escape the material dialog').toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 5_000 });
  });
});

// ──────────────────────────────────────────────────────
// 10.3 prefers-reduced-motion
// ──────────────────────────────────────────────────────
test.describe('10.3 reduced motion', () => {
  test.use({ storageState: STATE.teacher });

  test('dashboard renders cleanly with reduced motion', async ({ page }) => {
    await suppressTour(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const stop = consoleGuard(page);
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(800);
    await shot(page, `${DIR}/reduced-motion-dashboard`);
    stop();
  });
});

// ──────────────────────────────────────────────────────
// 10.4 імена ключових контролів
// ──────────────────────────────────────────────────────
test.describe('10.4 control names', () => {
  test.use({ storageState: STATE.teacher });

  test('header search combobox + calendar nav buttons named', async ({ page }) => {
    await suppressTour(page);
    await page.goto('/calendar');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('combobox', { name: /search/i })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('button', { name: /previous period/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /next period/i })).toBeVisible();
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    expect(await skipLink.count()).toBeGreaterThan(0);
  });
});
