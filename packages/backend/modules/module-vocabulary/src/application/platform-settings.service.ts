import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { Prisma, type PlatformSettings, type WordDictionaryProvider } from '@prisma/client';
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

function toDtoProvider(value: WordDictionaryProvider): WordDictionaryProviderId {
  if (value === 'WIKTIONARY') return 'wiktionary';
  return 'dictionary_api_dev';
}

function toPrismaProvider(value: WordDictionaryProviderId): WordDictionaryProvider {
  if (value === 'wiktionary') return 'WIKTIONARY';
  return 'DICTIONARY_API_DEV';
}
