import type {
  IntegrationSecretStatusesDto,
  LlmProviderId,
  PlatformIntegrationConfigDto,
  PlatformIntegrationConfigPatchDto,
  PlatformIntegrationSecretsDto,
  PlatformIntegrationSettingsDto,
  SmtpConfigModeDto,
  TranslationProviderId,
} from '@pkg/types';
import {
  decryptIntegrationSecrets,
  integrationSecretStatus,
  normalizeIntegrationSecrets,
  type StoredIntegrationSecrets,
} from './platform-integration-secrets.util';
import { DEFAULT_REVERSO_TRANSLATE_URL } from '../../infrastructure/reverso/reverso.client';
import { resolveActiveTranslationProvider } from '../translation-provider.util';

export type ResolvedPlatformIntegration = {
  translation: {
    activeProvider: TranslationProviderId;
    deeplApiUrl: string;
    deeplAuthKey: string | null;
    googleTranslateApiUrl: string;
    googleTranslateApiKey: string | null;
    microsoftTranslatorApiUrl: string;
    azureTranslatorKey: string | null;
    azureTranslatorRegion: string | null;
    myMemoryUrl: string;
    apiEmail: string | null;
    libreTranslateUrl: string | null;
    libreTranslateApiKey: string | null;
    reversoApiUrl: string;
    reversoApiKey: string | null;
    reversoContextResults: boolean;
    reversoContextTargetLang: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string | null;
    pass: string | null;
    mailFrom: string;
    secure: boolean;
    source: SmtpConfigModeDto;
  };
  telegram: {
    botToken: string | null;
    botUsername: string | null;
    devPolling: boolean;
  };
  google: {
    clientId: string | null;
    clientSecret: string | null;
    callbackUrl: string;
    successRedirect: string;
    linkSuccessRedirect: string | null;
    failureRedirect: string | null;
  };
  facebook: {
    appId: string | null;
    appSecret: string | null;
    callbackUrl: string;
  };
  videoMeeting: {
    provider: 'google' | 'zoom' | 'livekit';
    livekit: {
      wsUrl: string;
      apiKey: string | null;
      apiSecret: string | null;
    };
    zoom: {
      clientId: string | null;
      clientSecret: string | null;
      webhookSecret: string | null;
      callbackUrl: string;
      useServerToServer: boolean;
    };
  };
  mediaCaptions: {
    enabled: boolean;
    sttProvider: 'local_whisper' | 'openai_whisper' | 'disabled';
    sourceLanguage: string | null;
    targetLanguages: string[];
    openaiWhisperApiKey: string | null;
  };
  llm: {
    enabled: boolean;
    provider: LlmProviderId;
    baseUrl: string | null;
    model: string | null;
    maxTokens: number;
    temperature: number;
    apiKey: string | null;
  };
};

const DEFAULT_MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const DEFAULT_DEEPL_API_URL = 'https://api-free.deepl.com';
const DEFAULT_GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com';
const DEFAULT_AZURE_TRANSLATOR_URL =
  'https://api.cognitive.microsofttranslator.com';
const DEFAULT_MAIL_FROM = 'Arvilio <noreply@arvilio.local>';

