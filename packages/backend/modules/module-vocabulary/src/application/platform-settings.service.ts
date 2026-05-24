import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { WordDictionaryProvider } from '@prisma/client';
import type { WordDictionaryProviderId, WordDictionarySettingsDto } from '@pkg/types';

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
    id: 'wiktionary',
    name: 'Wiktionary (Wikimedia)',
    description:
      'Official Wiktionary REST API — English definitions and examples directly from Wikimedia. No pronunciation audio in this integration.',
    docsUrl: 'https://en.wiktionary.org/api/rest_v1/',
  },
];

@Injectable()
export class PlatformSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWordDictionarySettings(): Promise<WordDictionarySettingsDto> {
    const active = await this.getWordDictionaryProvider();
    return { activeProvider: active, providers: PROVIDER_CATALOG };
  }

  async getWordDictionaryProvider(): Promise<WordDictionaryProviderId> {
    const row = await this.ensureSettingsRow();
    return toDtoProvider(row.wordDictionaryProvider);
  }

  async setWordDictionaryProvider(provider: WordDictionaryProviderId): Promise<WordDictionarySettingsDto> {
    const prismaValue = toPrismaProvider(provider);
    await this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, wordDictionaryProvider: prismaValue },
      update: { wordDictionaryProvider: prismaValue },
    });
    return this.getWordDictionarySettings();
  }

  private ensureSettingsRow() {
    return this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    });
  }
}

function toDtoProvider(value: WordDictionaryProvider): WordDictionaryProviderId {
  if (value === 'WIKTIONARY') return 'wiktionary';
  return 'dictionary_api_dev';
}

function toPrismaProvider(value: WordDictionaryProviderId): WordDictionaryProvider {
  if (value === 'wiktionary') return 'WIKTIONARY';
  return 'DICTIONARY_API_DEV';
}
