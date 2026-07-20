/**
 * АУДИТ Етап 4 — 4E.2 створення групи (B2 мутаційний флоу з cleanup).
 * Потрібно: group lessons enabled + ≥2 студенти (обидва в сіді). Створюємо групу з
 * 2 учасниками через /students?view=groups UI, перевіряємо появу, прибираємо через
 * deleteStudentGroup GraphQL у finally.
 */
import { test, expect } from '@playwright/test';
import { STATE } from '../../fixtures/auth';

test.use({ storageState: STATE.admin });

const DELETE = `mutation($id: ID!){ deleteStudentGroup(id:$id){ ok } }`;
const LIST = `{ studentGroups { id name } }`;

test('4E.2 create student group with 2 members (self-cleanup)', async ({ page }) => {
  const groupName = `E2E Group ${Date.now()}`;
  let createdId: string | null = null;

  try {
    await page.goto('/students?view=groups');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });

    const newBtn = page.getByRole('button', { name: /new group/i }).first();
    if (!(await newBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false))) {
      test.skip(true, 'Group lessons feature off — no New group button');
      return;
    }
    await newBtn.click();

    await page.getByLabel(/group name/i).fill(groupName);

    // add 2 members: click "Add student" to add a row, then open the picker and select
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: /^add student$/i }).click();
      // the new row has an AdvancedSelect button — open it and pick first option
      const picker = page.getByRole('button', { name: /search and select a student/i }).last();
      await picker.waitFor({ state: 'visible', timeout: 6_000 });
      await picker.click();
      const option = page.getByRole('option').first();
      await option.waitFor({ state: 'visible', timeout: 6_000 });
      await option.click();
      await page.waitForTimeout(400);
    }

    await page.getByRole('button', { name: /create group/i }).click();

    await expect
      .poll(async () => {
        const res = await page.request.post('/api/graphql', { data: { query: LIST } });
        const body = (await res.json()) as { data?: { studentGroups?: Array<{ id: string; name: string }> } };
        const row = (body.data?.studentGroups ?? []).find((g) => g.name === groupName);
        createdId = row?.id ?? null;
        return Boolean(row);
      }, { timeout: 12_000 })
      .toBe(true);

    expect(createdId).toBeTruthy();
  } finally {
    if (createdId) {
      await page.request.post('/api/graphql', { data: { query: DELETE, variables: { id: createdId } } });
    }
  }
});