export function defaultPlatformIntegrationConfig(): PlatformIntegrationConfigDto {
  const webOrigin =
    process.env['WEB_ORIGIN']?.replace(/\/$/, '') ?? 'http://localhost:4200';
  /**
   * Browser-facing OAuth callbacks must hit the web origin (Next `/api` rewrite),
   * not the Nest port. Cookies set on `:3000` are not sent to `:4200` when the
   * callback host differs (host-only cookies), so Google "succeeds" but the app
   * stays logged out. Override with GOOGLE_CALLBACK_URL / FACEBOOK_CALLBACK_URL /
   * ZOOM_CALLBACK_URL or OAUTH_PUBLIC_BASE_URL when the API is publicly reachable
   * on its own host.
   */
  const oauthPublicBase =
    process.env['OAUTH_PUBLIC_BASE_URL']?.replace(/\/$/, '') || webOrigin;

  return {
    translation: {
      activeProvider: 'mymemory',
      apiEmail: null,
      reversoContextResults: true,
      reversoContextTargetLang: 'uk',
    },
    mediaCaptions: {
      enabled: process.env['MATERIAL_CAPTIONS_ENABLED'] === 'true',
      sttProvider: (() => {
        if (process.env['MATERIAL_WHISPER_MODEL']?.trim()) return 'local_whisper' as const;
        if (
          process.env['OPENAI_API_KEY']?.trim() ||
          process.env['OPENAI_WHISPER_API_KEY']?.trim()
        ) {
          return 'openai_whisper' as const;
        }
        return 'disabled' as const;
      })(),
      sourceLanguage:
        process.env['MATERIAL_CAPTION_SOURCE_LANG']?.trim() || null,
      targetLanguages: (process.env['MATERIAL_CAPTION_TARGET_LANGS'] ?? 'uk,en')
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean),
    },
    llm: {
      enabled:
        process.env['LLM_ENABLED'] === 'true' ||
        Boolean(process.env['LLM_API_KEY']?.trim()) ||
        Boolean(process.env['ANTHROPIC_API_KEY']?.trim()) ||
        Boolean(process.env['OPENAI_API_KEY']?.trim()),
      provider:
        process.env['LLM_PROVIDER']?.trim() === 'anthropic'
          ? ('anthropic' as const)
          : ('openai_compat' as const),
      baseUrl: process.env['LLM_BASE_URL']?.trim() || null,
      model: process.env['LLM_MODEL']?.trim() || null,
      maxTokens: (() => {
        const raw = Number(process.env['LLM_MAX_TOKENS'] ?? 384);
        return Number.isFinite(raw) && raw > 0 ? Math.min(Math.round(raw), 2048) : 384;
      })(),
      temperature: (() => {
        const raw = Number(process.env['LLM_TEMPERATURE'] ?? 0.3);
        return Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 1) : 0.3;
      })(),
    },
    smtp: {
      mode: 'server_default',
      host: null,
      port: null,
      user: null,
      mailFrom: DEFAULT_MAIL_FROM,
      secure: false,
    },
    telegram: {
      botUsername: null,
      devPolling: process.env['TELEGRAM_DEV_POLLING'] === 'true',
    },
    google: {
      clientId: null,
      callbackUrl: `${oauthPublicBase}/api/auth/google/callback`,
      successRedirect: `${webOrigin}/dashboard`,
      linkSuccessRedirect: `${webOrigin}/profile`,
      failureRedirect: `${webOrigin}/login?error=no_account`,
    },
    facebook: {
      appId: null,
      callbackUrl: `${oauthPublicBase}/api/auth/facebook/callback`,
    },
    videoMeeting: {
      provider: 'google',
      livekit: {
        wsUrl: '',
        apiKey: null,
      },
      zoom: {
        clientId: null,
        callbackUrl: `${oauthPublicBase}/api/auth/zoom/callback`,
        useServerToServer: false,
      },
    },
  };
}

function cleanOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function parsePlatformIntegrationConfig(
  raw: unknown,
): PlatformIntegrationConfigDto {
  const defaults = defaultPlatformIntegrationConfig();
  if (!raw || typeof raw !== 'object') return defaults;
  const obj = raw as Record<string, unknown>;
  const translation = (obj['translation'] ?? {}) as Record<string, unknown>;
  const smtp = (obj['smtp'] ?? {}) as Record<string, unknown>;
  const telegram = (obj['telegram'] ?? {}) as Record<string, unknown>;
  const google = (obj['google'] ?? {}) as Record<string, unknown>;
  const facebook = (obj['facebook'] ?? {}) as Record<string, unknown>;
  const mediaCaptions = (obj['mediaCaptions'] ?? {}) as Record<string, unknown>;
  const llm = (obj['llm'] ?? {}) as Record<string, unknown>;
  const videoMeeting = (obj['videoMeeting'] ?? {}) as Record<string, unknown>;
  const videoLiveKit = (videoMeeting['livekit'] ?? {}) as Record<string, unknown>;
  const videoZoom = (videoMeeting['zoom'] ?? {}) as Record<string, unknown>;

  const videoProvider: 'google' | 'zoom' | 'livekit' =
    videoMeeting['provider'] === 'zoom'
      ? 'zoom'
      : videoMeeting['provider'] === 'livekit'
        ? 'livekit'
        : 'google';

  const smtpMode: SmtpConfigModeDto =
    smtp['mode'] === 'custom' ? 'custom' : 'server_default';

  return {
    translation: {
      activeProvider: resolveActiveTranslationProvider(
        translation,
        process.env['REVERSO_ENABLED'] === 'true',
      ),
      apiEmail: cleanOptionalString(translation['apiEmail']),
      reversoContextResults:
        translation['reversoContextResults'] === false
          ? false
          : translation['reversoContextResults'] === true
            ? true
            : defaults.translation.reversoContextResults,
      reversoContextTargetLang:
        cleanOptionalString(translation['reversoContextTargetLang']) ??
        defaults.translation.reversoContextTargetLang,
    },
    mediaCaptions: {
      enabled:
        mediaCaptions['enabled'] === false
          ? false
          : mediaCaptions['enabled'] === true
            ? true
            : defaults.mediaCaptions.enabled,
      sttProvider:
        mediaCaptions['sttProvider'] === 'disabled'
          ? 'disabled'
          : mediaCaptions['sttProvider'] === 'openai_whisper'
            ? 'openai_whisper'
            : mediaCaptions['sttProvider'] === 'local_whisper'
              ? 'local_whisper'
              : defaults.mediaCaptions.sttProvider,
      sourceLanguage: cleanOptionalString(mediaCaptions['sourceLanguage']),
      targetLanguages: Array.isArray(mediaCaptions['targetLanguages'])
        ? mediaCaptions['targetLanguages']
            .filter((item): item is string => typeof item === 'string')
            .map(item => item.trim().toLowerCase())
            .filter(Boolean)
        : defaults.mediaCaptions.targetLanguages,
    },
    llm: {
      enabled:
        llm['enabled'] === false
          ? false
          : llm['enabled'] === true
            ? true
            : defaults.llm.enabled,
      provider:
        llm['provider'] === 'anthropic'
          ? ('anthropic' as const)
          : llm['provider'] === 'openai_compat'
            ? ('openai_compat' as const)
            : defaults.llm.provider,
      baseUrl: cleanOptionalString(llm['baseUrl']),
      model: cleanOptionalString(llm['model']),
      maxTokens: (() => {
        const raw =
          typeof llm['maxTokens'] === 'number'
            ? llm['maxTokens']
            : Number(llm['maxTokens']);
        if (!Number.isFinite(raw) || raw <= 0) return defaults.llm.maxTokens;
        return Math.min(Math.round(raw), 2048);
      })(),
      temperature: (() => {
        const raw =
          typeof llm['temperature'] === 'number'
            ? llm['temperature']
            : Number(llm['temperature']);
        if (!Number.isFinite(raw)) return defaults.llm.temperature;
        return Math.min(Math.max(raw, 0), 1);
      })(),
    },
    smtp: {
      mode: smtpMode,
      host: cleanOptionalString(smtp['host']),
      port:
        typeof smtp['port'] === 'number' && Number.isFinite(smtp['port'])
          ? Math.round(smtp['port'])
          : cleanOptionalString(smtp['port'])
            ? Number(cleanOptionalString(smtp['port']))
            : null,
      user: cleanOptionalString(smtp['user']),
      mailFrom: cleanOptionalString(smtp['mailFrom']) ?? defaults.smtp.mailFrom,
      secure: smtp['secure'] === true,
    },
    telegram: {
      botUsername: cleanOptionalString(telegram['botUsername']),
      devPolling: telegram['devPolling'] === true,
    },
    google: {
      clientId: cleanOptionalString(google['clientId']),
      callbackUrl:
        cleanOptionalString(google['callbackUrl']) ??
        defaults.google.callbackUrl,
      successRedirect:
        cleanOptionalString(google['successRedirect']) ??
        defaults.google.successRedirect,
      linkSuccessRedirect: cleanOptionalString(google['linkSuccessRedirect']),
      failureRedirect: cleanOptionalString(google['failureRedirect']),
    },
    facebook: {
      appId: cleanOptionalString(facebook['appId']),
      callbackUrl:
        cleanOptionalString(facebook['callbackUrl']) ??
        defaults.facebook.callbackUrl,
    },
    videoMeeting: {
      provider: videoProvider,
      livekit: {
        wsUrl:
          cleanOptionalString(videoLiveKit['wsUrl']) ??
          defaults.videoMeeting.livekit.wsUrl,
        apiKey: cleanOptionalString(videoLiveKit['apiKey']),
      },
      zoom: {
        clientId: cleanOptionalString(videoZoom['clientId']),
        callbackUrl:
          cleanOptionalString(videoZoom['callbackUrl']) ??
          defaults.videoMeeting.zoom.callbackUrl,
        useServerToServer: videoZoom['useServerToServer'] === true,
      },
    },
  };
}

