import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { AchievementStatsService } from './achievement-stats.service';
import { StreakService } from '../../../module-notifications/src/application/streak.service';

describe('AchievementStatsService', () => {
  let service: AchievementStatsService;

  const prisma = {
    user: { findUnique: jest.fn() },
    scheduledLesson: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    studentWordCard: {
      count: jest.fn(),
    },
    quizAttempt: {
      count: jest.fn(),
    },
    practiceSession: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    dailyGoalCompletion: {
      count: jest.fn(),
    },
  };

  const streaks = {
    snapshotForStudent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AchievementStatsService,
        { provide: PrismaService, useValue: prisma },
        { provide: StreakService, useValue: streaks },
      ],
    }).compile();
    service = moduleRef.get(AchievementStatsService);
  });

  it('aggregates student activity into server-side achievement stats', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      email: 'student@test.dev',
      displayName: 'Student',
      avatarUrl: 'https://example.com/avatar.png',
      timezone: 'Europe/Kyiv',
      proficiencyLevel: 'B1',
      phone: '+380671234567',
      telegram: '@student',
      bio: 'Ready to learn',
      nativeLanguageId: 'lang-1',
      role: 'STUDENT',
      teacherId: 'teacher-1',
    });
    prisma.scheduledLesson.count.mockResolvedValue(25);
    prisma.scheduledLesson.aggregate.mockResolvedValue({ _sum: { duration: 1125 } });
    prisma.studentWordCard.count.mockResolvedValue(100);
    streaks.snapshotForStudent.mockResolvedValue({ streakDays: 14, activeToday: true, atRisk: false });
    prisma.quizAttempt.count
      .mockResolvedValueOnce(14)
      .mockResolvedValueOnce(3);
    prisma.practiceSession.count.mockResolvedValue(3);
    prisma.practiceSession.aggregate.mockResolvedValue({ _sum: { durationSec: 2700 } });
    prisma.dailyGoalCompletion.count.mockResolvedValue(2);

    const stats = await service.statsFor('student-1');

    expect(stats).toMatchObject({
      wordsLearned: 100,
      lessonsCompleted: 25,
      streakDays: 14,
      quizzesCompleted: 14,
      perfectQuizCount: 3,
      speakingSessions: 3,
      practiceMinutesTotal: 45,
      lessonMinutesTotal: 1125,
      weeklyGoalsCompleted: 2,
    });
    expect(stats.unlockedAchievementIds).toEqual(
      expect.arrayContaining([
        'ach_welcome_aboard',
        'ach_25_lessons',
        'ach_streak_14',
        'ach_words_100',
        'ach_quizzes_10',
        'ach_perfect_quiz_3',
        'ach_speaking_3',
        'ach_consistency_master',
        'ach_profile_complete',
      ]),
    );
  });

  it('allows teachers to load achievements for their own student', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: 'teacher-1',
        email: 'teacher@test.dev',
        displayName: 'Teacher',
        avatarUrl: null,
        timezone: 'Europe/Kyiv',
        proficiencyLevel: null,
        phone: null,
        telegram: null,
        bio: null,
        nativeLanguageId: null,
        role: 'TEACHER',
        teacherId: null,
      })
      .mockResolvedValueOnce({
        id: 'student-1',
        email: 'student@test.dev',
        displayName: 'Student',
        avatarUrl: null,
        timezone: 'Europe/Kyiv',
        proficiencyLevel: null,
        phone: null,
        telegram: null,
        bio: null,
        nativeLanguageId: null,
        role: 'STUDENT',
        teacherId: 'teacher-1',
      });
    prisma.scheduledLesson.count.mockResolvedValue(0);
    prisma.scheduledLesson.aggregate.mockResolvedValue({ _sum: { duration: null } });
    prisma.studentWordCard.count.mockResolvedValue(0);
    streaks.snapshotForStudent.mockResolvedValue({ streakDays: 0, activeToday: false, atRisk: false });
    prisma.quizAttempt.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    prisma.practiceSession.count.mockResolvedValue(0);
    prisma.practiceSession.aggregate.mockResolvedValue({ _sum: { durationSec: null } });
    prisma.dailyGoalCompletion.count.mockResolvedValue(0);

    await expect(service.statsFor('teacher-1', 'student-1')).resolves.toMatchObject({
      lessonsCompleted: 0,
      unlockedAchievementIds: ['ach_welcome_aboard'],
    });
  });

  it('rejects student access to another user achievements', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: 'student-1',
        email: 'student@test.dev',
        displayName: 'Student',
        avatarUrl: null,
        timezone: 'Europe/Kyiv',
        proficiencyLevel: null,
        phone: null,
        telegram: null,
        bio: null,
        nativeLanguageId: null,
        role: 'STUDENT',
        teacherId: 'teacher-1',
      })
      .mockResolvedValueOnce({
        id: 'student-2',
        email: 'other@test.dev',
        displayName: 'Other Student',
        avatarUrl: null,
        timezone: 'Europe/Kyiv',
        proficiencyLevel: null,
        phone: null,
        telegram: null,
        bio: null,
        nativeLanguageId: null,
        role: 'STUDENT',
        teacherId: 'teacher-1',
      });

    await expect(service.statsFor('student-1', 'student-2')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('throws when viewer does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.statsFor('missing-user')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

