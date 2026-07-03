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

    const rows = await this.prisma.schoolMembership.findMany({
      where: {
        role: 'STUDENT',
        status: 'ACTIVE',
        school: { status: { not: 'SUSPENDED' } },
        user: { status: 'ACTIVE', notifyNewVocab: true },
      },
      select: {
        school: { select: { name: true } },
        user: { select: { id: true, email: true, displayName: true, notifyNewVocab: true } },
      },
    });
    const seen = new Map<string, { user: (typeof rows)[0]['user']; schoolName: string }>();
    for (const r of rows) {
      if (!seen.has(r.user.id)) seen.set(r.user.id, { user: r.user, schoolName: r.school.name });
    }
    const students = [...seen.values()];

    const vocabUrl = `${this.mail.appUrl()}/vocabulary`;

    for (const { user: student, schoolName } of students) {
      const dedupeKey = `vocab:${today}`;

      await this.dispatch.dispatch({
        schoolName,
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