function envSmtp() {
  const host = process.env['SMTP_HOST']?.trim() || null;
  const portRaw = process.env['SMTP_PORT'];
  const port = portRaw ? Number(portRaw) : 587;
  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    user: process.env['SMTP_USER']?.trim() || null,
    pass: process.env['SMTP_PASS']?.trim() || null,
    mailFrom: process.env['MAIL_FROM']?.trim() || DEFAULT_MAIL_FROM,
  };
}

function envTranslation() {
  const envPrimaryReverso = process.env['REVERSO_ENABLED'] === 'true';
  return {
    deeplApiUrl: process.env['DEEPL_API_URL']?.trim() || DEFAULT_DEEPL_API_URL,
    deeplAuthKey: process.env['DEEPL_AUTH_KEY']?.trim() || null,
    googleTranslateApiUrl:
      process.env['GOOGLE_TRANSLATE_API_URL']?.trim() ||
      DEFAULT_GOOGLE_TRANSLATE_API_URL,
    googleTranslateApiKey:
      process.env['GOOGLE_TRANSLATE_API_KEY']?.trim() || null,
    microsoftTranslatorApiUrl:
      process.env['AZURE_TRANSLATOR_URL']?.trim() ||
      DEFAULT_AZURE_TRANSLATOR_URL,
    azureTranslatorKey: process.env['AZURE_TRANSLATOR_KEY']?.trim() || null,
    azureTranslatorRegion:
      process.env['AZURE_TRANSLATOR_REGION']?.trim() || null,
    myMemoryUrl:
      process.env['TRANSLATION_API_URL']?.trim() || DEFAULT_MYMEMORY_URL,
    apiEmail: process.env['TRANSLATION_API_EMAIL']?.trim() || null,
    libreTranslateUrl: process.env['LIBRETRANSLATE_URL']?.trim() || null,
    libreTranslateApiKey: process.env['LIBRETRANSLATE_API_KEY']?.trim() || null,
    activeProvider: envPrimaryReverso
      ? ('reverso' as const)
      : ('mymemory' as const),
    reversoApiUrl:
      process.env['REVERSO_API_URL']?.trim() || DEFAULT_REVERSO_TRANSLATE_URL,
    reversoApiKey: process.env['REVERSO_API_KEY']?.trim() || null,
    reversoContextResults: process.env['REVERSO_CONTEXT_RESULTS'] !== 'false',
    reversoContextTargetLang:
      process.env['REVERSO_CONTEXT_TARGET_LANG']?.trim() || 'uk',
  };
}

function envTelegram() {
  const username =
    process.env['TELEGRAM_BOT_USERNAME']?.trim() ??
    process.env['NEXT_PUBLIC_TELEGRAM_BOT_USERNAME']?.trim() ??
    null;
  return {
    botToken: process.env['TELEGRAM_BOT_TOKEN']?.trim() || null,
    botUsername: username ? username.replace(/^@/, '') : null,
    devPolling: process.env['TELEGRAM_DEV_POLLING'] === 'true',
  };
}

function envGoogle() {
  const defaults = defaultPlatformIntegrationConfig().google;
  return {
    clientId: process.env['GOOGLE_CLIENT_ID']?.trim() || null,
    clientSecret: process.env['GOOGLE_CLIENT_SECRET']?.trim() || null,
    callbackUrl:
      process.env['GOOGLE_CALLBACK_URL']?.trim() || defaults.callbackUrl,
    successRedirect:
      process.env['GOOGLE_SUCCESS_REDIRECT']?.trim() ||
      defaults.successRedirect,
    linkSuccessRedirect:
      process.env['GOOGLE_LINK_SUCCESS_REDIRECT']?.trim() ||
      defaults.linkSuccessRedirect,
    failureRedirect:
      process.env['GOOGLE_FAILURE_REDIRECT']?.trim() ||
      defaults.failureRedirect,
  };
}

