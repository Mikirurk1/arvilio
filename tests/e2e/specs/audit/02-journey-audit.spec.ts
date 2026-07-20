/**
 * АУДИТ Етап 2 — Сюжет: Signup → Onboarding wizard → Tour
 * Public project (без storageState) — реєструє нову школу на кожен прогін.
 */
import { test, expect } from '@playwright/test';
import { shot, expectNoA11yViolations, consoleGuard, expectArvi } from '../../helpers/a11y';

const DIR = '02-journey';
const RUN_EMAIL = `e2e-journey-${Date.now()}@arvilio.test`;
const PASSWORD = 'JourneyPass123!';

test.describe.configure({ mode: 'serial' });

test('2.0 /signup render + screenshot + axe', async ({ page }) => {
  const stop = consoleGuard(page);
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: /create your school/i })).toBeVisible({ timeout: 10_000 });
  await shot(page, `${DIR}/2-0-signup`);
  await expectNoA11yViolations(page);
  stop();
});

test('2.11 golden path: signup → wizard → dashboard → tour', async ({ page }) => {
  test.setTimeout(120_000);

  // ── 2.1 реєстрація школи
  await page.goto('/signup');
  await page.getByLabel(/school name/i).fill('E2E Journey School');
  await page.getByLabel(/your name/i).fill('Journey Admin');
  await page.getByLabel(/^email$/i).fill(RUN_EMAIL);
  await page.getByLabel(/^password$/i).fill(PASSWORD);
  const [regResp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('register-school'), { timeout: 20_000 }),
    page.getByRole('button', { name: /create school/i }).click(),
  ]);
  if (regResp.status() >= 400) {
    throw new Error(`register-school ${regResp.status()}: ${await regResp.text().catch(() => '<no body>')}`);
  }

  // auto-login → onboarding
  await page.waitForURL(/\/onboarding/, { timeout: 20_000 });
  await expect(page.getByRole('heading', { name: /school profile/i })).toBeVisible({ timeout: 10_000 });
  const acceptCookies = page.getByRole('button', { name: /accept/i });
  if (await acceptCookies.isVisible({ timeout: 2_000 }).catch(() => false)) await acceptCookies.click();
  await shot(page, `${DIR}/2-3-wizard-profile`);
  await expectNoA11yViolations(page);

  // ── 2.3–2.7 wizard: 5 кроків (перший — Save, решта — Skip)
  const stepTitles = [/school profile/i, /teaching setup/i, /payments/i, /invite teammates/i, /sample content/i];
  for (let i = 0; i < stepTitles.length; i++) {
    await expect(page.getByRole('heading', { name: stepTitles[i] })).toBeVisible({ timeout: 10_000 });
    if (i > 0) await shot(page, `${DIR}/2-wizard-step-${i + 1}`);
    const isLast = i === stepTitles.length - 1;
    const btn = isLast
      ? page.getByRole('button', { name: /finish/i })
      : i === 0
        ? page.getByRole('button', { name: /save & continue/i })
        : page.getByRole('button', { name: /^skip$/i });
    await btn.click();
  }

  // ── 2.8 complete → dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });

  // ── 2.9 tour
  const tour = page.getByRole('dialog', { name: /product tour/i });
  const hasTour = await tour.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
  if (!hasTour) {
    await shot(page, `${DIR}/2-8-dashboard-no-tour`);
    test.info().annotations.push({ type: 'issue', description: 'Tour did not appear on first dashboard visit' });
    return;
  }
  await shot(page, `${DIR}/2-9-tour-step-1`);
  await expectArvi(page, 'greet'); // 2.12: Arvi greet на welcome-кроці туру
  await expectNoA11yViolations(page);
  await tour.getByRole('button', { name: /next/i }).click();
  await page.waitForTimeout(400);
  await shot(page, `${DIR}/2-9-tour-step-2`);
  // 2.9 element-anchored spotlight on sidebar nav (dashboard step)
  await expect(page.locator('[data-tour-spotlight]')).toBeVisible({ timeout: 4_000 });
  await expect(page.locator('[data-tour-nav="/dashboard"]')).toBeVisible();
  // Back повертає
  const backBtn = tour.getByRole('button', { name: /back/i });
  if (await backBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await backBtn.click();
    await page.waitForTimeout(300);
  }
  // добиваємо до Finish
  for (let guard = 0; guard < 12; guard++) {
    const finish = tour.getByRole('button', { name: /finish/i });
    if (await finish.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await finish.click();
      break;
    }
    await tour.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(300);
  }
  await expect(tour).toBeHidden({ timeout: 8_000 });
  await shot(page, `${DIR}/2-9-dashboard-after-tour`);
});

test('2.2 duplicate email shows error', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel(/school name/i).fill('Dup School');
  await page.getByLabel(/^email$/i).fill(RUN_EMAIL);
  await page.getByLabel(/^password$/i).fill(PASSWORD);
  await page.getByRole('button', { name: /create school/i }).click();
  await expect(page.getByRole('alert').or(page.getByText(/already|registered|exists|failed/i)).first())
    .toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/signup/);
  await shot(page, `${DIR}/2-2-duplicate-email`);
});

test('2.10 resume: wizard state persists after re-login', async ({ page }) => {
  // логін щойно створеним адміном; wizard завершено → onboarding має редіректити геть
  await page.goto('/login');
  await page.getByRole('textbox', { name: /email/i }).fill(RUN_EMAIL);
  await page.getByRole('textbox', { name: /password/i }).fill(PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  await page.goto('/onboarding');
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
});
