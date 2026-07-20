import type { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    // waitUntil domcontentloaded + retry: the dev server occasionally aborts one of
    // several concurrent first navigations (net::ERR_ABORTED) when parallel setup
    // workers hit /login at the same time.
    for (let attempt = 1; ; attempt++) {
      try {
        await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
        break;
      } catch (err) {
        if (attempt >= 3) throw err;
        await this.page.waitForTimeout(1_000 * attempt);
      }
    }
    // Dismiss cookie consent banner — it appears after hydration and blocks login redirect.
    await this.dismissCookieBanner();
  }

  private async dismissCookieBanner() {
    const banner = this.page.getByRole('dialog', { name: /cookie/i });
    try {
      // Wait up to 4 s for the banner; if it never appears, we're fine.
      await banner.waitFor({ state: 'visible', timeout: 4_000 });
      await banner.getByRole('button', { name: /accept|decline/i }).first().click();
      await banner.waitFor({ state: 'hidden', timeout: 4_000 });
    } catch {
      // banner never appeared or already gone
    }
  }

  async login(email: string, password: string) {
    const maxAttempts = process.env.CI ? 5 : 2;
    let lastStatus = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const emailInput = this.page.getByLabel('Email', { exact: true });
      const passwordInput = this.page.getByLabel('Password', { exact: true });
      // Hydration race: controlled inputs wipe values filled before React hydrates
      // (dev-mode hydration can land seconds after DOMContentLoaded). Fill, give
      // hydration a beat, and re-check until the values stick.
      for (let fillTry = 0; fillTry < 10; fillTry++) {
        if ((await emailInput.inputValue()) !== email) await emailInput.fill(email);
        if ((await passwordInput.inputValue()) !== password) await passwordInput.fill(password);
        await this.page.waitForTimeout(400);
        if (
          (await emailInput.inputValue()) === email &&
          (await passwordInput.inputValue()) === password
        ) {
          break;
        }
      }

      // Ensure cookie banner is gone before clicking Sign in — it can appear
      // asynchronously after hydration and intercept the click.
      await this.dismissCookieBanner();

      const loginResponse = this.page.waitForResponse(
        (res) =>
          res.url().includes('/api/auth/login') && res.request().method() === 'POST',
        { timeout: 30_000 },
      );
      await this.page.getByRole('button', { name: /sign in|log in|увійти/i }).click();
      const response = await loginResponse;
      lastStatus = response.status();

      if (response.ok()) {
        await this.page.waitForURL(/\/dashboard/, { timeout: 30_000 });
        return;
      }

      if ((lastStatus >= 500 || lastStatus === 429) && attempt < maxAttempts) {
        await this.page.waitForTimeout(lastStatus === 429 ? 5_000 : 1500 * attempt);
        await this.goto();
        continue;
      }

      throw new Error(`Login failed with status ${lastStatus}`);
    }
  }
}
