jest.mock('@be/email-templates', () => ({
  renderEmail: jest.fn().mockResolvedValue({
    subject: 'Welcome',
    html: '<p>Welcome</p>',
    text: 'Welcome',
  }),
  renderEmailFromVars: jest.fn().mockResolvedValue({
    subject: 'Notification',
    html: '<p>Notice</p>',
    text: 'Notice',
  }),
}));

const sendMail = jest.fn();
const verify = jest.fn();

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({ sendMail, verify })),
  },
}));

import { MailService } from './mail.service';

describe('MailService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SMTP_HOST;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('isConfigured is false without SMTP_HOST', () => {
    const service = new MailService();
    expect(service.isConfigured()).toBe(false);
  });

  it('getStatus reports mailFrom default', () => {
    const service = new MailService();
    expect(service.getStatus().mailFrom).toContain('SoEnglish');
  });

  it('verifyConnection throws when SMTP not configured', async () => {
    const service = new MailService();
    await expect(service.verifyConnection()).rejects.toThrow('SMTP is not configured');
  });

  it('appUrl uses WEB_ORIGIN when set', () => {
    process.env.WEB_ORIGIN = 'https://app.example.com';
    const service = new MailService();
    expect(service.appUrl()).toBe('https://app.example.com');
  });

  it('sendWelcomeAccount returns false when SMTP is not configured', async () => {
    const service = new MailService();
    await expect(
      service.sendWelcomeAccount({
        to: 'user@test.com',
        displayName: 'User',
        email: 'user@test.com',
        password: 'TempPass1',
        loginUrl: 'https://app.test/login',
      }),
    ).resolves.toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('sendWelcomeAccount sends mail when SMTP is configured', async () => {
    process.env.SMTP_HOST = 'smtp.test';
    sendMail.mockResolvedValue({ messageId: '1' });
    const service = new MailService();
    await expect(
      service.sendWelcomeAccount({
        to: 'user@test.com',
        displayName: 'User',
        email: 'user@test.com',
        password: 'TempPass1',
        loginUrl: 'https://app.test/login',
      }),
    ).resolves.toBe(true);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: expect.any(String),
      }),
    );
  });

  it('verifyConnection uses transporter.verify when configured', async () => {
    process.env.SMTP_HOST = 'smtp.test';
    verify.mockResolvedValue(true);
    const service = new MailService();
    await expect(service.verifyConnection()).resolves.toBeUndefined();
    expect(verify).toHaveBeenCalled();
  });

  it('sendTestWelcomeEmail returns sent:false when delivery fails', async () => {
    process.env.SMTP_HOST = 'smtp.test';
    sendMail.mockRejectedValue(new Error('smtp down'));
    const service = new MailService();
    const result = await service.sendTestWelcomeEmail('User@Test.com');
    expect(result.sent).toBe(false);
    expect(result.error).toContain('Failed to send');
  });
});
