import { BadRequestException, Injectable } from '@nestjs/common';
import { MailService } from '@be/mail';
import { PlatformIntegrationService } from '@be/vocabulary';
import type {
  PlatformSmtpSettingsDto,
  TestSmtpEmailRequestDto,
  TestSmtpEmailResultDto,
  UpdatePlatformIntegrationSettingsRequestDto,
  VerifyPlatformConnectionResultDto,
  VerifySmtpConnectionRequestDto,
} from '@pkg/types';
import { PlatformAuditService } from './platform-audit.service';

/**
 * Control Plane transactional email (PlatformSettings.integration*.smtp).
 * Same store as Campus System → Email (platform-global, not per-school).
 */
@Injectable()
export class PlatformSmtpService {
  constructor(
    private readonly integrations: PlatformIntegrationService,
    private readonly mail: MailService,
    private readonly audit: PlatformAuditService,
  ) {}

  async get(): Promise<PlatformSmtpSettingsDto> {
    const full = await this.integrations.getSettings();
    const runtime = this.mail.getStatus();
    return {
      config: full.config.smtp,
      secrets: {
        smtpPass: full.secrets.smtpPass,
      },
      secretStatuses: {
        smtpPass: full.secretStatuses.smtpPass,
      },
      secretsStorageAvailable: full.secretsStorageAvailable,
      runtime: {
        configured: runtime.configured,
        host: runtime.smtpHost,
        port: runtime.smtpPort,
        mailFrom: runtime.mailFrom,
        source: runtime.smtpMode === 'custom' ? 'custom' : 'server_default',
      },
    };
  }

  async set(
    body: UpdatePlatformIntegrationSettingsRequestDto,
    ip: string | null,
  ): Promise<PlatformSmtpSettingsDto> {
    const full = await this.integrations.updateSettings({
      config: body.config?.smtp ? { smtp: body.config.smtp } : undefined,
      secrets: {
        smtpPass: body.secrets?.smtpPass,
      },
    });
    await this.audit.record({
      action: 'platform.smtp.update',
      metadata: {
        mode: full.config.smtp.mode,
        host: full.config.smtp.host,
        port: full.config.smtp.port,
      },
      ip,
    });
    return this.get();
  }

  async verify(
    body: VerifySmtpConnectionRequestDto,
    ip: string | null,
  ): Promise<VerifyPlatformConnectionResultDto> {
    const result = await this.integrations.verifySmtp({
      config: { smtp: body.config.smtp },
      secrets: body.secrets?.smtpPass !== undefined
        ? { smtpPass: body.secrets.smtpPass }
        : undefined,
    });
    await this.audit.record({
      action: 'platform.smtp.verify',
      metadata: { ok: result.ok, message: result.message },
      ip,
    });
    return result;
  }

  async test(
    body: TestSmtpEmailRequestDto,
    ip: string | null,
  ): Promise<TestSmtpEmailResultDto> {
    const to = body?.to?.trim() ?? '';
    if (!to || !to.includes('@')) {
      throw new BadRequestException('Valid "to" email is required');
    }
    if (!this.mail.isConfigured()) {
      throw new BadRequestException(
        'SMTP is not configured (set server defaults in .env or custom SMTP in Platform Settings)',
      );
    }
    const result = await this.mail.sendTestWelcomeEmail(to);
    await this.audit.record({
      action: 'platform.smtp.test',
      metadata: { to, sent: result.sent },
      ip,
    });
    return result;
  }
}
