/**
 * АУДИТ Етап 1 — 1D.3 reset-password happy path (seeded token).
 * Re-plants token before the test (token is single-use). Runs only on `public`
 * so parallel projects don't race on the same token.
 */
import * as crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

const E2E_RESET_PASSWORD_RAW_TOKEN =
  'e2e-reset-probe-token-0123456789abcdef0123456789ab';
const PROBE_EMAIL = 'jest-reset-probe@arvilio.test';
const TEMP_PASSWORD = 'TempResetPass123!';

async function plantResetToken(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL ??
    'postgresql://soenglish:soenglish@localhost:5432/soenglish?schema=public';
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const user = await prisma.user.findUnique({
      where: { email: PROBE_EMAIL },
      select: { id: true },
    });
    if (!user) throw new Error(`Missing seed user ${PROBE_EMAIL}`);
    const tokenHash = crypto.createHash('sha256').update(E2E_RESET_PASSWORD_RAW_TOKEN).digest('hex');
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

test('1D.3 valid token → update password → /login?reset=success', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'public', 'Single-use token — public project only');

  await plantResetToken();

  await page.goto(`/reset-password?token=${encodeURIComponent(E2E_RESET_PASSWORD_RAW_TOKEN)}`);
  await expect(page.getByLabel(/new password/i)).toBeVisible({ timeout: 10_000 });
  await page.getByLabel(/new password/i).fill(TEMP_PASSWORD);
  await page.getByLabel(/confirm password/i).fill(TEMP_PASSWORD);
  await page.getByRole('button', { name: /update password/i }).click();
  await expect(page).toHaveURL(/\/login\?reset=success/, { timeout: 15_000 });

  await page.getByRole('textbox', { name: /email/i }).fill(PROBE_EMAIL);
  await page.getByLabel('Password', { exact: true }).fill(TEMP_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
});
