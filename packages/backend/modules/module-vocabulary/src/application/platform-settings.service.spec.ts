import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { PlatformSettingsService } from './platform-settings.service';

describe('PlatformSettingsService', () => {
  let service: PlatformSettingsService;
  const prisma = {
    platformSettings: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.platformSettings.upsert.mockResolvedValue({
      id: 'default',
      wordDictionaryProvider: 'DICTIONARY_API_DEV',
    });
    const moduleRef = await Test.createTestingModule({
      providers: [PlatformSettingsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(PlatformSettingsService);
  });

  it('getWordDictionarySettings returns catalog and active provider', async () => {
    const settings = await service.getWordDictionarySettings();
    expect(settings.activeProvider).toBe('dictionary_api_dev');
    expect(settings.providers.length).toBeGreaterThanOrEqual(2);
  });

  it('setWordDictionaryProvider persists wiktionary', async () => {
    prisma.platformSettings.upsert.mockResolvedValue({
      id: 'default',
      wordDictionaryProvider: 'WIKTIONARY',
    });
    const settings = await service.setWordDictionaryProvider('wiktionary');
    expect(settings.activeProvider).toBe('wiktionary');
    expect(prisma.platformSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { wordDictionaryProvider: 'WIKTIONARY' },
      }),
    );
  });
});
