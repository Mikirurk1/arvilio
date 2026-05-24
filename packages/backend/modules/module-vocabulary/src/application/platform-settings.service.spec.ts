import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { Prisma } from '@prisma/client';
import { PlatformSettingsService } from './platform-settings.service';

describe('PlatformSettingsService', () => {
  let service: PlatformSettingsService;
  const prisma = {
    platformSettings: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const defaultRow = {
    id: 'default',
    wordDictionaryProvider: 'DICTIONARY_API_DEV' as const,
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.platformSettings.findUnique.mockResolvedValue(defaultRow);
    prisma.platformSettings.findUniqueOrThrow.mockResolvedValue(defaultRow);
    prisma.platformSettings.create.mockResolvedValue(defaultRow);
    prisma.platformSettings.update.mockResolvedValue({
      ...defaultRow,
      wordDictionaryProvider: 'WIKTIONARY',
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
    prisma.platformSettings.findUnique.mockResolvedValue({
      ...defaultRow,
      wordDictionaryProvider: 'WIKTIONARY',
    });
    const settings = await service.setWordDictionaryProvider('wiktionary');
    expect(settings.activeProvider).toBe('wiktionary');
    expect(prisma.platformSettings.update).toHaveBeenCalledWith({
      where: { id: 'default' },
      data: { wordDictionaryProvider: 'WIKTIONARY' },
    });
  });

  it('ensureSettingsRow recovers from concurrent create (P2002)', async () => {
    prisma.platformSettings.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValue(defaultRow);
    const p2002 = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['id'] },
    });
    prisma.platformSettings.create.mockRejectedValueOnce(p2002);

    const provider = await service.getWordDictionaryProvider();
    expect(provider).toBe('dictionary_api_dev');
    expect(prisma.platformSettings.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'default' },
    });
  });
});
