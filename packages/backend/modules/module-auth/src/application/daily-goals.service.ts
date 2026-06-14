import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { DailyGoalDto } from '@pkg/types';
import { defaultGoalDateKey, getDailyGoalsForUser } from '@pkg/types';
import { DailyGoalProgressService } from './daily-goal-progress.service';

@Injectable()
export class DailyGoalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: DailyGoalProgressService,
  ) {}

  async listForUser(userId: string, dateKey: string = defaultGoalDateKey()): Promise<DailyGoalDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new UnauthorizedException();
    if (user.role !== 'STUDENT') return [];

    const instances = getDailyGoalsForUser(userId, dateKey);
    const progressById = await this.progress.evaluateForGoals(userId, instances, dateKey);

    return instances.map((goal) => {
      const snap = progressById.get(goal.id) ?? { current: 0, target: 1, label: '', done: false };
      return {
        id: goal.id,
        templateId: goal.templateId,
        kind: goal.kind,
        text: goal.text,
        difficulty: goal.difficulty,
        done: snap.done,
        progressCurrent: snap.current,
        progressTarget: snap.target,
        progressLabel: snap.label,
        actionPath: goal.actionPath,
        dateKey,
      };
    });
  }
}