function envFacebook() {
  const defaults = defaultPlatformIntegrationConfig().facebook;
  return {
    appId: process.env['FACEBOOK_APP_ID']?.trim() || null,
    appSecret: process.env['FACEBOOK_APP_SECRET']?.trim() || null,
    callbackUrl:
      process.env['FACEBOOK_CALLBACK_URL']?.trim() || defaults.callbackUrl,
  };
}

function envLiveKit() {
  return {
    // LIVEKIT_URL is the standard LiveKit env var name; LIVEKIT_WS_URL is our legacy alias
    wsUrl:
      process.env['LIVEKIT_URL']?.trim() ||
      process.env['LIVEKIT_WS_URL']?.trim() ||
      'ws://localhost:7880',
    apiKey: process.env['LIVEKIT_API_KEY']?.trim() || null,
    apiSecret: process.env['LIVEKIT_API_SECRET']?.trim() || null,
  };
}

function envZoom() {
  const defaults = defaultPlatformIntegrationConfig().videoMeeting.zoom;
  return {
    clientId: process.env['ZOOM_CLIENT_ID']?.trim() || null,
    clientSecret: process.env['ZOOM_CLIENT_SECRET']?.trim() || null,
    webhookSecret: process.env['ZOOM_WEBHOOK_SECRET_TOKEN']?.trim() || null,
    callbackUrl:
      process.env['ZOOM_CALLBACK_URL']?.trim() || defaults.callbackUrl,
  };
}

