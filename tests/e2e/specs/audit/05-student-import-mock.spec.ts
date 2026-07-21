/**
 * АУДИТ Етап 5 — 5D.4 student CSV import (REST mock on /admin).
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

test.use({ storageState: STATE.admin });

test.describe('5D.4 Student import (mocked REST)', () => {
  test('CSV preview + commit success', async ({ page }) => {
    await page.route('**/api/admin/users/import/preview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: [
            { line: 2, email: 'alice@import.test', displayName: 'Alice Import' },
            { line: 3, email: 'bob@import.test', displayName: 'Bob Import' },
          ],
          invalid: [{ line: 4, email: 'bad', error: 'Invalid email' }],
          seatCapRemaining: 40,
          wouldExceedCap: false,
        }),
      });
    });
    await page.route('**/api/admin/users/import/confirm', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          created: 2,
          skipped: 0,
          failed: [],
        }),
      });
    });

    await page.goto('/admin');
    await expect(page.getByText(/import students|csv/i).first()).toBeVisible({ timeout: 12_000 });

    const csv = `email,fullName\nalice@import.test,Alice Import\nbob@import.test,Bob Import\nbad,Nope\n`;
    const tmp = path.join(os.tmpdir(), `e2e-import-${Date.now()}.csv`);
    fs.writeFileSync(tmp, csv, 'utf8');

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(tmp);
    await expect(page.getByText(/2 valid|alice@import.test/i).first()).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: /import 2 students|import .*students/i }).click();
    await expect(page.getByText(/2 students created|created/i).first()).toBeVisible({
      timeout: 10_000,
    });

    fs.unlinkSync(tmp);
  });

  test('preview validation error surfaces', async ({ page }) => {
    await page.route('**/api/admin/users/import/preview', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'CSV is empty or missing email column' }),
      });
    });

    await page.goto('/admin');
    await expect(page.getByText(/import students|csv/i).first()).toBeVisible({ timeout: 12_000 });

    const tmp = path.join(os.tmpdir(), `e2e-import-bad-${Date.now()}.csv`);
    fs.writeFileSync(tmp, 'name\nonly\n', 'utf8');
    await page.locator('input[type="file"]').first().setInputFiles(tmp);
    await expect(page.getByText(/preview failed|empty|email|csv/i).first()).toBeVisible({
      timeout: 10_000,
    });
    fs.unlinkSync(tmp);
  });
});
