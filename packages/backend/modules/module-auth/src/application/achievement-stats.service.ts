import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PracticeSessionKind, PracticeSessionSource, UserRole } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import {
  EMPTY_ACHIEVEMENT_STATS,
  computeUnlockedAchievementIds,
  type AchievementStatsDto,
} from '@pkg/types';
import { StreakService } from '../../../module-notifications/src/application/streak.service';

type UserAchievementProfileRow = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  proficiencyLevel: string | null;
  phone: string | null;
  telegram: string | null;
  bio: string | null;
  nativeLanguageId: string | null;
  role: UserRole;
  teacherId: string | null;
};

function dayKeyUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class AchievementStatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streaks: StreakService,
  ) {}

  async statsFor(viewerId: string, studentId?: string): Promise<AchievementStatsDto> {
    const target = await this.resolveTargetUser(viewerId, studentId);
    const profileComplete = this.isProfileComplete(target);

    if (target.role !== 'STUDENT') {
      return this.withUnlockedIds(EMPTY_ACHIEVEMENT_STATS, profileComplete);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    const weekStartKey = dayKeyUtc(sevenDaysAgo);
    const todayKey = dayKeyUtc(new Date());

    const [
      lessonsCompleted,
      lessonDurationAggregate,
      wordsLearned,
      streakSnapshot,
      quizzesCompleted,
      perfectQuizCount,
      speakingSessions,
      gamesSessions,
      speakingSubmissions,
      speakingReviewsReceived,
      speakingDurationAggregate,
      practiceDurationAggregate,
      weeklyGoalsCompleted,
    ] = await Promise.all([
      this.prisma.scheduledLesson.count({
        where: { studentId: target.id, status: 'COMPLETED' },
      }),
      this.prisma.scheduledLesson.aggregate({
        where: { studentId: target.id, status: 'COMPLETED' },
        _sum: { duration: true },
      }),
      this.prisma.studentWordCard.count({
        where: { userId: target.id },
      }),
      this.streaks.snapshotForStudent(target.id),
      this.prisma.quizAttempt.count({
        where: { studentId: target.id },
      }),
      this.prisma.quizAttempt.count({
        where: { studentId: target.id, totalCount: { gt: 0 }, score: 100 },
      }),
      this.prisma.practiceSession.count({
        where: {
          userId: target.id,
          source: PracticeSessionSource.PRACTICE,
          kind: PracticeSessionKind.SPEAKING,
        },
      }),
      this.prisma.practiceSession.count({
        where: {
          userId: target.id,
          source: PracticeSessionSource.PRACTICE,
          kind: PracticeSessionKind.GAMES,
        },
      }),
      this.prisma.speakingSubmission.count({
        where: { studentId: target.id },
      }),
      this.prisma.speakingSubmission.count({
        where: { studentId: target.id, status: 'REVIEWED' },
      }),
      this.prisma.practiceSession.aggregate({
        where: {
          userId: target.id,
          source: PracticeSessionSource.PRACTICE,
          kind: PracticeSessionKind.SPEAKING,
        },
        _sum: { durationSec: true },
      }),
      this.prisma.practiceSession.aggregate({
        where: { userId: target.id, source: PracticeSessionSource.PRACTICE },
        _sum: { durationSec: true },
      }),
      this.prisma.dailyGoalCompletion.count({
        where: {
          userId: target.id,
          dateKey: { gte: weekStartKey, lte: todayKey },
        },
      }),
    ]);

    return this.withUnlockedIds(
      {
        wordsLearned,
        lessonsCompleted,
        streakDays: streakSnapshot.streakDays,
        quizzesCompleted,
        perfectQuizCount,
        speakingSessions,
        speakingSubmissions,
        speakingReviewsReceived,
        speakingMinutesTotal: Math.round(
          (speakingDurationAggregate._sum.durationSec ?? 0) / 60,
        ),
        gamesSessions,
        practiceMinutesTotal: Math.round((practiceDurationAggregate._sum.durationSec ?? 0) / 60),
        lessonMinutesTotal: lessonDurationAggregate._sum.duration ?? 0,
        weeklyGoalsCompleted,
        unlockedAchievementIds: [],
      },
      profileComplete,
    );
  }

  private withUnlockedIds(
    stats: AchievementStatsDto,
    profileComplete: boolean,
  ): AchievementStatsDto {
    return {
      ...stats,
      unlockedAchievementIds: computeUnlockedAchievementIds(
        {
          wordsLearned: stats.wordsLearned,
          lessonsCompleted: stats.lessonsCompleted,
          streakDays: stats.streakDays,
          quizzesCompleted: stats.quizzesCompleted,
          perfectQuizCount: stats.perfectQuizCount,
          speakingSessions: stats.speakingSessions,
          speakingSubmissions: stats.speakingSubmissions,
          speakingReviewsReceived: stats.speakingReviewsReceived,
          speakingMinutesTotal: stats.speakingMinutesTotal,
          gamesSessions: stats.gamesSessions,
          practiceMinutesTotal: stats.practiceMinutesTotal,
          lessonMinutesTotal: stats.lessonMinutesTotal,
          weeklyGoalsCompleted: stats.weeklyGoalsCompleted,
        },
        { profileComplete },
      ),
    };
  }

  private isProfileComplete(user: UserAchievementProfileRow): boolean {
    return Boolean(
      user.displayName.trim() &&
        user.email.trim() &&
        user.avatarUrl?.trim() &&
        user.timezone.trim() &&
        user.proficiencyLevel &&
        user.phone?.trim() &&
        user.telegram?.trim() &&
        user.bio?.trim() &&
        user.nativeLanguageId?.trim(),
    );
  }

  private async resolveTargetUser(
    viewerId: string,
    studentId?: string,
  ): Promise<UserAchievementProfileRow> {
    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        timezone: true,
        proficiencyLevel: true,
        phone: true,
        telegram: true,
        bio: true,
        nativeLanguageId: true,
        role: true,
        teacherId: true,
      },
    });
    if (!viewer) throw new UnauthorizedException();

    if (!studentId || studentId === viewerId) {
      return viewer;
    }

    const target = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        timezone: true,
        proficiencyLevel: true,
        phone: true,
        telegram: true,
        bio: true,
        nativeLanguageId: true,
        role: true,
        teacherId: true,
      },
    });
    if (!target) throw new UnauthorizedException();
    if (viewer.role === 'STUDENT') {
      throw new ForbiddenException('Students can only view their own achievements');
    }
    if (target.role !== 'STUDENT') {
      throw new ForbiddenException('Student achievements are only available for student accounts');
    }
    if (viewer.role === 'TEACHER' && target.teacherId !== viewer.id) {
      throw new ForbiddenException('You can only view achievements for your own students');
    }

    return target;
  }
}

