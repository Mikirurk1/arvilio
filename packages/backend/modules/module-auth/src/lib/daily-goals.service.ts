import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@soenglish/data-access-prisma';
import type { DailyGoalDto } from '@soenglish/shared-types';
import {
  GOAL_XP_BY_DIFFICULTY,
  defaultGoalDateKey,
  getDailyGoalsForUser,
  goalTemplates,
  parseDailyGoalId,
} from '@soenglish/shared-types';

@Injectable()
export class DailyGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string, dateKey: string = defaultGoalDateKey()): Promise<DailyGoalDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new UnauthorizedException();
    if (user.role !== 'STUDENT') return [];

    const instances = getDailyGoalsForUser(userId, dateKey);
    const completions = await this.prisma.dailyGoalCompletion.findMany({
      where: { userId, dateKey },
      select: { difficulty: true },
    });
    const doneTiers = new Set(completions.map((row) => row.difficulty));

    return instances.map((goal) => ({
      id: goal.id,
      templateId: goal.templateId,
      text: goal.text,
      difficulty: goal.difficulty,
      done: doneTiers.has(goal.difficulty),
      xpReward: GOAL_XP_BY_DIFFICULTY[goal.difficulty],
      dateKey,
    }));
  }

  async setDone(userId: string, goalId: string, done: boolean): Promise<DailyGoalDto[]> {
    const parsed = parseDailyGoalId(goalId);
    if (!parsed) throw new BadRequestException('Invalid goal id');

    const template = goalTemplates.find((row) => row.id === parsed.templateId);
    if (!template) throw new BadRequestException('Unknown goal template');

    const expected = getDailyGoalsForUser(userId, parsed.dateKey).find((row) => row.id === goalId);
    if (!expected) throw new BadRequestException('Goal is not assigned for this day');

    if (done) {
      await this.prisma.dailyGoalCompletion.upsert({
        where: {
          userId_dateKey_difficulty: {
            userId,
            dateKey: parsed.dateKey,
            difficulty: template.difficulty,
          },
        },
        create: {
          userId,
          dateKey: parsed.dateKey,
          templateId: template.id,
          difficulty: template.difficulty,
        },
        update: {
          templateId: template.id,
          completedAt: new Date(),
        },
      });
    } else {
      await this.prisma.dailyGoalCompletion.deleteMany({
        where: {
          userId,
          dateKey: parsed.dateKey,
          difficulty: template.difficulty,
        },
      });
    }

    return this.listForUser(userId, parsed.dateKey);
  }
}
