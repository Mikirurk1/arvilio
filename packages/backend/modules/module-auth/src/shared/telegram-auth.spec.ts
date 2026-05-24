import * as crypto from 'node:crypto';
import { BadRequestException } from '@nestjs/common';
import {
  getTelegramBotToken,
  telegramDisplayLabel,
  telegramHandle,
  verifyTelegramLogin,
  type TelegramLoginPayload,
} from './telegram-auth';

function signPayload(payload: Omit<TelegramLoginPayload, 'hash'>, botToken: string): string {
  const withAuthDate = { ...payload, auth_date: Math.floor(Date.now() / 1000) };
  const dataCheckString = Object.entries(withAuthDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  return hash;
}

describe('telegram-auth', () => {
  const botToken = '123456789:AAH-test-bot-token-for-jest';

  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = botToken;
  });

  afterEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN;
  });

  it('getTelegramBotToken returns env value', () => {
    expect(getTelegramBotToken()).toBe(botToken);
  });

  it('verifyTelegramLogin accepts valid hash', () => {
    const base = {
      id: 999,
      first_name: 'Test',
      username: 'jestuser',
      auth_date: Math.floor(Date.now() / 1000),
    };
    const hash = signPayload(base, botToken);
    expect(() => verifyTelegramLogin({ ...base, hash })).not.toThrow();
  });

  it('verifyTelegramLogin rejects bad hash', () => {
    const payload: TelegramLoginPayload = {
      id: 1,
      first_name: 'X',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'deadbeef',
    };
    expect(() => verifyTelegramLogin(payload)).toThrow(BadRequestException);
  });

  it('telegramDisplayLabel prefers @username', () => {
    expect(
      telegramDisplayLabel({
        id: 1,
        first_name: 'A',
        username: 'jest',
        auth_date: 0,
        hash: '',
      }),
    ).toBe('@jest');
  });

  it('telegramHandle normalizes username', () => {
    expect(
      telegramHandle({
        id: 1,
        first_name: 'A',
        username: 'jest',
        auth_date: 0,
        hash: '',
      }),
    ).toBe('@jest');
  });
});
