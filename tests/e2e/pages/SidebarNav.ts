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

  async expectVisible(name: RegExp | string) {
    await this.link(name).waitFor({ state: 'visible' });
  }
}
