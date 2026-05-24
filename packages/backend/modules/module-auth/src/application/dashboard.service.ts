import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { DashboardSummaryDto, WordOfDayDto } from '@pkg/types';
import { defaultGoalDateKey } from '@pkg/types';

function hashToUInt(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summaryFor(userId: string): Promise<DashboardSummaryDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new UnauthorizedException();

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')}`;
    const inSevenDays = new Date(now);
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    const sevenStr = `${inSevenDays.getFullYear()}-${String(inSevenDays.getMonth() + 1).padStart(2, '0')}-${String(
      inSevenDays.getDate(),
    ).padStart(2, '0')}`;

    const lessonsScope =
      user.role === 'STUDENT' ? { studentId: user.id } : { teacherId: user.id };

    const [lessonsToday, lessonsThisWeek, lessonsCompleted, vocabularyCount, reviewCount] =
      await Promise.all([
        this.prisma.scheduledLesson.count({
          where: { ...lessonsScope, date: todayStr },
        }),
        this.prisma.scheduledLesson.count({
          where: { ...lessonsScope, date: { gte: todayStr, lte: sevenStr } },
        }),
        this.prisma.scheduledLesson.count({
          where: { ...lessonsScope, status: 'COMPLETED' },
        }),
        user.role === 'STUDENT'
          ? this.prisma.studentWordCard.count({ where: { userId: user.id } })
          : Promise.resolve(0),
        user.role === 'STUDENT'
          ? this.prisma.studentWordCard.count({
              where: {
                userId: user.id,
                status: { in: ['NEW', 'REPEATED', 'MISTAKES_WORK'] },
              },
            })
          : Promise.resolve(0),
      ]);

    return {
      role: user.role.toLowerCase() as DashboardSummaryDto['role'],
      lessonsToday,
      lessonsThisWeek,
      lessonsCompleted,
      vocabularyCount,
      reviewCount,
    };
  }

  async wordOfDayFor(userId: string): Promise<WordOfDayDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'STUDENT') return null;

    const cards = await this.prisma.studentWordCard.findMany({
      where: { userId },
      include: { word: true },
      orderBy: { createdAt: 'asc' },
    });
    if (cards.length === 0) return null;

    const dateKey = defaultGoalDateKey();
    const pick = cards[hashToUInt(`${userId}|wod|${dateKey}`) % cards.length];
    const enDef = pick.word.definition;

    return {
      wordId: pick.word.id,
      cardId: pick.id,
      text: pick.word.text,
      phonetic: pick.word.phonetic,
      partOfSpeech: pick.word.partOfSpeech,
      definition: enDef,
      example: pick.word.example,
    };
  }
}
