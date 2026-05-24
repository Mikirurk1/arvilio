import type { Page } from '@playwright/test';

export class ChatPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/chat');
  }

  inboxHeading() {
    return this.page.getByRole('heading', { name: 'Messages' });
  }

  searchField() {
    return this.page.getByRole('searchbox', { name: /search conversations/i });
  }

  newMessageButton() {
    return this.page.getByRole('button', { name: /new message/i });
  }
}
