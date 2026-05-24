import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import * as telegramBot from './telegram-bot.client';
import { TelegramDeliveryService } from './telegram-delivery.service';

jest.mock('./telegram-bot.client', () => ({
  escapeTelegramHtml: jest.fn((s: string) => s),
  sendTelegramBotMessage: jest.fn(),
}));

describe('TelegramDeliveryService', () => {
  let service: TelegramDeliveryService;
  const prisma = {
    oAuthAccount: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [TelegramDeliveryService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(TelegramDeliveryService);
  });

  it('resolveChatId returns linked Telegram id', async () => {
    prisma.oAuthAccount.findFirst.mockResolvedValue({ providerAccountId: '12345' });
    await expect(service.resolveChatId('u1')).resolves.toBe('12345');
  });

  it('sendToUser returns false without linked account', async () => {
    prisma.oAuthAccount.findFirst.mockResolvedValue(null);
    await expect(service.sendToUser('u1', '<b>hi</b>')).resolves.toBe(false);
  });

  it('sendToUser delegates to bot client', async () => {
    prisma.oAuthAccount.findFirst.mockResolvedValue({ providerAccountId: '99' });
    (telegramBot.sendTelegramBotMessage as jest.Mock).mockResolvedValue(true);
    await expect(service.sendToUser('u1', 'hello')).resolves.toBe(true);
    expect(telegramBot.sendTelegramBotMessage).toHaveBeenCalledWith('99', 'hello', {
      parseMode: 'HTML',
    });
  });

  it('formatWelcome includes display name and app url', () => {
    const html = service.formatWelcome('Anna', 'https://app.test');
    expect(html).toContain('Anna');
    expect(html).toContain('https://app.test');
  });
});
