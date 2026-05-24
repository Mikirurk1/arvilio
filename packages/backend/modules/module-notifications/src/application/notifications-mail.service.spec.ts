import { NotificationsMailService } from './notifications-mail.service';

describe('NotificationsMailService', () => {
  const mail = {
    appUrl: jest.fn().mockReturnValue('https://app.test'),
    sendTemplated: jest.fn().mockResolvedValue(true),
  };

  it('delegates appUrl to MailService', () => {
    const service = new NotificationsMailService(mail as never);
    expect(service.appUrl()).toBe('https://app.test');
    expect(mail.appUrl).toHaveBeenCalled();
  });

  it('delegates sendTemplated to MailService', async () => {
    const service = new NotificationsMailService(mail as never);
    await expect(
      service.sendTemplated('user@test.com', 'streak-alert', { displayName: 'User' }),
    ).resolves.toBe(true);
    expect(mail.sendTemplated).toHaveBeenCalledWith('user@test.com', 'streak-alert', {
      displayName: 'User',
    });
  });
});
