import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MailService } from '@be/mail';
import { PrismaService } from '@be/prisma';
import type {
  PlatformIntegrationSettingsDto,
  UpdatePlatformIntegrationSettingsRequestDto,
  VerifyPlatformConnectionRequestDto,
  VerifyPlatformConnectionResultDto,
} from '@pkg/types';
import {
  buildIntegrationSettingsDto,
  mergePlatformIntegrationConfig,
  parsePlatformIntegrationConfig,
  readStoredSecretsFromRow,
  resolvePlatformIntegration,
  type ResolvedPlatformIntegration,
} from './platform-integration.config.util';
import {
  verifyFacebookApp,
  verifyGoogleOAuth,
  verifyTelegramBot,
} from './platform-integration.verify';
import {
  encryptIntegrationSecrets,
  hasIntegrationSecretUpdates,
  mergeIntegrationSecrets,
  normalizeIntegrationSecrets,
} from './platform-integration-secrets.util';
import { refreshPlatformIntegrationRuntime } from './platform-integration.runtime';

const SETTINGS_ID = 'default';

@Injectable()
export class PlatformIntegrationService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refreshRuntime();
  }

  async getSettings(): Promise<PlatformIntegrationSettingsDto> {
    const row = await this.ensureSettingsRow();
    const secrets = this.readSecrets(row.integrationSecrets);
    const config = parsePlatformIntegrationConfig(row.integrationConfig);
    return buildIntegrationSettingsDto(config, secrets, this.secretsStorageAvailable());
  }

  async updateSettings(
    body: UpdatePlatformIntegrationSettingsRequestDto,
  ): Promise<PlatformIntegrationSettingsDto> {
    const row = await this.ensureSettingsRow();
    const currentSecrets = this.readSecrets(row.integrationSecrets);
    const currentConfig = parsePlatformIntegrationConfig(row.integrationConfig);
    const nextConfig = mergePlatformIntegrationConfig(currentConfig, body.config);
    const nextSecrets = hasIntegrationSecretUpdates(body.secrets)
      ? mergeIntegrationSecrets(currentSecrets, body.secrets)
      : currentSecrets;

    if (nextConfig.smtp.mode === 'custom') {
      if (!nextConfig.smtp.host?.trim()) {
        throw new BadRequestException('Custom SMTP requires a host');
      }
      if (!nextSecrets.smtpPass && !process.env['SMTP_PASS']?.trim()) {
        const hadPass = Boolean(currentSecrets.smtpPass || process.env['SMTP_PASS']?.trim());
        if (!hadPass) {
          throw new BadRequestException('Custom SMTP requires a password (save SMTP password)');
        }
      }
    }

    const secretsPayload = hasIntegrationSecretUpdates(body.secrets)
      ? this.buildSecretsPayload(nextSecrets)
      : row.integrationSecrets;

    await this.prisma.platformSettings.update({
      where: { id: SETTINGS_ID },
      data: {
        integrationConfig: nextConfig as unknown as Prisma.InputJsonValue,
        integrationSecrets: secretsPayload,
      },
    });

    await this.refreshRuntime();
    return this.getSettings();
  }

  async refreshRuntime() {
    const row = await this.ensureSettingsRow();
    const secrets = this.readSecrets(row.integrationSecrets);
    this.mail.clearTransporterCache();
    return refreshPlatformIntegrationRuntime(row.integrationConfig, secrets);
  }

  /** Saved platform settings merged with optional unsaved System UI draft. */
  async resolveSettingsDraft(
    body?: Pick<UpdatePlatformIntegrationSettingsRequestDto, 'config' | 'secrets'>,
  ): Promise<ResolvedPlatformIntegration> {
    const row = await this.ensureSettingsRow();
    let secrets = this.readSecrets(row.integrationSecrets);
    let config = parsePlatformIntegrationConfig(row.integrationConfig);
    if (body?.config) {
      config = mergePlatformIntegrationConfig(config, body.config);
    }
    if (hasIntegrationSecretUpdates(body?.secrets)) {
      secrets = mergeIntegrationSecrets(secrets, body.secrets);
    }
    return resolvePlatformIntegration(config, secrets);
  }

  /** Verify SMTP using saved settings merged with required Email form draft. */
  async verifySmtp(
    body: Pick<UpdatePlatformIntegrationSettingsRequestDto, 'config' | 'secrets'>,
  ): Promise<VerifyPlatformConnectionResultDto> {
    if (!body.config?.smtp) {
      throw new BadRequestException('SMTP form values are required for verification');
    }
    const requestedMode = body.config.smtp.mode;
    const resolved = await this.resolveSettingsDraft(body);
    const { smtp } = resolved;

    if (requestedMode === 'custom') {
      if (!body.config.smtp.host?.trim()) {
        throw new BadRequestException('Custom SMTP requires a host before verification');
      }
      if (resolved.smtp.source !== 'custom') {
        throw new BadRequestException(
          'Could not apply custom SMTP from the form (check host and mode, then try again)',
        );
      }
    }

    await this.mail.verifySmtpEndpoint(smtp);
    const modeLabel = smtp.source === 'custom' ? 'custom SMTP' : 'server default';
    return {
      ok: true,
      message: `SMTP verified: ${smtp.host}:${smtp.port} (${modeLabel})`,
    };
  }

  /** Verify OAuth/Telegram using saved settings plus optional unsaved form draft. */
  async verifyConnection(
    body: VerifyPlatformConnectionRequestDto,
  ): Promise<VerifyPlatformConnectionResultDto> {
    const resolved = await this.resolveWithDraft(body);
    switch (body.provider) {
      case 'google':
        return verifyGoogleOAuth(resolved.google);
      case 'facebook':
        return verifyFacebookApp(resolved.facebook);
      case 'telegram':
        return verifyTelegramBot(resolved.telegram);
      case 'zoom': {
        const zoom = resolved.videoMeeting.zoom;
        if (!zoom.clientId?.trim() || !zoom.clientSecret?.trim()) {
          return {
            ok: false,
            message: 'Zoom client ID and secret must be set.',
          };
        }
        return {
          ok: true,
          message: 'Zoom OAuth credentials are configured.',
        };
      }
      default:
        throw new BadRequestException('Invalid connection provider');
    }
  }

  private async resolveWithDraft(draft: VerifyPlatformConnectionRequestDto) {
    return this.resolveSettingsDraft({
      config: draft.config,
      secrets: draft.secrets,
    });
  }

  private readSecrets(payload: string | null) {
    return readStoredSecretsFromRow(payload, this.encryptionKey());
  }

  private buildSecretsPayload(
    nextSecrets: ReturnType<typeof normalizeIntegrationSecrets>,
  ): string | null {
    const normalized = normalizeIntegrationSecrets(nextSecrets);
    if (Object.keys(normalized).length === 0) return null;
    const key = this.encryptionKey();
    if (!key) {
      throw new BadRequestException(
        'Set PLATFORM_SECRETS_ENCRYPTION_KEY (or PAYMENT_SECRETS_ENCRYPTION_KEY) in the API .env (long random string) to save passwords and API secrets in the database. ' +
          'Server-default SMTP can use SMTP_* from .env without storing a password here.',
      );
    }
    return encryptIntegrationSecrets(normalized, key);
  }

  private secretsStorageAvailable(): boolean {
    return Boolean(this.encryptionKey());
  }

  private encryptionKey(): string | null {
    const key =
      process.env['PAYMENT_SECRETS_ENCRYPTION_KEY']?.trim() ??
      process.env['PLATFORM_SECRETS_ENCRYPTION_KEY']?.trim();
    return key || null;
  }

  private async ensureSettingsRow() {
    const existing = await this.prisma.platformSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    if (existing) return existing;

    try {
      return await this.prisma.platformSettings.create({
        data: { id: SETTINGS_ID },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return this.prisma.platformSettings.findUniqueOrThrow({
          where: { id: SETTINGS_ID },
        });
      }
      throw error;
    }
  }
}
