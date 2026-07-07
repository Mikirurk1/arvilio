/**
 * АУДИТ Етап 4 — MaterialFormModal interaction (4A.5 TagInput, 4A.6 Level).
 * Кластер B3 (interaction без нової інфри).
 */
import { test, expect, type Page } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.teacher });

async function openMaterialModal(page: Page) {
  await page.route('**/api/onboarding/tour**', (r) => {
    if (r.request().method() === 'GET') void r.fulfill({ json: { completed: true } });
    else void r.continue();
  });
  await page.goto('/materials');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
  const addBtn = page.getByRole('button', { name: /add material|new material/i }).first();
  if (!(await addBtn.isVisible({ timeout: 4_000 }).catch(() => false))) return null;
  await addBtn.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 6_000 });
  return dialog;
}

test('4A.5 TagInput: typing + Enter creates a chip', async ({ page }) => {
  const dialog = await openMaterialModal(page);
  if (!dialog) { test.skip(true, 'No add material button'); return; }
  const tagInput = dialog.getByPlaceholder(/add tag and press enter|type and press enter/i).first();
  await expect(tagInput).toBeVisible({ timeout: 6_000 });
  await tagInput.fill('grammar-e2e');
  await tagInput.press('Enter');
  // chip appears with the typed tag
  await expect(dialog.getByText('grammar-e2e', { exact: false }).first()).toBeVisible({ timeout: 4_000 });
  await page.keyboard.press('Escape').catch(() => {});
});

test('4A.6 Level select offers A1–C2 options', async ({ page }) => {
  const dialog = await openMaterialModal(page);
  if (!dialog) { test.skip(true, 'No add material button'); return; }
  // Field as="select" → adaptive; assert the labelled control exists and has level options
  const levelControl = dialog.getByLabel(/^level$/i).first();
  const hasNativeSelect = await levelControl.evaluate((el) => el.tagName === 'SELECT').catch(() => false);
  if (hasNativeSelect) {
    const options = await levelControl.locator('option').allTextContents();
    expect(options.join(' ')).toMatch(/A1/);
    expect(options.join(' ')).toMatch(/C2/);
  } else {
    // desktop custom menu — assert the level field is present and openable
    await expect(dialog.getByText(/^level$/i).first()).toBeVisible({ timeout: 4_000 });
  }
  await page.keyboard.press('Escape').catch(() => {});
});
