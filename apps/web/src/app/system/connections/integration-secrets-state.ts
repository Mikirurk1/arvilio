import type {
  PlatformIntegrationSecretsDto,
  PlatformIntegrationSettingsDto,
} from '@pkg/types';

/** Hydrate secret field state from super-admin settings query (effective stored + env values). */
export function secretsFromIntegrationSettings(
  settings: PlatformIntegrationSettingsDto,
): PlatformIntegrationSecretsDto {
  const { secrets } = settings;
  return {
    smtpPass: secrets.smtpPass ?? undefined,
    libreTranslateApiKey: secrets.libreTranslateApiKey ?? undefined,
    reversoApiKey: secrets.reversoApiKey ?? undefined,
    deeplAuthKey: secrets.deeplAuthKey ?? undefined,
    googleTranslateApiKey: secrets.googleTranslateApiKey ?? undefined,
    azureTranslatorKey: secrets.azureTranslatorKey ?? undefined,
    openaiWhisperApiKey: secrets.openaiWhisperApiKey ?? undefined,
    telegramBotToken: secrets.telegramBotToken ?? undefined,
    googleClientSecret: secrets.googleClientSecret ?? undefined,
    facebookAppSecret: secrets.facebookAppSecret ?? undefined,
    zoomClientSecret: secrets.zoomClientSecret ?? undefined,
    zoomWebhookSecret: secrets.zoomWebhookSecret ?? undefined,
    livekitApiSecret: secrets.livekitApiSecret ?? undefined,
  };
}
