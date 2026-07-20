import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  AuthGuard,
  CurrentUser,
  FeatureGuard,
  RequiresFeature,
} from '@be/auth';
import { TenantContextService } from '@be/tenant';
import { AssistantService } from '../../application/assistant.service';
import { LlmProviderResolver } from '../../infrastructure/llm-providers/llm-provider.resolver';
import {
  publicChatLlmError,
  redactSecrets,
  statusFromProviderErrorMessage,
} from '../../application/llm-public-error';

type ChatBody = {
  message?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  pathname?: string;
  locale?: string;
};

@Controller('assistant')
@UseGuards(AuthGuard)
export class AssistantController {
  constructor(
    private readonly assistant: AssistantService,
    private readonly llm: LlmProviderResolver,
    private readonly tenant: TenantContextService,
  ) {}

  /**
   * Readiness for Arvi chat UI — does not consume AI credits.
   * Still requires `aiAssist` so Free schools get a feature-blocked response.
   */
  @Get('status')
  @RequiresFeature('aiAssist')
  @UseGuards(FeatureGuard)
  async status() {
    return this.llm.status(this.tenant.schoolId);
  }

  /**
   * SSE stream: event: refused|delta|navigate|done|error
   * Requires plan feature `aiAssist` (Pro).
   */
  @Post('chat')
  @RequiresFeature('aiAssist')
  @UseGuards(FeatureGuard)
  async chat(
    @CurrentUser() userId: string,
    @Body() body: ChatBody,
    @Res() res: Response,
  ): Promise<void> {
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      throw new HttpException('message is required', 400);
    }

    // Preflight before SSE headers so unconfigured LLM returns JSON 503.
    const readiness = await this.llm.status(this.tenant.schoolId);
    if (!readiness.ready) {
      throw new HttpException(
        readiness.message ?? 'Arvi assistant is not configured.',
        503,
      );
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const write = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      for await (const evt of this.assistant.chat({
        userId,
        message,
        history: Array.isArray(body.history) ? body.history : [],
        pathname: body.pathname ?? null,
        locale: body.locale ?? null,
      })) {
        write(evt.event, evt.data);
      }
    } catch (err) {
      const status = err instanceof HttpException ? err.getStatus() : 500;
      const raw =
        err instanceof HttpException
          ? typeof err.getResponse() === 'string'
            ? (err.getResponse() as string)
            : ((err.getResponse() as { message?: string }).message ?? err.message)
          : (err as Error).message ?? 'Assistant error';
      // Chat clients never receive provider bodies or key material.
      const msg =
        err instanceof HttpException && status === 503
          ? redactSecrets(String(raw))
          : publicChatLlmError(
              err instanceof HttpException
                ? status
                : statusFromProviderErrorMessage(String(raw)),
            );
      if (!res.headersSent) {
        res.status(status >= 400 ? status : 503).json({ message: msg });
        return;
      }
      write('error', { message: msg });
    } finally {
      if (!res.writableEnded) res.end();
    }
  }
}
