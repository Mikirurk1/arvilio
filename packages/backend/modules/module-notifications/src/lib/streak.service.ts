import { Injectable } from '@nestjs/common';
import { PrismaService } from '@soenglish/data-access-prisma';
import type { LearningStreakDto } from '@soenglish/shared-types';

export type StreakSnapshot = {
  streakDays: number;
  activeToday: boolean;
  atRisk: boolean;
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

@Injectable()
export class StreakService {
  constructor(private readonly prisma: PrismaService) {}

  /** UTC calendar day key yyyy-MM-dd */
  private dayKey(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private async activityDays(userId: string, lookbackDays: number): Promise<Set<string>> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - lookbackDays);

    const [cards, attempts, lessons] = await Promise.all([
      this.prisma.studentWordCard.findMany({
        where: { userId, updatedAt: { gte: since } },
        select: { updatedAt: true },
      }),
      this.prisma.quizAttempt.findMany({
        where: { studentId: userId, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      this.prisma.scheduledLesson.findMany({
        where: {
          studentId: userId,
          status: 'COMPLETED',
          updatedAt: { gte: since },
        },
        select: { updatedAt: true },
      }),
    ]);

    const days = new Set<string>();
    for (const row of cards) days.add(this.dayKey(row.updatedAt));
    for (const row of attempts) days.add(this.dayKey(row.createdAt));
    for (const row of lessons) days.add(this.dayKey(row.updatedAt));
    return days;
  }

  async snapshotForStudent(userId: string): Promise<StreakSnapshot> {
    const days = await this.activityDays(userId, 120);
    const today = this.dayKey(new Date());
    const activeToday = days.has(today);

    let streakDays = 0;
    const cursor = new Date();
    if (!activeToday) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    while (days.has(this.dayKey(cursor))) {
      streakDays += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const atRisk = streakDays > 0 && !activeToday && days.has(this.dayKey(yesterday));

    return { streakDays, activeToday, atRisk };
  }

  async activityDaysForMonth(userId: string, year: number, month: number): Promise<number[]> {
    const days = await this.activityDays(userId, 120);
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return [...days]
      .filter((key) => key.startsWith(prefix))
      .map((key) => Number(key.slice(8, 10)))
      .filter((day) => day >= 1 && day <= 31)
      .sort((a, b) => a - b);
  }

  async learningStreakForDashboard(
    userId: string,
    now = new Date(),
  ): Promise<LearningStreakDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'STUDENT') return null;

    const snapshot = await this.snapshotForStudent(userId);
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const activeDays = await this.activityDaysForMonth(userId, year, month);

    return {
      streakDays: snapshot.streakDays,
      activeToday: snapshot.activeToday,
      year,
      month: MONTH_NAMES[month - 1] ?? 'Month',
      activeDays,
    };
  }
}
