import type { Page } from '@playwright/test';

export class CalendarPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/calendar');
  }

  heading() {
    return this.page.getByRole('heading', { name: 'Calendar' });
  }
}
