import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { LanguagesService } from './languages.service';

describe('LanguagesService', () => {
  let service: LanguagesService;
  const prisma = {
    language: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [LanguagesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(LanguagesService);
  });

  it('listActive returns languages', async () => {
    prisma.language.findMany.mockResolvedValue([{ id: 'en', code: 'en', name: 'English' }]);
    await expect(service.listActive()).resolves.toHaveLength(1);
  });

  it('assertLanguageIds skips empty', async () => {
    await expect(service.assertLanguageIds([])).resolves.toBeUndefined();
    expect(prisma.language.count).not.toHaveBeenCalled();
  });

  it('assertLanguageIds throws when count mismatch', async () => {
    prisma.language.count.mockResolvedValue(1);
    await expect(service.assertLanguageIds(['a', 'b'])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('defaultLearningLanguageId requires english', async () => {
    prisma.language.findUnique.mockResolvedValue({ id: 'en-id' });
    await expect(service.defaultLearningLanguageId()).resolves.toBe('en-id');
  });

  it('defaultLearningLanguageId throws when en missing', async () => {
    prisma.language.findUnique.mockResolvedValue(null);
    await expect(service.defaultLearningLanguageId()).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
