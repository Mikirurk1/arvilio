import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard, Roles, RolesGuard } from '@be/auth';
import { MailService } from '@be/mail';
import { PlatformSettingsService } from '../../application/platform-settings.service';
import {
  OkResultType,
  SendTestEmailResultType,
  SendTestWelcomeEmailInput,
  SystemMailStatusType,
  UpdateWordDictionaryProviderInput,
  WordDictionarySettingsType,
} from '@be/graphql';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SystemResolver {
  constructor(
    private readonly mail: MailService,
    private readonly platformSettings: PlatformSettingsService,
  ) {}

  @Query(() => SystemMailStatusType, { name: 'systemMailStatus' })
  async systemMailStatus() {
    return this.mail.getStatus();
  }

  @Mutation(() => OkResultType, { name: 'verifySmtpConnection' })
  async verifySmtpConnection() {
    try {
      await this.mail.verifyConnection();
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SMTP verification failed';
      throw new BadRequestException(message);
    }
  }

  @Mutation(() => SendTestEmailResultType, { name: 'sendTestWelcomeEmail' })
  async sendTestWelcomeEmail(@Args('input') input: SendTestWelcomeEmailInput) {
    const to = input.to?.trim().toLowerCase();
    if (!to || !to.includes('@')) {
      throw new BadRequestException('Invalid email address');
    }
    const result = await this.mail.sendTestWelcomeEmail(to);
    return {
      sent: result.sent,
      message: result.sent ? 'Test welcome email sent' : (result.error ?? 'Send failed'),
    };
  }

  @Query(() => WordDictionarySettingsType, { name: 'wordDictionarySettings' })
  async wordDictionarySettings() {
    return this.platformSettings.getWordDictionarySettings();
  }

  @Mutation(() => WordDictionarySettingsType, { name: 'updateWordDictionaryProvider' })
  async updateWordDictionaryProvider(@Args('input') input: UpdateWordDictionaryProviderInput) {
    const provider = input.provider?.trim();
    if (provider !== 'dictionary_api_dev' && provider !== 'wiktionary') {
      throw new BadRequestException('Invalid dictionary provider');
    }
    return this.platformSettings.setWordDictionaryProvider(provider);
  }
}
