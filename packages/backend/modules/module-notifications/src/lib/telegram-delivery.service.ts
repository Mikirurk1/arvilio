import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@soenglish/data-access-prisma';
import { escapeTelegramHtml, sendTelegramBotMessage } from './telegram-bot.client';

@Injectable()
export class TelegramDeliveryService {
  private readonly logger = new Logger(TelegramDeliveryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Numeric Telegram user id from linked OAuth account (Login Widget). */
  async resolveChatId(userId: string): Promise<string | null> {
    const account = await this.prisma.oAuthAccount.findFirst({
      where: { userId, provider: 'TELEGRAM' },
      select: { providerAccountId: true },
    });
    const id = account?.providerAccountId?.trim();
    return id || null;
  }

  async sendHtml(chatId: string, html: string): Promise<boolean> {
    return sendTelegramBotMessage(chatId, html, { parseMode: 'HTML' });
  }

  async sendToUser(userId: string, html: string): Promise<boolean> {
    const chatId = await this.resolveChatId(userId);
    if (!chatId) return false;
    const ok = await this.sendHtml(chatId, html);
    if (!ok) {
      this.logger.warn(`Telegram delivery failed for user ${userId}`);
    }
    return ok;
  }

  formatWelcome(displayName: string, appUrl: string): string {
    const name = escapeTelegramHtml(displayName);
    const url = escapeTelegramHtml(appUrl);
    return (
      `✅ <b>SoEnglish connected</b>\n\n` +
      `Hi ${name}, you will receive lesson reminders and other alerts here when enabled in Profile → Notifications.\n\n` +
      `<a href="${url}">Open SoEnglish</a>`
    );
  }
}
