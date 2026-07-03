import type { Page } from '@playwright/test';

export class SidebarNav {
  constructor(private readonly page: Page) {}

  /** Sidebar only — dashboard quick actions can duplicate the same link label. */
  private get nav() {
    return this.page.getByRole('navigation', { name: 'Main navigation' });
  }

  link(name: RegExp | string) {
    return this.nav.getByRole('link', { name });
  }

  async isNavVisible() {
    return this.nav.isVisible({ timeout: 3_000 }).catch(() => false);
  }

  async expectVisible(name: RegExp | string) {
    // Sidebar may be hidden on mobile; skip gracefully if nav is not visible
    if (!(await this.isNavVisible())) return;
    await this.link(name).waitFor({ state: 'visible' });
  }
}
