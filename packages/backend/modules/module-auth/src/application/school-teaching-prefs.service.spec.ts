import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '@be/prisma';
import {
  normalizeTeachingPrefs,
  SchoolTeachingPrefsService,
} from './school-teaching-prefs.service';

describe('SchoolTeachingPrefsService', () => {
  const prisma = {
    school: { findUnique: jest.fn(), update: jest.fn() },
  };
  const service = new SchoolTeachingPrefsService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('returns defaults when teachingPrefs is null', async () => {
    prisma.school.findUnique.mockResolvedValue({ teachingPrefs: null });
    expect(await service.get('s1')).toEqual({ languages: [], lessonFormat: 'online' });
  });

  it('normalizes stored JSON', () => {
    expect(
      normalizeTeachingPrefs({
        languages: [' English ', '', 'Ukrainian'],
        lessonFormat: 'hybrid',
      }),
    ).toEqual({ languages: ['English', 'Ukrainian'], lessonFormat: 'hybrid' });
  });

  it('updates languages and format', async () => {
    prisma.school.findUnique.mockResolvedValue({
      teachingPrefs: { languages: ['English'], lessonFormat: 'online' },
    });
    prisma.school.update.mockResolvedValue({});

    const next = await service.update('s1', {
      languages: ['English', 'Spanish'],
      lessonFormat: 'in-person',
    });

    expect(next).toEqual({ languages: ['English', 'Spanish'], lessonFormat: 'in-person' });
    expect(prisma.school.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 's1' },
        data: {
          teachingPrefs: { languages: ['English', 'Spanish'], lessonFormat: 'in-person' },
        },
      }),
    );
  });

  it('rejects invalid lessonFormat', async () => {
    prisma.school.findUnique.mockResolvedValue({ teachingPrefs: null });
    await expect(service.update('s1', { lessonFormat: 'bogus' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
