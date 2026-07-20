import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
  getPlatformIntegrationRuntime,
  type ResolvedPlatformIntegration,
} from '@be/platform-integration';
import {
  renderEmail,
  renderEmailFromVars,
  type EmailTemplateId,
  type EmailVerificationEmailProps,
  type PasswordResetEmailProps,
  type WelcomeAccountEmailProps,
} from '@be/email-templates';

export type WelcomeAccountMailParams = {
  to: string;
  displayName: string;
  email: string;
  password: string;
  loginUrl: string;
};

export type PasswordResetMailParams = {
  to: string;
  displayName: string;
  resetUrl: string;
  expiresInMinutes: number;
};

export type EmailVerificationMailParams = {
  to: string;
  displayName: string;
  verifyUrl: string;
  expiresInHours: number;
};

const TEMPLATES_SOURCE = '@be/email-templates (React Email)';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private transporterKey: string | null = null;

  private smtpRuntimeKey(): string {
    const smtp = getPlatformIntegrationRuntime().smtp;
    return [smtp.host, smtp.port, smtp.user ?? '', smtp.pass ?? '', smtp.secure].join('|');
  }

  private getTransporter(): Transporter | null {
    const smtp = getPlatformIntegrationRuntime().smtp;
    if (!smtp.host?.trim()) return null;

    const key = this.smtpRuntimeKey();
    if (this.transporter && this.transporterKey === key) return this.transporter;

    this.transporterKey = key;
    this.transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.user && smtp.pass ? { user: smtp.user, pass: smtp.pass } : undefined,
    });
    return this.transporter;
  }

  isConfigured(): boolean {
    return Boolean(getPlatformIntegrationRuntime().smtp.host?.trim());
  }

  getStatus(): {
    configured: boolean;
    smtpHost: string | null;
    smtpPort: number | null;
    mailFrom: string;
    templatesDir: string;
    smtpMode: string;
  } {
    const smtp = getPlatformIntegrationRuntime().smtp;
    return {
      configured: this.isConfigured(),
      smtpHost: smtp.host || null,
      smtpPort: smtp.port ?? null,
      mailFrom: smtp.mailFrom,
      templatesDir: TEMPLATES_SOURCE,
      smtpMode: smtp.source,
    };
  }

  /** Verify SMTP using an explicit resolved config (form draft or saved runtime). */
  async verifySmtpEndpoint(smtp: ResolvedPlatformIntegration['smtp']): Promise<void> {
    if (!smtp.host?.trim()) {
      throw new Error('SMTP is not configured (set server defaults in .env or custom SMTP in System)');
    }
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.user && smtp.pass ? { user: smtp.user, pass: smtp.pass } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    try {
      await transport.verify();
    } finally {
      transport.close();
    }
  }

  async verifyConnection(): Promise<void> {
    await this.verifySmtpEndpoint(getPlatformIntegrationRuntime().smtp);
  }

  /** Drop cached transporter after platform SMTP settings change. */
  clearTransporterCache(): void {
    this.transporter = null;
    this.transporterKey = null;
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
    fromDisplayName?: string | null,
  ): Promise<boolean> {
    return this.sendRendered(to, await renderEmailFromVars(templateId, vars), templateId, fromDisplayName);
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

  async sendEmailVerification(params: EmailVerificationMailParams): Promise<boolean> {
    const props: EmailVerificationEmailProps = {
      displayName: params.displayName,
      verifyUrl: params.verifyUrl,
      expiresInHours: String(params.expiresInHours),
    };
    return this.sendRendered(
      params.to,
      await renderEmail('email-verification', props),
      'email-verification',
    );
  }

  async sendPasswordReset(params: PasswordResetMailParams): Promise<boolean> {
    const props: PasswordResetEmailProps = {
      displayName: params.displayName,
      resetUrl: params.resetUrl,
      expiresInMinutes: String(params.expiresInMinutes),
    };
    return this.sendRendered(
      params.to,
      await renderEmail('password-reset', props),
      'password-reset',
    );
  }

  private async sendRendered(
    to: string,
    rendered: { subject: string; html: string; text: string },
    label: string,
    fromDisplayName?: string | null,
  ): Promise<boolean> {
    const transport = this.getTransporter();
    if (!transport) {
      this.logger.warn(`SMTP is not configured; skipping ${label} email`);
      return false;
    }

    const rawFrom = getPlatformIntegrationRuntime().smtp.mailFrom;
    const from = fromDisplayName ? buildFrom(rawFrom, fromDisplayName) : rawFrom;

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

/**
 * Build the SMTP `from` value with an optional display-name override.
 * Returns a nodemailer structured { name, address } object so nodemailer
 * performs correct RFC 5321 quoting — no hand-built header strings.
 * The display name is sanitized: CR/LF stripped, length capped at 64 chars.
 */
function buildFrom(
  mailFrom: string,
  displayName: string,
): { name: string; address: string } | string {
  // Strip header-injection chars; nodemailer will quote the rest correctly.
  const safeName = displayName.replace(/[\r\n]/g, ' ').trim().slice(0, 64);
  if (!safeName) return mailFrom;

  const match = mailFrom.match(/^"?([^"<]*)"?\s*<(.+)>$/);
  if (match) {
    const platformName = (match[1]!.trim() || 'Arvilio').replace(/[\r\n]/g, '');
    return { name: `${safeName} via ${platformName}`, address: match[2]!.trim() };
  }
  return { name: `${safeName} via Arvilio`, address: mailFrom.trim() };
}
