import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationKind } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { NotificationDispatchService } from '../../application/notification-dispatch.service';
import { NotificationsMailService } from '../../application/notifications-mail.service';
import { telegramNewVocab } from '../../shared/notification-telegram.format';

@Injectable()
export class NewVocabJob {
  private readonly logger = new Logger(NewVocabJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatch: NotificationDispatchService,
    private readonly mail: NotificationsMailService,
  ) {}

  async run(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const words = await this.prisma.word.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        text: true,
        definition: true,
        definitions: { take: 1, select: { text: true } },
      },
    });
    if (words.length === 0) return;

    const index =
      parseInt(createHash('sha256').update(today).digest('hex').slice(0, 8), 16) % words.length;
    const word = words[index]!;
    const definition = word.definitions[0]?.text ?? word.definition ?? 'Open the app to learn more.';

    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT', status: 'ACTIVE', notifyNewVocab: true },
      select: { id: true, email: true, displayName: true, notifyNewVocab: true },
    });

    const vocabUrl = `${this.mail.appUrl()}/vocabulary`;

    for (const student of students) {
      const dedupeKey = `vocab:${today}`;

      await this.dispatch.dispatch({
        userId: student.id,
        email: student.email,
        displayName: student.displayName,
        kind: NotificationKind.NEW_VOCAB,
        dedupeKey,
        enabled: student.notifyNewVocab,
        emailTemplate: 'new-vocabulary',
        emailVars: {
          displayName: student.displayName,
          word: word.text,
          definition,
          appUrl: vocabUrl,
        },
        telegramHtml: telegramNewVocab({
          displayName: student.displayName,
          word: word.text,
          definition,
          appUrl: vocabUrl,
        }),
      });
    }

    this.logger.debug(`New vocab job complete (${students.length} students)`);
  }
}
