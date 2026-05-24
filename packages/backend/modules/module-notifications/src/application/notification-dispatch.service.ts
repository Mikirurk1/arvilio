import { Injectable } from '@nestjs/common';
import type { NotificationKind } from '@prisma/client';
import type { EmailTemplateId } from '@be/email-templates';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationsMailService } from './notifications-mail.service';
import { TelegramDeliveryService } from '../infrastructure/telegram-delivery.service';

export type DispatchNotificationInput = {
  userId: string;
  email: string;
  displayName: string;
  kind: NotificationKind;
  dedupeKey: string;
  enabled: boolean;
  emailTemplate: EmailTemplateId;
  emailVars: Record<string, string>;
  telegramHtml: string;
};

@Injectable()
export class NotificationDispatchService {
  constructor(
    private readonly delivery: NotificationDeliveryService,
    private readonly mail: NotificationsMailService,
    private readonly telegram: TelegramDeliveryService,
  ) {}

  async dispatch(input: DispatchNotificationInput): Promise<void> {
    if (!input.enabled) return;

    if (!(await this.delivery.wasSent(input.userId, input.kind, input.dedupeKey, 'email'))) {
      const sent = await this.mail.sendTemplated(
        input.email,
        input.emailTemplate,
        input.emailVars,
      );
      if (sent) {
        await this.delivery.recordSent(input.userId, input.kind, input.dedupeKey, 'email');
      }
    }

    if (!(await this.delivery.wasSent(input.userId, input.kind, input.dedupeKey, 'telegram'))) {
      const sent = await this.telegram.sendToUser(input.userId, input.telegramHtml);
      if (sent) {
        await this.delivery.recordSent(input.userId, input.kind, input.dedupeKey, 'telegram');
      }
    }
  }
}
