import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PracticeSessionKind, PracticeSessionSource } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import type {
  PracticeSessionDto,
  PracticeWeekSummaryDto,
  RecordPracticeSessionRequestDto,
} from '@pkg/types';

const MIN_DURATION_SEC = 30;

const KIND_FROM_API: Record<string, PracticeSessionKind> = {
  vocabulary: PracticeSessionKind.VOCABULARY,
  quiz: PracticeSessionKind.QUIZ,
  speaking: PracticeSessionKind.SPEAKING,
  games: PracticeSessionKind.GAMES,
  challenges: PracticeSessionKind.CHALLENGES,
  lesson: PracticeSessionKind.LESSON,
};

const SOURCE_FROM_API: Record<string, PracticeSessionSource> = {
  practice: PracticeSessionSource.PRACTICE,
  lesson: PracticeSessionSource.LESSON,
  manual: PracticeSessionSource.MANUAL,
};

function weekRangeUtc(now = new Date()): { from: Date; to: Date } {
  const to = now;
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - 6);
  from.setUTCHours(0, 0, 0, 0);
  return { from, to };
}

@Injectable()
export class PracticeSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(userId: string, body: RecordPracticeSessionRequestDto): Promise<PracticeSessionDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new UnauthorizedException();

    const kind = KIND_FROM_API[body.kind];
    if (!kind) throw new BadRequestException(`Unknown practice session kind: ${body.kind}`);

    const source = body.source ? SOURCE_FROM_API[body.source] : PracticeSessionSource.PRACTICE;
    if (body.source && !source) {
      throw new BadRequestException(`Unknown practice session source: ${body.source}`);
    }

    const startedAt = new Date(body.startedAt);
    const endedAt = new Date(body.endedAt);
    if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime())) {
      throw new BadRequestException('Invalid session timestamps');
    }
    if (endedAt.getTime() <= startedAt.getTime()) {
      throw new BadRequestException('endedAt must be after startedAt');
    }

    const durationSec = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
    if (durationSec < MIN_DURATION_SEC) {
      throw new BadRequestException('Session shorter than minimum duration');
    }

    const row = await this.prisma.practiceSession.create({
      data: {
        userId,
        kind,
        source: source ?? PracticeSessionSource.PRACTICE,
        startedAt,
        endedAt,
        durationSec,
      },
    });

    return this.mapSession(row);
  }

  async weekSummaryFor(userId: string): Promise<PracticeWeekSummaryDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new UnauthorizedException();

    const { from, to } = weekRangeUtc();
    const sessions = await this.prisma.practiceSession.findMany({
      where: {
        userId,
        startedAt: { gte: from, lte: to },
      },
    });

    const practiceSessions = sessions.filter((s) => s.source === PracticeSessionSource.PRACTICE);
    const practiceMinutes = Math.round(
      practiceSessions.reduce((sum, s) => sum + s.durationSec, 0) / 60,
    );
    const quizzesCompleted = practiceSessions.filter((s) => s.kind === PracticeSessionKind.QUIZ).length;
    const speakingSessions = practiceSessions.filter(
      (s) => s.kind === PracticeSessionKind.SPEAKING,
    ).length;

    const newWordsLearned =
      user.role === 'STUDENT'
        ? await this.prisma.studentWordCard.count({
            where: { userId, createdAt: { gte: from, lte: to } },
          })
        : 0;

    const hoursLabel =
      practiceMinutes >= 60
        ? `${(practiceMinutes / 60).toFixed(1)}h`
        : practiceMinutes > 0
          ? `${practiceMinutes}m`
          : '0h';

    return {
      practiceMinutes,
      metrics: [
        { id: '1', label: 'New words learned', value: String(newWordsLearned) },
        { id: '2', label: 'Quizzes completed', value: String(quizzesCompleted) },
        { id: '3', label: 'Speaking sessions', value: String(speakingSessions) },
        { id: '4', label: 'Time practicing', value: hoursLabel },
      ],
    };
  }

  private mapSession(row: {
    id: string;
    kind: PracticeSessionKind;
    source: PracticeSessionSource;
    startedAt: Date;
    endedAt: Date;
    durationSec: number;
  }): PracticeSessionDto {
    const kindKey =
      (Object.entries(KIND_FROM_API).find(([, v]) => v === row.kind)?.[0] as
        | RecordPracticeSessionRequestDto['kind']
        | undefined) ?? 'vocabulary';
    const sourceKey =
      (Object.entries(SOURCE_FROM_API).find(([, v]) => v === row.source)?.[0] as
        | NonNullable<RecordPracticeSessionRequestDto['source']>
        | undefined) ?? 'practice';

    return {
      id: row.id,
      kind: kindKey,
      source: sourceKey,
      startedAt: row.startedAt.toISOString(),
      endedAt: row.endedAt.toISOString(),
      durationSec: row.durationSec,
    };
  }
}
