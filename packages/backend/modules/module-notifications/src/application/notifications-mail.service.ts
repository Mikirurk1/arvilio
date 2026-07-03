import { Injectable } from '@nestjs/common';
import type { EmailTemplateId } from '@be/email-templates';
import { MailService } from '@be/mail';

@Injectable()
export class NotificationsMailService {
  constructor(private readonly mail: MailService) {}

  appUrl(): string {
    return this.mail.appUrl();
  }

  sendTemplated(
    to: string,
    templateName: EmailTemplateId,
    vars: Record<string, string>,
    senderDisplayName?: string | null,
  ): Promise<boolean> {
    return this.mail.sendTemplated(to, templateName, vars, senderDisplayName);
  }
}
