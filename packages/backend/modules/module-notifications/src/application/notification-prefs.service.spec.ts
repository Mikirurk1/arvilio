import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { NotificationPrefsService } from './notification-prefs.service';

describe('NotificationPrefsService', () => {
  let service: NotificationPrefsService;
  const prisma = { user: { findUnique: jest.fn() } };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationPrefsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(NotificationPrefsService);
  });

  it('toPrefs maps user flags', () => {
    expect(
      service.toPrefs({
        notifyLessonReminder: true,
        notifyStreakAlert: false,
        notifyWeeklyReport: true,
        notifyNewVocab: false,
        notifyTeacherMessages: true,
      }),
    ).toEqual({
      lessonReminder: true,
      streakAlert: false,
      weeklyReport: true,
      newVocab: false,
      teacherMessages: true,
    });
  });

  it('getPrefs returns null when user missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.getPrefs('missing')).resolves.toBeNull();
  });
});
