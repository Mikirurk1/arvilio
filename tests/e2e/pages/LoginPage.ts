import type { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    const loginResponse = this.page.waitForResponse(
      (res) =>
        res.url().includes('/api/auth/login') && res.request().method() === 'POST',
      { timeout: 30_000 },
    );
    await this.page.getByRole('button', { name: /sign in|log in|увійти/i }).click();
    const response = await loginResponse;
    if (!response.ok()) {
      throw new Error(`Login failed with status ${response.status()}`);
    }
    await this.page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  }
}
