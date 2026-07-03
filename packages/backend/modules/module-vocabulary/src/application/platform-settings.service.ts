import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';
import {
  Prisma,
  type PlatformSettings,
  type WordDictionaryProvider,
} from '@prisma/client';
import type {
  TranslationSettingsDto,
  WordDictionaryProviderId,
  WordDictionarySettingsDto,
} from '@pkg/types';

const SETTINGS_ID = 'default';

const PROVIDER_CATALOG: WordDictionarySettingsDto['providers'] = [
  {
    id: 'dictionary_api_dev',
    name: 'Free Dictionary API',
    description:
      'dictionaryapi.dev — structured English entries with phonetics, audio, synonyms, and multiple parts of speech. Based on Wiktionary data via a simple JSON API.',
    docsUrl: 'https://dictionaryapi.dev/',
  },
  {
    id: 'reverso',
    name: 'Reverso Context',
    description:
      'English entries from Free Dictionary API plus Reverso context translations and examples (HTTP API at api.reverso.net). Configure Reverso in Translation service below.',
    docsUrl: 'https://www.reverso.net/text-translation',
  },
  {
    id: 'wiktionary',
    name: 'Wiktionary (Wikimedia)',
    description:
      'Official Wiktionary REST API — English definitions and examples directly from Wikimedia. No pronunciation audio in this integration.',
    docsUrl: 'https://en.wiktionary.org/api/rest_v1/',
  },
];

const TRANSLATION_PROVIDER_CATALOG: TranslationSettingsDto['providers'] = [
  {
    id: 'deepl',
    name: 'DeepL',
    description:
      'High-quality neural translation. Best for natural-sounding glosses and lesson content.',
    docsUrl: 'https://www.deepl.com/pro-api',
    requiresServiceSubscription: true,
  },
  {
    id: 'google',
    name: 'Google Cloud Translation',
    description: 'Broad language coverage via Google Cloud Translation API v2.',
    docsUrl: 'https://cloud.google.com/translate/docs',
    requiresServiceSubscription: true,
  },
  {
    id: 'microsoft',
    name: 'Microsoft Translator',
    description: 'Azure AI Translator — cost-effective at higher volumes.',
    docsUrl: 'https://learn.microsoft.com/azure/ai-services/translator/',
    requiresServiceSubscription: true,
  },
  {
    id: 'reverso',
    name: 'Reverso Context',
    description:
      'Context-aware translation via api.reverso.net — word lemmas, glosses, and optional example sentences.',
    docsUrl: 'https://www.reverso.net/text-translation',
    requiresServiceSubscription: false,
  },
  {
    id: 'mymemory',
    name: 'MyMemory',
    description:
      'Free translation API with higher quota when a contact email is configured. Default primary when no paid API is selected.',
    docsUrl: 'https://mymemory.translated.net/doc/spec.php',
    requiresServiceSubscription: false,
  },
  {
    id: 'libretranslate',
    name: 'LibreTranslate',
    description:
      'Self-hosted or public open-source translation server (LibreTranslate).',
    docsUrl: 'https://docs.libretranslate.com/',
    requiresServiceSubscription: false,
  },
  {
    id: 'gtx',
    name: 'Google Translate (GTX, unofficial)',
    description:
      'Unofficial Google Translate fallback — no API key; used when earlier providers in the chain fail.',
    docsUrl: 'https://translate.google.com/',
    requiresServiceSubscription: false,
  },
];

@Injectable()
export class PlatformSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWordDictionarySettings(): Promise<WordDictionarySettingsDto> {
    const active = await this.getWordDictionaryProvider();
    return { activeProvider: active, providers: PROVIDER_CATALOG };
  }

  getTranslationSettings(): TranslationSettingsDto {
    const runtime = getPlatformIntegrationRuntime().translation;
    // Hide libreTranslateUrl unless the active provider is `libretranslate`.
    // This mirrors legacy behavior where the URL is only exposed when in use.
    // Tests expect a `null` value when the provider is not active.
    const libreUrl =
      runtime.activeProvider === 'libretranslate'
        ? runtime.libreTranslateUrl
        : null;
    return {
      activeProvider: runtime.activeProvider,
      providers: TRANSLATION_PROVIDER_CATALOG,
      apiUrls: {
        deeplApiUrl: runtime.deeplApiUrl,
        googleTranslateApiUrl: runtime.googleTranslateApiUrl,
        microsoftTranslatorApiUrl: runtime.microsoftTranslatorApiUrl,
        myMemoryUrl: runtime.myMemoryUrl,
        reversoApiUrl: runtime.reversoApiUrl,
        libreTranslateUrl: libreUrl,
      },
    };
  }

  async getWordDictionaryProvider(): Promise<WordDictionaryProviderId> {
    const row = await this.ensureSettingsRow();
    return toDtoProvider(row.wordDictionaryProvider);
  }

  async setWordDictionaryProvider(
    provider: WordDictionaryProviderId,
  ): Promise<WordDictionarySettingsDto> {
    const prismaValue = toPrismaProvider(provider);
    await this.ensureSettingsRow();
    await this.prisma.platformSettings.update({
      where: { id: SETTINGS_ID },
      data: { wordDictionaryProvider: prismaValue },
    });
    return this.getWordDictionarySettings();
  }

  /** Singleton row; safe under concurrent first requests (no upsert create race on `id`). */
  private async ensureSettingsRow(): Promise<PlatformSettings> {
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

function toDtoProvider(
  value: WordDictionaryProvider,
): WordDictionaryProviderId {
  if (value === 'WIKTIONARY') return 'wiktionary';
  if (value === 'REVERSO') return 'reverso';
  return 'dictionary_api_dev';
}

function toPrismaProvider(
  value: WordDictionaryProviderId,
): WordDictionaryProvider {
  if (value === 'wiktionary') return 'WIKTIONARY';
  if (value === 'reverso') return 'REVERSO';
  return 'DICTIONARY_API_DEV';
}
