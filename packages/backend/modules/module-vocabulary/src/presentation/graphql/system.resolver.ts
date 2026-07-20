import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard, Roles, RolesGuard } from '@be/auth';
import { MailService } from '@be/mail';
import { PlatformIntegrationService } from '../../application/platform-integration/platform-integration.service';
import { PlatformSettingsService } from '../../application/platform-settings.service';
import { parseTranslationProviderId } from '../../application/translation-provider.util';
import {
  PlatformIntegrationSettingsType,
  SendTestEmailResultType,
  SendTestWelcomeEmailInput,
  SystemMailStatusType,
  UpdatePlatformIntegrationSettingsInput,
  UpdateWordDictionaryProviderInput,
  VerifyPlatformConnectionInput,
  VerifyPlatformConnectionResultType,
  VerifySmtpConnectionInput,
  WordDictionarySettingsType,
  TranslationSettingsType,
} from '@be/graphql';
import type {
  PlatformIntegrationConfigPatchDto,
  SmtpConfigModeDto,
} from '@pkg/types';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SystemResolver {
  constructor(
    private readonly mail: MailService,
    private readonly platformSettings: PlatformSettingsService,
    private readonly platformIntegration: PlatformIntegrationService,
  ) {}

  @Query(() => SystemMailStatusType, { name: 'systemMailStatus' })
  async systemMailStatus() {
    return this.mail.getStatus();
  }

  @Mutation(() => VerifyPlatformConnectionResultType, {
    name: 'verifySmtpConnection',
  })
  async verifySmtpConnection(@Args('input') input: VerifySmtpConnectionInput) {
    if (!input) {
      throw new BadRequestException(
        'SMTP form values are required for verification',
      );
    }
    try {
      return await this.platformIntegration.verifySmtp({
        config: mapIntegrationConfigInput(input.config),
        secrets: input.secrets ?? undefined,
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      const message =
        err instanceof Error ? err.message : 'SMTP verification failed';
      throw new BadRequestException(message);
    }
  }

  @Mutation(() => SendTestEmailResultType, { name: 'sendTestWelcomeEmail' })
  async sendTestWelcomeEmail(@Args('input') input: SendTestWelcomeEmailInput) {
    const to = input.to?.trim().toLowerCase();
    if (!to || !to.includes('@')) {
      throw new BadRequestException('Invalid email address');
    }
    const result = await this.mail.sendTestWelcomeEmail(to);
    return {
      sent: result.sent,
      message: result.sent
        ? 'Test welcome email sent'
        : (result.error ?? 'Send failed'),
    };
  }

  @Query(() => WordDictionarySettingsType, { name: 'wordDictionarySettings' })
  async wordDictionarySettings() {
    return this.platformSettings.getWordDictionarySettings();
  }

  @Query(() => TranslationSettingsType, { name: 'translationSettings' })
  translationSettings() {
    return this.platformSettings.getTranslationSettings();
  }

  @Mutation(() => WordDictionarySettingsType, {
    name: 'updateWordDictionaryProvider',
  })
  async updateWordDictionaryProvider(
    @Args('input') input: UpdateWordDictionaryProviderInput,
  ) {
    const provider = input.provider?.trim();
    if (
      provider !== 'dictionary_api_dev' &&
      provider !== 'wiktionary' &&
      provider !== 'reverso'
    ) {
      throw new BadRequestException('Invalid dictionary provider');
    }
    return this.platformSettings.setWordDictionaryProvider(provider);
  }

  @Query(() => PlatformIntegrationSettingsType, {
    name: 'platformIntegrationSettings',
  })
  async platformIntegrationSettings() {
    return this.platformIntegration.getSettings();
  }

  @Mutation(() => PlatformIntegrationSettingsType, {
    name: 'updatePlatformIntegrationSettings',
  })
  async updatePlatformIntegrationSettings(
    @Args('input') input: UpdatePlatformIntegrationSettingsInput,
  ) {
    return this.platformIntegration.updateSettings({
      config: mapIntegrationConfigInput(input.config),
      secrets: input.secrets ?? undefined,
    });
  }

  @Mutation(() => VerifyPlatformConnectionResultType, {
    name: 'verifyPlatformConnection',
  })
  async verifyPlatformConnection(
    @Args('input') input: VerifyPlatformConnectionInput,
  ) {
    const provider = input.provider?.trim().toLowerCase();
    if (
      provider !== 'google' &&
      provider !== 'facebook' &&
      provider !== 'telegram' &&
      provider !== 'zoom'
    ) {
      throw new BadRequestException('Invalid connection provider');
    }
    return this.platformIntegration.verifyConnection({
      provider,
      config: mapIntegrationConfigInput(input.config),
      secrets: input.secrets ?? undefined,
    });
  }
}

function mapIntegrationConfigInput(
  config?: UpdatePlatformIntegrationSettingsInput['config'],
): PlatformIntegrationConfigPatchDto | undefined {
  if (!config) return undefined;

  const patch: PlatformIntegrationConfigPatchDto = {};

  if (config.translation) {
    const activeProvider = parseTranslationProviderId(
      config.translation.activeProvider,
    );
    if (
      config.translation.activeProvider != null &&
      String(config.translation.activeProvider).trim() !== '' &&
      !activeProvider
    ) {
      throw new BadRequestException(
        `Invalid translation provider: ${config.translation.activeProvider}`,
      );
    }
    patch.translation = {
      apiEmail: config.translation.apiEmail,
      reversoContextResults: config.translation.reversoContextResults,
      reversoContextTargetLang: config.translation.reversoContextTargetLang,
      ...(activeProvider ? { activeProvider } : {}),
    };
  }
  if (config.smtp) {
    const mode = parseSmtpMode(config.smtp.mode);
    if (
      config.smtp.mode != null &&
      String(config.smtp.mode).trim() !== '' &&
      !mode
    ) {
      throw new BadRequestException(`Invalid SMTP mode: ${config.smtp.mode}`);
    }
    patch.smtp = {
      host: config.smtp.host,
      port: config.smtp.port,
      user: config.smtp.user,
      mailFrom: config.smtp.mailFrom,
      secure: config.smtp.secure,
      ...(mode ? { mode } : {}),
    };
  }
  if (config.telegram) {
    patch.telegram = { ...config.telegram };
  }
  if (config.google) {
    patch.google = { ...config.google };
  }
  if (config.facebook) {
    patch.facebook = { ...config.facebook };
  }
  if (config.videoMeeting) {
    const provider =
      config.videoMeeting.provider === 'google' ||
      config.videoMeeting.provider === 'zoom' ||
      config.videoMeeting.provider === 'livekit'
        ? config.videoMeeting.provider
        : undefined;
    patch.videoMeeting = {
      ...(provider ? { provider } : {}),
      ...(config.videoMeeting.livekit
        ? { livekit: { ...config.videoMeeting.livekit } }
        : {}),
      ...(config.videoMeeting.zoom
        ? { zoom: { ...config.videoMeeting.zoom } }
        : {}),
    };
  }
  if (config.mediaCaptions) {
    const sttProvider =
      config.mediaCaptions.sttProvider === 'openai_whisper' ||
      config.mediaCaptions.sttProvider === 'local_whisper' ||
      config.mediaCaptions.sttProvider === 'disabled'
        ? config.mediaCaptions.sttProvider
        : undefined;
    patch.mediaCaptions = {
      enabled: config.mediaCaptions.enabled,
      sourceLanguage: config.mediaCaptions.sourceLanguage,
      targetLanguages: config.mediaCaptions.targetLanguages,
      ...(sttProvider ? { sttProvider } : {}),
    };
  }
  if (config.llm) {
    const provider =
      config.llm.provider === 'anthropic' ||
      config.llm.provider === 'openai_compat'
        ? config.llm.provider
        : undefined;
    patch.llm = {
      enabled: config.llm.enabled,
      baseUrl: config.llm.baseUrl,
      model: config.llm.model,
      maxTokens: config.llm.maxTokens,
      temperature: config.llm.temperature,
      ...(provider ? { provider } : {}),
    };
  }

  return patch;
}

function parseSmtpMode(
  value: string | undefined,
): SmtpConfigModeDto | undefined {
  if (value === 'custom' || value === 'server_default') return value;
  return undefined;
}
