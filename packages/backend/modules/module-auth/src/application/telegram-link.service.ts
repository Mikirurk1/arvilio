import { BadRequestException, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import * as crypto from 'node:crypto';
import {
  deleteTelegramWebhook,
  fetchTelegramUpdates,
  resolveTelegramBotUsername,
  sendTelegramBotMessage,
  shouldTelegramDevPolling,
} from '@be/notifications/telegram';
import { linkTelegramAccount } from '../infrastructure/link-telegram-account';

const LINK_PREFIX = 'link_';
const TOKEN_TTL_MS = 15 * 60 * 1000;

function extractStartPayload(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed.toLowerCase().startsWith('/start')) return null;
  const rest = trimmed.replace(/^\/start(?:@\S+)?\s*/i, '').trim();
  return rest || null;
}

function tokenFromStartPayload(payload: string): string | null {
  if (payload.startsWith(LINK_PREFIX)) {
    const token = payload.slice(LINK_PREFIX.length).trim();
    return token || null;
  }
  // Deep-link param is sometimes passed without our prefix in older clients.
  if (/^[a-f0-9]{32}$/i.test(payload)) return payload;
  return null;
}

@Injectable()
export class TelegramLinkService implements OnModuleInit, OnModuleDestroy {
  private stopPolling = false;
  private offset = 0;
  private loggedPollingConflict = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    if (!shouldTelegramDevPolling()) return;
    void deleteTelegramWebhook().then(() => {
      console.log('[telegram] dev polling enabled (localhost bot link flow)');
      return this.pollLoop();
    });
  }

  onModuleDestroy(): void {
    this.stopPolling = true;
  }

  async startBotLink(userId: string): Promise<{
    code: string;
    deepLink: string;
    tgDeepLink: string;
    expiresAt: string;
  }> {
    const botUsername = await resolveTelegramBotUsername();
    if (!botUsername) {
      throw new BadRequestException('Telegram bot is not configured on the server');
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    const startParam = `${LINK_PREFIX}${token}`;

    await this.prisma.telegramLinkToken.deleteMany({ where: { userId } });
    await this.prisma.telegramLinkToken.create({
      data: { userId, token, expiresAt },
    });

    return {
      code: token,
      deepLink: `https://t.me/${botUsername}?start=${startParam}`,
      tgDeepLink: `tg://resolve?domain=${botUsername}&start=${startParam}`,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async getLinkStatusForUser(
    userId: string,
    code: string,
  ): Promise<{ status: 'pending' | 'linked' | 'expired' | 'unknown' }> {
    const row = await this.prisma.telegramLinkToken.findFirst({
      where: { token: code, userId },
    });
    if (!row) {
      const account = await this.prisma.oAuthAccount.findFirst({
        where: { userId, provider: 'TELEGRAM' },
      });
      return account ? { status: 'linked' } : { status: 'unknown' };
    }
    if (row.expiresAt < new Date()) {
      await this.prisma.telegramLinkToken.delete({ where: { id: row.id } }).catch(() => undefined);
      return { status: 'expired' };
    }
    const account = await this.prisma.oAuthAccount.findFirst({
      where: { userId, provider: 'TELEGRAM' },
    });
    if (account) {
      await this.prisma.telegramLinkToken.delete({ where: { id: row.id } }).catch(() => undefined);
      return { status: 'linked' };
    }
    return { status: 'pending' };
  }

  async handleTelegramUpdate(update: {
    message?: {
      chat: { id: number };
      from?: {
        id: number;
        username?: string;
        first_name?: string;
        last_name?: string;
      };
      text?: string;
    };
  }): Promise<void> {
    const text = update.message?.text;
    const chatId = update.message?.chat.id;
    if (!text || chatId === undefined) return;

    const startPayload = extractStartPayload(text);
    if (startPayload === null && !text.trim().toLowerCase().startsWith('/start')) return;

    if (startPayload === null || startPayload === '') {
      await sendTelegramBotMessage(
        String(chatId),
        'To connect Arvilio, open Profile → Connections on the website, tap «Connect via Telegram», then press Start in the prompt from that link.',
      );
      return;
    }

    const token = tokenFromStartPayload(startPayload);
    if (!token) {
      await sendTelegramBotMessage(
        String(chatId),
        'Invalid link. On the website tap «Connect via Telegram» again to get a fresh link.',
      );
      return;
    }

    const row = await this.prisma.telegramLinkToken.findUnique({ where: { token } });
    if (!row || row.expiresAt < new Date()) {
      await sendTelegramBotMessage(
        String(chatId),
        'This link has expired. Go back to Arvilio Profile → Connections and tap «Connect via Telegram» again.',
      );
      return;
    }

    const from = update.message?.from;
    if (!from) return;

    try {
      await linkTelegramAccount(this.prisma, row.userId, {
        id: from.id,
        username: from.username,
        first_name: from.first_name ?? 'User',
        last_name: from.last_name,
      });
      await this.prisma.telegramLinkToken.delete({ where: { id: row.id } }).catch(() => undefined);
      console.log(`[telegram] linked user ${row.userId} via bot (chat ${chatId})`);
      await sendTelegramBotMessage(
        String(chatId),
        '✅ Arvilio connected. You can return to the website — the status will update automatically.',
      );
    } catch (error) {
      const message =
        error instanceof BadRequestException
          ? (error.message as string)
          : 'Could not link this Telegram account. Try again from the website.';
      console.warn('[telegram] bot link failed', message);
      await sendTelegramBotMessage(String(chatId), message);
    }
  }

  private async pollLoop(): Promise<void> {
    while (!this.stopPolling) {
      try {
        const { updates, conflict } = await fetchTelegramUpdates(this.offset);
        if (conflict) {
          if (!this.loggedPollingConflict) {
            this.loggedPollingConflict = true;
            console.warn(
              '[telegram] getUpdates 409: another client is already polling this bot token. ' +
                'Stop duplicate `npm run dev`, set TELEGRAM_DEV_POLLING=false in .env, or unset TELEGRAM_BOT_TOKEN if you are not testing Telegram link.',
            );
          }
          await sleep(60_000);
          continue;
        }
        for (const update of updates) {
          this.offset = update.update_id + 1;
          await this.handleTelegramUpdate(update);
        }
      } catch (error) {
        console.warn('[telegram] dev polling error', error);
        await sleep(2000);
      }
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
