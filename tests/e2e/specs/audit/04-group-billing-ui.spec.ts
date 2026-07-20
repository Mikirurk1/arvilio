/**
 * АУДИТ Етап 4 — 4G.2–7 group billing UI on Students → Groups editor.
 * Billing mode uses AdvancedSelect (button + listbox), not a native <select>.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import { suppressTour } from '../../helpers/tour';

test.use({ storageState: STATE.admin });

test('4G.2–7 group billing mode + fixed_total split controls', async ({ page }) => {
  await suppressTour(page);
  await page.goto('/students?view=groups');
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });

  const groupsTab = page.getByRole('radio', { name: /^groups$/i })
    .or(page.getByRole('button', { name: /^groups$/i })).first();
  if (await groupsTab.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await groupsTab.click();
  }

  const newBtn = page.getByRole('button', { name: /new group/i }).first();
  if (!(await newBtn.waitFor({ state: 'visible', timeout: 12_000 }).then(() => true).catch(() => false))) {
    test.skip(true, 'Group lessons feature off — no New group button');
    return;
  }
  await newBtn.click();

  const billingMode = page.getByRole('button', { name: /billing mode/i }).first();
  await expect(billingMode).toBeVisible({ timeout: 8_000 });
  await expect(billingMode).toContainText(/1 lesson credit per member/i);

  await billingMode.click();
  await page.getByRole('listbox').getByRole('button', { name: /fixed amount per lesson/i }).click();
  await expect(page.getByText(/amount \(minor units\)/i)).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText(/^currency$/i).first()).toBeVisible();

  const split = page.getByRole('button', { name: /split mode/i }).first();
  await expect(split).toBeVisible();
  await split.click();
  await page.getByRole('listbox').getByRole('button', { name: /single payer/i }).click();
  await expect(page.getByText(/^payer$/i).first()).toBeVisible({ timeout: 5_000 });

  await billingMode.click();
  await page.getByRole('listbox').getByRole('button', { name: /1 lesson credit per member/i }).click();
  await expect(page.getByText(/amount \(minor units\)/i)).toHaveCount(0);

  await page.getByRole('button', { name: /^cancel$/i }).first().click();
});