export function resolvePlatformIntegration(
  config: PlatformIntegrationConfigDto,
  secrets: StoredIntegrationSecrets,
): ResolvedPlatformIntegration {
  const envT = envTranslation();
  const envS = envSmtp();
  const envTg = envTelegram();
  const envG = envGoogle();
  const envF = envFacebook();
  const envZ = envZoom();
  const envLk = envLiveKit();

  const translation = {
    activeProvider: resolveActiveTranslationProvider(
      config.translation,
      envT.activeProvider === 'reverso',
    ),
    deeplApiUrl: envT.deeplApiUrl,
    deeplAuthKey: secrets.deeplAuthKey ?? envT.deeplAuthKey,
    googleTranslateApiUrl: envT.googleTranslateApiUrl,
    googleTranslateApiKey:
      secrets.googleTranslateApiKey ?? envT.googleTranslateApiKey,
    microsoftTranslatorApiUrl: envT.microsoftTranslatorApiUrl,
    azureTranslatorKey: secrets.azureTranslatorKey ?? envT.azureTranslatorKey,
    azureTranslatorRegion: envT.azureTranslatorRegion,
    myMemoryUrl: envT.myMemoryUrl,
    apiEmail: config.translation.apiEmail ?? envT.apiEmail,
    libreTranslateUrl: envT.libreTranslateUrl,
    libreTranslateApiKey:
      secrets.libreTranslateApiKey ?? envT.libreTranslateApiKey,
    reversoApiUrl: envT.reversoApiUrl,
    reversoApiKey: secrets.reversoApiKey ?? envT.reversoApiKey,
    reversoContextResults: config.translation.reversoContextResults,
    reversoContextTargetLang:
      config.translation.reversoContextTargetLang?.trim() ||
      envT.reversoContextTargetLang,
  };

  let smtpHost: string | null;
  let smtpPort: number;
  let smtpUser: string | null;
  let smtpPass: string | null;
  let smtpMailFrom: string;
  let smtpSecure: boolean;
  let smtpSource: SmtpConfigModeDto;

  if (config.smtp.mode === 'custom' && config.smtp.host?.trim()) {
    smtpHost = config.smtp.host.trim();
    smtpPort = config.smtp.port ?? 587;
    smtpUser = config.smtp.user;
    smtpPass = secrets.smtpPass ?? envS.pass;
    smtpMailFrom = config.smtp.mailFrom;
    smtpSecure = config.smtp.secure;
    smtpSource = 'custom';
  } else {
    smtpHost = envS.host;
    smtpPort = envS.port;
    smtpUser = envS.user;
    smtpPass = secrets.smtpPass ?? envS.pass;
    smtpMailFrom = config.smtp.mailFrom || envS.mailFrom;
    smtpSecure = config.smtp.secure || smtpPort === 465;
    smtpSource = 'server_default';
  }

  const telegramToken = secrets.telegramBotToken ?? envTg.botToken;
  const telegramUsername = config.telegram.botUsername ?? envTg.botUsername;

  return {
    translation,
    mediaCaptions: {
      enabled: config.mediaCaptions.enabled,
      sttProvider: config.mediaCaptions.sttProvider,
      sourceLanguage: config.mediaCaptions.sourceLanguage,
      targetLanguages: config.mediaCaptions.targetLanguages,
      openaiWhisperApiKey:
        secrets.openaiWhisperApiKey ??
        process.env['OPENAI_WHISPER_API_KEY']?.trim() ??
        process.env['OPENAI_API_KEY']?.trim() ??
        null,
    },
    llm: {
      enabled: config.llm.enabled,
      provider: config.llm.provider,
      baseUrl:
        config.llm.baseUrl ??
        process.env['LLM_BASE_URL']?.trim() ??
        (config.llm.provider === 'openai_compat'
          ? 'https://api.openai.com/v1'
          : null),
      model:
        config.llm.model ??
        process.env['LLM_MODEL']?.trim() ??
        (config.llm.provider === 'anthropic'
          ? 'claude-sonnet-4-20250514'
          : 'gpt-4.1-mini'),
      maxTokens: config.llm.maxTokens,
      temperature: config.llm.temperature,
      apiKey:
        (config.llm.provider === 'anthropic'
          ? secrets.anthropicApiKey ??
            process.env['ANTHROPIC_API_KEY']?.trim()
          : secrets.llmApiKey ??
            process.env['LLM_API_KEY']?.trim() ??
            process.env['OPENAI_API_KEY']?.trim()) ?? null,
    },
    smtp: {
      host: smtpHost ?? '',
      port: smtpPort,
      user: smtpUser,
      pass: smtpPass,
      mailFrom: smtpMailFrom,
      secure: smtpSecure,
      source: smtpSource,
    },
    telegram: {
      botToken: telegramToken,
      botUsername: telegramUsername,
      devPolling: config.telegram.devPolling ?? envTg.devPolling,
    },
    google: {
      clientId: config.google.clientId ?? envG.clientId,
      clientSecret: secrets.googleClientSecret ?? envG.clientSecret,
      callbackUrl: config.google.callbackUrl || envG.callbackUrl,
      successRedirect: config.google.successRedirect || envG.successRedirect,
      linkSuccessRedirect:
        config.google.linkSuccessRedirect ?? envG.linkSuccessRedirect,
      failureRedirect: config.google.failureRedirect ?? envG.failureRedirect,
    },
    facebook: {
      appId: config.facebook.appId ?? envF.appId,
      appSecret: secrets.facebookAppSecret ?? envF.appSecret,
      callbackUrl: config.facebook.callbackUrl || envF.callbackUrl,
    },
    videoMeeting: {
      provider: config.videoMeeting.provider,
      livekit: {
        wsUrl: config.videoMeeting.livekit.wsUrl || envLk.wsUrl,
        apiKey: config.videoMeeting.livekit.apiKey ?? envLk.apiKey,
        apiSecret: secrets.livekitApiSecret ?? envLk.apiSecret,
      },
      zoom: {
        clientId: config.videoMeeting.zoom.clientId ?? envZ.clientId,
        clientSecret: secrets.zoomClientSecret ?? envZ.clientSecret,
        webhookSecret: secrets.zoomWebhookSecret ?? envZ.webhookSecret,
        callbackUrl: config.videoMeeting.zoom.callbackUrl || envZ.callbackUrl,
        useServerToServer: config.videoMeeting.zoom.useServerToServer,
      },
    },
  };
}

