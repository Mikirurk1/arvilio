import { Test } from '@nestjs/testing';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationDispatchService } from './notification-dispatch.service';
import { NotificationsMailService } from './notifications-mail.service';
import { TelegramDeliveryService } from '../infrastructure/telegram-delivery.service';

describe('NotificationDispatchService', () => {
  let service: NotificationDispatchService;
  const delivery = {
    wasSent: jest.fn(),
    recordSent: jest.fn(),
  };
  const mail = { sendTemplated: jest.fn() };
  const telegram = { sendToUser: jest.fn() };

  const baseInput = {
    userId: 'u1',
    email: 'u@test',
    displayName: 'User',
    kind: 'STREAK_ALERT' as const,
    dedupeKey: '2026-05-20',
    enabled: true,
    emailTemplate: 'streak-alert' as const,
    emailVars: { name: 'User' },
    telegramHtml: '<b>hi</b>',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    delivery.wasSent.mockResolvedValue(false);
    mail.sendTemplated.mockResolvedValue(true);
    telegram.sendToUser.mockResolvedValue(true);
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationDispatchService,
        { provide: NotificationDeliveryService, useValue: delivery },
        { provide: NotificationsMailService, useValue: mail },
        { provide: TelegramDeliveryService, useValue: telegram },
      ],
    }).compile();
    service = moduleRef.get(NotificationDispatchService);
  });

  it('skips when notifications disabled', async () => {
    await service.dispatch({ ...baseInput, enabled: false });
    expect(mail.sendTemplated).not.toHaveBeenCalled();
    expect(telegram.sendToUser).not.toHaveBeenCalled();
  });

  it('sends email and telegram when not yet sent', async () => {
    await service.dispatch(baseInput);
    expect(mail.sendTemplated).toHaveBeenCalled();
    expect(telegram.sendToUser).toHaveBeenCalled();
    expect(delivery.recordSent).toHaveBeenCalledTimes(2);
  });

  it('does not resend when already sent', async () => {
    delivery.wasSent.mockResolvedValue(true);
    await service.dispatch(baseInput);
    expect(mail.sendTemplated).not.toHaveBeenCalled();
    expect(telegram.sendToUser).not.toHaveBeenCalled();
  });

  it('records only channels that send successfully', async () => {
    mail.sendTemplated.mockResolvedValue(false);
    telegram.sendToUser.mockResolvedValue(true);

    await service.dispatch(baseInput);

    expect(mail.sendTemplated).toHaveBeenCalled();
    expect(telegram.sendToUser).toHaveBeenCalled();
    expect(delivery.recordSent).toHaveBeenCalledTimes(1);
    expect(delivery.recordSent).toHaveBeenCalledWith('u1', 'STREAK_ALERT', '2026-05-20', 'telegram');
  });

  it('skips email when already sent but still sends telegram', async () => {
    delivery.wasSent.mockImplementation(async (_userId, _kind, _key, channel) => channel === 'email');
    await service.dispatch(baseInput);
    expect(mail.sendTemplated).not.toHaveBeenCalled();
    expect(telegram.sendToUser).toHaveBeenCalled();
    expect(delivery.recordSent).toHaveBeenCalledTimes(1);
  });
});
