import { BadRequestException } from '@nestjs/common';
import * as crypto from 'node:crypto';

/** Payload from Telegram Login Widget (https://core.telegram.org/widgets/login). */
export type TelegramLoginPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const MAX_AUTH_AGE_SECONDS = 60 * 60 * 24;

export function getTelegramBotToken(): string | null {
  const token = process.env['TELEGRAM_BOT_TOKEN']?.trim();
  return token || null;
}

export function verifyTelegramLogin(payload: TelegramLoginPayload): void {
  const botToken = getTelegramBotToken();
  if (!botToken) {
    throw new BadRequestException('Telegram bot is not configured on the server');
  }

  if (!payload.hash) {
    throw new BadRequestException('Telegram auth payload is missing hash');
  }

  const dataCheckString = Object.entries(payload)
    .filter(([key, value]) => key !== 'hash' && value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computed !== payload.hash) {
    throw new BadRequestException('Invalid Telegram authorization');
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - payload.auth_date;
  if (ageSeconds > MAX_AUTH_AGE_SECONDS) {
    throw new BadRequestException('Telegram authorization expired. Try again.');
  }
}

export function telegramDisplayLabel(payload: TelegramLoginPayload): string {
  if (payload.username) return `@${payload.username}`;
  const parts = [payload.first_name, payload.last_name].filter(Boolean);
  return parts.join(' ') || String(payload.id);
}

export function telegramHandle(payload: TelegramLoginPayload): string | null {
  if (!payload.username) return null;
  const handle = payload.username.startsWith('@') ? payload.username : `@${payload.username}`;
  return handle;
}
