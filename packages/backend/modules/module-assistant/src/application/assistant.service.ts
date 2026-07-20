import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EntitlementsService } from '@be/billing/entitlements';
import { TenantContextService } from '@be/tenant';
import {
  detectRefusal,
  refusalMessage,
} from '../domain/academic-refusal';
import {
  buildSystemPrompt,
  extractNavigate,
  stripNavigateMarker,
  type AssistantRole,
} from '../domain/system-prompt';
import type { LlmMessage } from '../infrastructure/llm-providers/llm-provider.interface';
import { LlmProviderResolver } from '../infrastructure/llm-providers/llm-provider.resolver';
import {
  formatChunksForPrompt,
  retrieveHelpChunks,
  roleToAudience,
} from '../infrastructure/corpus/retrieve-help';
import { assertAssistantRateLimit } from '../shared/rate-limit';
import {
  publicChatLlmError,
  redactSecrets,
  statusFromProviderErrorMessage,
} from './llm-public-error';

export type ChatHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

export type AssistantChatInput = {
  userId: string;
  message: string;
  history?: ChatHistoryItem[];
  pathname?: string | null;
  locale?: string | null;
};

export type AssistantSseEvent =
  | { event: 'refused'; data: { reason: string; message: string } }
  | { event: 'delta'; data: { text: string } }
  | { event: 'navigate'; data: { path: string } }
  | { event: 'done'; data: { text: string; promptTokens: number; completionTokens: number } }
  | { event: 'error'; data: { message: string } };

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly llm: LlmProviderResolver,
    private readonly entitlements: EntitlementsService,
    private readonly tenant: TenantContextService,
  ) {}

  private resolveRole(): AssistantRole {
    return roleToAudience(this.tenant.membershipRole);
  }

  /**
   * Stream assistant reply as typed SSE events.
   */
  async *chat(input: AssistantChatInput): AsyncIterable<AssistantSseEvent> {
    const schoolId = this.tenant.schoolId;

    // Fail closed before spending AI credits when LLM is not configured.
    try {
      await this.llm.resolve(schoolId);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        'Arvi assistant is not configured.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      assertAssistantRateLimit(input.userId);
    } catch (e) {
      throw new HttpException(
        (e as Error).message,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (schoolId) {
      await this.entitlements.assertAiCredit(schoolId);
    }

    const role = this.resolveRole();

    const refusal = detectRefusal(input.message);
    if (refusal) {
      const message = refusalMessage(refusal, role);
      this.logger.log(
        JSON.stringify({
          type: 'assistant_audit',
          userId: input.userId,
          schoolId,
          role,
          outcome: 'refused',
          reason: refusal,
        }),
      );
      yield { event: 'refused', data: { reason: refusal, message } };
      yield {
        event: 'done',
        data: { text: message, promptTokens: 0, completionTokens: 0 },
      };
      return;
    }

    const audience = roleToAudience(this.tenant.membershipRole);
    const chunks = retrieveHelpChunks(input.message, audience, 5);
    const retrievedDocs = formatChunksForPrompt(chunks);
    const system = buildSystemPrompt({
      role,
      pathname: input.pathname,
      locale: input.locale,
      retrievedDocs,
    });

    const history = (input.history ?? []).slice(-6);
    const messages: LlmMessage[] = [
      { role: 'system', content: system },
      ...history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content.slice(0, 2000),
      })),
      { role: 'user', content: input.message.slice(0, 2000) },
    ];

    let full = '';
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      for await (const chunk of this.llm.streamChat(messages, schoolId)) {
        if (chunk.type === 'delta') {
          full += chunk.text;
          yield { event: 'delta', data: { text: chunk.text } };
        } else if (chunk.type === 'usage') {
          promptTokens = chunk.promptTokens;
          completionTokens = chunk.completionTokens;
        }
      }
    } catch (err) {
      if (err instanceof HttpException) {
        const response = err.getResponse();
        const raw =
          typeof response === 'string'
            ? response
            : Array.isArray((response as { message?: string | string[] }).message)
              ? ((response as { message: string[] }).message).join(', ')
              : ((response as { message?: string }).message ?? err.message);
        // Config/readiness messages are already safe; still redact just in case.
        yield { event: 'error', data: { message: redactSecrets(String(raw)) } };
        return;
      }
      const raw = (err as Error).message?.trim() ?? '';
      this.logger.warn(`LLM stream failed: ${raw.slice(0, 300)}`);
      // Never forward provider bodies / keys to end users in chat.
      yield {
        event: 'error',
        data: {
          message: publicChatLlmError(statusFromProviderErrorMessage(raw)),
        },
      };
      return;
    }

    if (schoolId) {
      await this.entitlements.consumeAiCredit(schoolId);
    }

    const path = extractNavigate(full, role);
    const clean = stripNavigateMarker(full);
    if (path) {
      yield { event: 'navigate', data: { path } };
    }

    this.logger.log(
      JSON.stringify({
        type: 'assistant_audit',
        userId: input.userId,
        schoolId,
        role,
        outcome: 'answered',
        promptTokens,
        completionTokens,
        chunks: chunks.map(c => c.id),
      }),
    );

    yield {
      event: 'done',
      data: { text: clean, promptTokens, completionTokens },
    };
  }
}
