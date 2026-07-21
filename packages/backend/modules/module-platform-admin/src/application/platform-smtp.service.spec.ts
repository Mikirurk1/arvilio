import { BadRequestException } from '@nestjs/common';
import type { MailService } from '@be/mail';
import type { PlatformIntegrationService } from '@be/vocabulary';
import type { PlatformAuditService } from './platform-audit.service';
import { PlatformSmtpService } from './platform-smtp.service';

describe('PlatformSmtpService', () => {
  const integrations = {
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    verifySmtp: jest.fn(),
  };
  const mail = {
    getStatus: jest.fn(),
    isConfigured: jest.fn(),
    sendTestWelcomeEmail: jest.fn(),
  };
  const audit = { record: jest.fn() } as unknown as PlatformAuditService;

  const service = new PlatformSmtpService(
    integrations as unknown as PlatformIntegrationService,
    mail as unknown as MailService,
    audit,
  );

  const fullSettings = {
    config: {
      smtp: {
        mode: 'custom' as const,
        host: 'smtp.resend.com',
        port: 465,
        user: 'resend',
        mailFrom: 'noreply@example.com',
        secure: true,
      },
    },
    secrets: { smtpPass: null },
    secretStatuses: { smtpPass: { configured: true, source: 'stored' } },
    secretsStorageAvailable: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    integrations.getSettings.mockResolvedValue(fullSettings);
    mail.getStatus.mockReturnValue({
      configured: true,
      smtpHost: 'smtp.resend.com',
      smtpPort: 465,
      mailFrom: 'noreply@example.com',
      smtpMode: 'custom',
    });
  });

  it('get maps settings → DTO + runtime', async () => {
    const dto = await service.get();
    expect(dto.config).toEqual(fullSettings.config.smtp);
    expect(dto.secrets).toEqual({ smtpPass: null });
    expect(dto.secretStatuses.smtpPass).toEqual({ configured: true, source: 'stored' });
    expect(dto.secretsStorageAvailable).toBe(true);
    expect(dto.runtime).toEqual({
      configured: true,
      host: 'smtp.resend.com',
      port: 465,
      mailFrom: 'noreply@example.com',
      source: 'custom',
    });
  });

  it('get maps server_default runtime source', async () => {
    mail.getStatus.mockReturnValue({
      configured: true,
      smtpHost: 'localhost',
      smtpPort: 1025,
      mailFrom: 'dev@localhost',
      smtpMode: 'server_default',
    });
    const dto = await service.get();
    expect(dto.runtime.source).toBe('server_default');
  });

  it('set calls updateSettings with smtp patch + audit', async () => {
    integrations.updateSettings.mockResolvedValue(fullSettings);

    const dto = await service.set(
      {
        config: {
          smtp: {
            mode: 'custom',
            host: 'smtp.resend.com',
            port: 465,
            user: 'resend',
            mailFrom: 'noreply@example.com',
            secure: true,
          },
        },
        secrets: { smtpPass: 're_xxx' },
      },
      '10.0.0.1',
    );

    expect(integrations.updateSettings).toHaveBeenCalledWith({
      config: {
        smtp: {
          mode: 'custom',
          host: 'smtp.resend.com',
          port: 465,
          user: 'resend',
          mailFrom: 'noreply@example.com',
          secure: true,
        },
      },
      secrets: { smtpPass: 're_xxx' },
    });
    expect(audit.record).toHaveBeenCalledWith({
      action: 'platform.smtp.update',
      metadata: {
        mode: 'custom',
        host: 'smtp.resend.com',
        port: 465,
      },
      ip: '10.0.0.1',
    });
    expect(dto.config.host).toBe('smtp.resend.com');
  });

  it('verify forwards draft + audit', async () => {
    integrations.verifySmtp.mockResolvedValue({ ok: true, message: 'SMTP connection verified.' });

    const result = await service.verify(
      {
        config: { smtp: fullSettings.config.smtp },
        secrets: { smtpPass: 'secret' },
      },
      null,
    );

    expect(integrations.verifySmtp).toHaveBeenCalledWith({
      config: { smtp: fullSettings.config.smtp },
      secrets: { smtpPass: 'secret' },
    });
    expect(audit.record).toHaveBeenCalledWith({
      action: 'platform.smtp.verify',
      metadata: { ok: true, message: 'SMTP connection verified.' },
      ip: null,
    });
    expect(result.ok).toBe(true);
  });

  it('test rejects invalid to', async () => {
    await expect(service.test({ to: 'not-an-email' }, null)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mail.sendTestWelcomeEmail).not.toHaveBeenCalled();
  });

  it('test rejects when mail is not configured', async () => {
    mail.isConfigured.mockReturnValue(false);
    await expect(service.test({ to: 'you@example.com' }, null)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mail.sendTestWelcomeEmail).not.toHaveBeenCalled();
  });

  it('test happy path sends welcome and audits', async () => {
    mail.isConfigured.mockReturnValue(true);
    mail.sendTestWelcomeEmail.mockResolvedValue({
      sent: true,
      message: 'Test email sent.',
    });

    const result = await service.test({ to: '  You@Example.com  ' }, '127.0.0.1');

    expect(mail.sendTestWelcomeEmail).toHaveBeenCalledWith('You@Example.com');
    expect(audit.record).toHaveBeenCalledWith({
      action: 'platform.smtp.test',
      metadata: { to: 'You@Example.com', sent: true },
      ip: '127.0.0.1',
    });
    expect(result.sent).toBe(true);
  });
});
