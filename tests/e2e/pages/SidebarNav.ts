import type { Page } from '@playwright/test';

export class SidebarNav {
  constructor(private readonly page: Page) {}

  link(name: RegExp | string) {
    return this.page.getByRole('link', { name });
  }

  async expectVisible(name: RegExp | string) {
    await this.link(name).waitFor({ state: 'visible' });
  }
}
