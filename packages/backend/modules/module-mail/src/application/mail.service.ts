import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import {
  renderEmail,
  renderEmailFromVars,
  type EmailTemplateId,
  type WelcomeAccountEmailProps,
} from '@be/email-templates';

export type WelcomeAccountMailParams = {
  to: string;
  displayName: string;
  email: string;
  password: string;
  loginUrl: string;
};

const TEMPLATES_SOURCE = '@be/email-templates (React Email)';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;
    const host = process.env['SMTP_HOST'];
    if (!host) return null;
    const port = Number(process.env['SMTP_PORT'] ?? 587);
    const user = process.env['SMTP_USER'];
    const pass = process.env['SMTP_PASS'];
    this.transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
    return this.transporter;
  }

  isConfigured(): boolean {
    return Boolean(process.env['SMTP_HOST']);
  }

  getStatus(): {
    configured: boolean;
    smtpHost: string | null;
    smtpPort: number | null;
    mailFrom: string;
    templatesDir: string;
  } {
    return {
      configured: this.isConfigured(),
      smtpHost: process.env['SMTP_HOST'] ?? null,
      smtpPort: process.env['SMTP_PORT'] ? Number(process.env['SMTP_PORT']) : null,
      mailFrom: process.env['MAIL_FROM'] ?? 'SoEnglish <noreply@soenglish.local>',
      templatesDir: TEMPLATES_SOURCE,
    };
  }

  async verifyConnection(): Promise<void> {
    const transport = this.getTransporter();
    if (!transport) {
      throw new Error('SMTP is not configured (SMTP_HOST missing)');
    }
    await transport.verify();
  }

  appUrl(): string {
    return process.env['WEB_ORIGIN'] ?? 'http://localhost:4200';
  }

  async sendTestWelcomeEmail(to: string): Promise<{ sent: boolean; error?: string }> {
    const loginUrl = `${this.appUrl()}/login`;
    const sent = await this.sendWelcomeAccount({
      to: to.trim().toLowerCase(),
      displayName: 'Test User',
      email: to.trim().toLowerCase(),
      password: 'Example-Temp-Pass1',
      loginUrl,
    });
    return sent ? { sent: true } : { sent: false, error: 'Failed to send (check server logs)' };
  }

  async sendTemplated(
    to: string,
    templateId: EmailTemplateId,
    vars: Record<string, string>,
  ): Promise<boolean> {
    return this.sendRendered(to, await renderEmailFromVars(templateId, vars), templateId);
  }

  async sendWelcomeAccount(params: WelcomeAccountMailParams): Promise<boolean> {
    const props: WelcomeAccountEmailProps = {
      displayName: params.displayName,
      email: params.email,
      password: params.password,
      loginUrl: params.loginUrl,
    };
    return this.sendRendered(
      params.to,
      await renderEmail('welcome-account', props),
      'welcome-account',
    );
  }

  private async sendRendered(
    to: string,
    rendered: { subject: string; html: string; text: string },
    label: string,
  ): Promise<boolean> {
    const transport = this.getTransporter();
    if (!transport) {
      this.logger.warn(`SMTP_HOST is not set; skipping ${label} email`);
      return false;
    }

    const from = process.env['MAIL_FROM'] ?? 'SoEnglish <noreply@soenglish.local>';

    try {
      await transport.sendMail({
        from,
        to,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      });
      this.logger.log(`${label} email sent to ${to}`);
      return true;
    } catch (err) {
      this.logger.error(
        `Failed to send ${label} email to ${to}`,
        err instanceof Error ? err.stack : String(err),
      );
      return false;
    }
  }
}