/** Merge server .env fallbacks into config for super-admin forms (runtime still uses resolvePlatformIntegration). */
export function configWithEnvFallbacks(
  config: PlatformIntegrationConfigDto,
): PlatformIntegrationConfigDto {
  const envT = envTranslation();
  const envTg = envTelegram();
  const envG = envGoogle();
  const envF = envFacebook();
  const envS = envSmtp();
  const envZ = envZoom();
  const envLk = envLiveKit();

  return {
    translation: {
      ...config.translation,
      activeProvider: resolveActiveTranslationProvider(
        config.translation,
        envT.activeProvider === 'reverso',
      ),
      apiEmail: config.translation.apiEmail ?? envT.apiEmail,
      reversoContextTargetLang:
        config.translation.reversoContextTargetLang?.trim() ||
        envT.reversoContextTargetLang,
    },
    mediaCaptions: {
      ...config.mediaCaptions,
    },
    llm: {
      ...config.llm,
      baseUrl:
        config.llm.baseUrl ??
        process.env['LLM_BASE_URL']?.trim() ??
        null,
      model: config.llm.model ?? process.env['LLM_MODEL']?.trim() ?? null,
    },
    smtp: {
      ...config.smtp,
      mailFrom: config.smtp.mailFrom?.trim() || envS.mailFrom,
    },
    telegram: {
      ...config.telegram,
      botUsername: config.telegram.botUsername ?? envTg.botUsername,
      devPolling: config.telegram.devPolling || envTg.devPolling,
    },
    google: {
      ...config.google,
      clientId: config.google.clientId ?? envG.clientId,
      callbackUrl: config.google.callbackUrl?.trim() || envG.callbackUrl,
      successRedirect:
        config.google.successRedirect?.trim() || envG.successRedirect,
      linkSuccessRedirect:
        config.google.linkSuccessRedirect ?? envG.linkSuccessRedirect,
      failureRedirect: config.google.failureRedirect ?? envG.failureRedirect,
    },
    facebook: {
      ...config.facebook,
      appId: config.facebook.appId ?? envF.appId,
      callbackUrl: config.facebook.callbackUrl?.trim() || envF.callbackUrl,
    },
    videoMeeting: {
      provider: config.videoMeeting.provider,
      livekit: {
        wsUrl:
          config.videoMeeting.livekit.wsUrl?.trim() ||
          envLk.wsUrl,
        apiKey: config.videoMeeting.livekit.apiKey ?? envLk.apiKey,
      },
      zoom: {
        clientId: config.videoMeeting.zoom.clientId ?? envZ.clientId,
        callbackUrl:
          config.videoMeeting.zoom.callbackUrl?.trim() || envZ.callbackUrl,
        useServerToServer: config.videoMeeting.zoom.useServerToServer,
      },
    },
  };
}

