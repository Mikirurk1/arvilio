import { Module } from '@nestjs/common';
import { PrismaModule } from '@be/prisma';
import { BillingModule } from '@be/billing';
import { AuthModule } from '@be/auth';
import { AssistantService } from './application/assistant.service';
import { LlmSettingsService } from './application/llm-settings.service';
import { AssistantController } from './presentation/rest/assistant.controller';
import { SchoolLlmController } from './presentation/rest/school-llm.controller';
import { AnthropicProvider } from './infrastructure/llm-providers/anthropic.provider';
import { LlmProviderResolver } from './infrastructure/llm-providers/llm-provider.resolver';
import { OpenAiCompatProvider } from './infrastructure/llm-providers/openai-compat.provider';

@Module({
  imports: [PrismaModule, BillingModule, AuthModule],
  controllers: [AssistantController, SchoolLlmController],
  providers: [
    OpenAiCompatProvider,
    AnthropicProvider,
    LlmSettingsService,
    LlmProviderResolver,
    AssistantService,
  ],
  exports: [AssistantService, LlmProviderResolver, LlmSettingsService],
})
export class AssistantModule {}
