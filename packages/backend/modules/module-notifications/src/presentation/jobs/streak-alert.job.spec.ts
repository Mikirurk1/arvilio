import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { NotificationDispatchService } from '../../application/notification-dispatch.service';
import { NotificationsMailService } from '../../application/notifications-mail.service';
import { StreakService } from '../../application/streak.service';
import { StreakAlertJob } from './streak-alert.job';

describe('StreakAlertJob', () => {
  let job: StreakAlertJob;
  const prisma = {
    user: { findMany: jest.fn() },
  };
  const dispatch = { dispatch: jest.fn() };
  const mail = { appUrl: jest.fn().mockReturnValue('https://app.test') };
  const streak = { snapshotForStudent: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        StreakAlertJob,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationDispatchService, useValue: dispatch },
        { provide: NotificationsMailService, useValue: mail },
        { provide: StreakService, useValue: streak },
      ],
    }).compile();
    job = moduleRef.get(StreakAlertJob);
  });

  it('dispatches streak alert for at-risk students', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 's1',
        email: 's@test',
        displayName: 'Student',
        notifyStreakAlert: true,
      },
    ]);
    streak.snapshotForStudent.mockResolvedValue({ streakDays: 3, atRisk: true, activeToday: false });

    await job.run();

    expect(dispatch.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 's1',
        kind: 'STREAK_ALERT',
      }),
    );
  });

  it('skips students not at risk', async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 's1', email: 's@test', displayName: 'S', notifyStreakAlert: true },
    ]);
    streak.snapshotForStudent.mockResolvedValue({ streakDays: 5, atRisk: false, activeToday: true });

    await job.run();

    expect(dispatch.dispatch).not.toHaveBeenCalled();
  });
});