export function buildIntegrationSettingsDto(
  config: PlatformIntegrationConfigDto,
  secrets: StoredIntegrationSecrets,
  secretsStorageAvailable: boolean,
): PlatformIntegrationSettingsDto {
  const envT = envTranslation();
  const envS = envSmtp();
  const envTg = envTelegram();
  const envG = envGoogle();
  const envF = envFacebook();
  const envZ = envZoom();
  const displayConfig = configWithEnvFallbacks(config);

  const secretStatuses: IntegrationSecretStatusesDto = {
    smtpPass: integrationSecretStatus(secrets.smtpPass, envS.pass ?? undefined),
    libreTranslateApiKey: integrationSecretStatus(
      secrets.libreTranslateApiKey,
      envT.libreTranslateApiKey ?? undefined,
    ),
    reversoApiKey: integrationSecretStatus(
      secrets.reversoApiKey,
      envT.reversoApiKey ?? undefined,
    ),
    deeplAuthKey: integrationSecretStatus(
      secrets.deeplAuthKey,
      envT.deeplAuthKey ?? undefined,
    ),
    googleTranslateApiKey: integrationSecretStatus(
      secrets.googleTranslateApiKey,
      envT.googleTranslateApiKey ?? undefined,
    ),
    azureTranslatorKey: integrationSecretStatus(
      secrets.azureTranslatorKey,
      envT.azureTranslatorKey ?? undefined,
    ),
    openaiWhisperApiKey: integrationSecretStatus(
      secrets.openaiWhisperApiKey,
      process.env['OPENAI_WHISPER_API_KEY']?.trim() ??
        process.env['OPENAI_API_KEY']?.trim() ??
        undefined,
    ),
    llmApiKey: integrationSecretStatus(
      secrets.llmApiKey,
      process.env['LLM_API_KEY']?.trim() ??
        process.env['OPENAI_API_KEY']?.trim() ??
        undefined,
    ),
    anthropicApiKey: integrationSecretStatus(
      secrets.anthropicApiKey,
      process.env['ANTHROPIC_API_KEY']?.trim() ?? undefined,
    ),
    telegramBotToken: integrationSecretStatus(
      secrets.telegramBotToken,
      envTg.botToken ?? undefined,
    ),
    googleClientSecret: integrationSecretStatus(
      secrets.googleClientSecret,
      envG.clientSecret ?? undefined,
    ),
    facebookAppSecret: integrationSecretStatus(
      secrets.facebookAppSecret,
      envF.appSecret ?? undefined,
    ),
    zoomClientSecret: integrationSecretStatus(
      secrets.zoomClientSecret,
      envZ.clientSecret ?? undefined,
    ),
    zoomWebhookSecret: integrationSecretStatus(
      secrets.zoomWebhookSecret,
      envZ.webhookSecret ?? undefined,
    ),
    livekitApiSecret: integrationSecretStatus(
      secrets.livekitApiSecret,
      envLiveKit().apiSecret ?? undefined,
    ),
  };

  const resolved = resolvePlatformIntegration(config, secrets);
  const secretsForAdmin: PlatformIntegrationSecretsDto = {
    smtpPass: resolved.smtp.pass ?? undefined,
    libreTranslateApiKey:
      resolved.translation.libreTranslateApiKey ?? undefined,
    reversoApiKey: resolved.translation.reversoApiKey ?? undefined,
    deeplAuthKey: resolved.translation.deeplAuthKey ?? undefined,
    googleTranslateApiKey:
      resolved.translation.googleTranslateApiKey ?? undefined,
    azureTranslatorKey: resolved.translation.azureTranslatorKey ?? undefined,
    openaiWhisperApiKey:
      resolved.mediaCaptions.openaiWhisperApiKey ?? undefined,
    llmApiKey:
      secrets.llmApiKey ??
      process.env['LLM_API_KEY']?.trim() ??
      process.env['OPENAI_API_KEY']?.trim() ??
      undefined,
    anthropicApiKey:
      secrets.anthropicApiKey ??
      process.env['ANTHROPIC_API_KEY']?.trim() ??
      undefined,
    telegramBotToken: resolved.telegram.botToken ?? undefined,
    googleClientSecret: resolved.google.clientSecret ?? undefined,
    facebookAppSecret: resolved.facebook.appSecret ?? undefined,
    zoomClientSecret: resolved.videoMeeting.zoom.clientSecret ?? undefined,
    zoomWebhookSecret: resolved.videoMeeting.zoom.webhookSecret ?? undefined,
    livekitApiSecret: resolved.videoMeeting.livekit.apiSecret ?? undefined,
  };

  return {
    config: displayConfig,
    secrets: secretsForAdmin,
    secretStatuses,
    secretsStorageAvailable,
  };
}

export function mergePlatformIntegrationConfig(
  current: PlatformIntegrationConfigDto,
  patch?: PlatformIntegrationConfigPatchDto,
): PlatformIntegrationConfigDto {
  if (!patch) return current;
  return parsePlatformIntegrationConfig({
    translation: { ...current.translation, ...patch.translation },
    mediaCaptions: { ...current.mediaCaptions, ...patch.mediaCaptions },
    llm: { ...current.llm, ...patch.llm },
    smtp: { ...current.smtp, ...patch.smtp },
    telegram: { ...current.telegram, ...patch.telegram },
    google: { ...current.google, ...patch.google },
    facebook: { ...current.facebook, ...patch.facebook },
    videoMeeting: {
      ...current.videoMeeting,
      ...patch.videoMeeting,
      livekit: {
        ...current.videoMeeting.livekit,
        ...patch.videoMeeting?.livekit,
      },
      zoom: {
        ...current.videoMeeting.zoom,
        ...patch.videoMeeting?.zoom,
      },
    },
  });
}

export function readStoredSecretsFromRow(
  integrationSecrets: string | null,
  masterKey: string | null,
): StoredIntegrationSecrets {
  if (!integrationSecrets?.trim()) return {};
  if (!masterKey) return normalizeIntegrationSecrets({});
  try {
    return decryptIntegrationSecrets(integrationSecrets, masterKey);
  } catch {
    return {};
  }
}
