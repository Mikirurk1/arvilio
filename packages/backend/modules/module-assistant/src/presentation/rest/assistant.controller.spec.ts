import { HttpException } from '@nestjs/common';
import type { Response } from 'express';
import { AssistantController } from './assistant.controller';
import type { AssistantService } from '../../application/assistant.service';
import type { LlmProviderResolver } from '../../infrastructure/llm-providers/llm-provider.resolver';
import type { TenantContextService } from '@be/tenant';

function mockRes() {
  const writes: string[] = [];
  const res = {
    setHeader: jest.fn(),
    flushHeaders: jest.fn(),
    write: jest.fn((chunk: string) => {
      writes.push(chunk);
    }),
    end: jest.fn(),
    writableEnded: false,
    headersSent: false,
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  return { res: res as unknown as Response, writes, raw: res };
}

describe('AssistantController', () => {
  const assistant = {
    chat: jest.fn(),
  };
  const llm = {
    status: jest.fn(),
  };
  const tenant = {
    schoolId: 'school-1',
  };

  const controller = new AssistantController(
    assistant as unknown as AssistantService,
    llm as unknown as LlmProviderResolver,
    tenant as unknown as TenantContextService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    llm.status.mockResolvedValue({
      ready: true,
      message: null,
      enabled: true,
      modelConfigured: true,
      apiKeyConfigured: true,
      source: 'platform',
    });
  });

  it('status delegates to llm.status(schoolId)', async () => {
    const dto = await controller.status();
    expect(llm.status).toHaveBeenCalledWith('school-1');
    expect(dto.ready).toBe(true);
  });

  it('chat throws 400 when message empty', async () => {
    const { res } = mockRes();
    let caught: unknown;
    try {
      await controller.chat('u1', { message: '  ' }, res);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(HttpException);
    expect((caught as HttpException).getStatus()).toBe(400);
    expect(assistant.chat).not.toHaveBeenCalled();
  });

  it('chat throws 503 before SSE when LLM not ready', async () => {
    llm.status.mockResolvedValue({
      ready: false,
      message: 'Arvi assistant is not configured.',
      enabled: false,
      modelConfigured: false,
      apiKeyConfigured: false,
      source: null,
    });
    const { res } = mockRes();
    let caught: unknown;
    try {
      await controller.chat('u1', { message: 'Hi' }, res);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(HttpException);
    expect((caught as HttpException).getStatus()).toBe(503);
    expect(assistant.chat).not.toHaveBeenCalled();
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it('chat writes SSE events from assistant stream', async () => {
    assistant.chat.mockImplementation(async function* () {
      yield { event: 'delta', data: { text: 'Hi' } };
      yield {
        event: 'done',
        data: { text: 'Hi', promptTokens: 1, completionTokens: 1 },
      };
    });
    const { res, writes, raw } = mockRes();
    await controller.chat('u1', { message: 'Hello' }, res);

    expect(raw.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/event-stream; charset=utf-8',
    );
    expect(writes.join('')).toContain('event: delta');
    expect(writes.join('')).toContain('"text":"Hi"');
    expect(raw.end).toHaveBeenCalled();
  });

  it('chat SSE error path uses public message (no raw secrets)', async () => {
    assistant.chat.mockImplementation(async function* () {
      throw new HttpException(
        'Provider said sk-leakKEY123456789012345678901234567890',
        502,
      );
    });
    const { res, writes, raw } = mockRes();
    raw.headersSent = true;
    await controller.chat('u1', { message: 'Hello' }, res);

    const blob = writes.join('');
    expect(blob).toContain('event: error');
    expect(blob).not.toMatch(/sk-leak/i);
    expect(blob).toMatch(/unavailable|misconfigured|try again/i);
  });
});
