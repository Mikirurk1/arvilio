import { HttpException, HttpStatus } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { _resetAssistantRateLimitForTests } from '../shared/rate-limit';
import type { LlmProviderResolver } from '../infrastructure/llm-providers/llm-provider.resolver';
import type { EntitlementsService } from '@be/billing/entitlements';
import type { TenantContextService } from '@be/tenant';

async function* sseDeltas(
  chunks: Array<{ type: 'delta'; text: string } | { type: 'usage'; promptTokens: number; completionTokens: number }>,
) {
  for (const c of chunks) yield c;
}

describe('AssistantService', () => {
  const llm = {
    resolve: jest.fn(),
    streamChat: jest.fn(),
  };
  const entitlements = {
    assertAiCredit: jest.fn(),
    consumeAiCredit: jest.fn(),
  };
  const tenant = {
    schoolId: 'school-1',
    membershipRole: 'STUDENT' as string | null,
  };

  const service = new AssistantService(
    llm as unknown as LlmProviderResolver,
    entitlements as unknown as EntitlementsService,
    tenant as unknown as TenantContextService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    _resetAssistantRateLimitForTests();
    tenant.schoolId = 'school-1';
    tenant.membershipRole = 'STUDENT';
    llm.resolve.mockResolvedValue({ model: 'gpt-test' });
    entitlements.assertAiCredit.mockResolvedValue(undefined);
    entitlements.consumeAiCredit.mockResolvedValue(undefined);
  });

  async function collect(
    input: Parameters<AssistantService['chat']>[0],
  ) {
    const events = [];
    for await (const evt of service.chat(input)) {
      events.push(evt);
    }
    return events;
  }

  it('streams delta + done and consumes AI credit', async () => {
    llm.streamChat.mockReturnValue(
      sseDeltas([
        { type: 'delta', text: 'Hello ' },
        { type: 'delta', text: 'there' },
        { type: 'usage', promptTokens: 10, completionTokens: 2 },
      ]),
    );

    const events = await collect({
      userId: 'u1',
      message: 'Where is the calendar?',
    });

    expect(entitlements.assertAiCredit).toHaveBeenCalledWith('school-1');
    expect(entitlements.consumeAiCredit).toHaveBeenCalledWith('school-1');
    expect(events).toEqual(
      expect.arrayContaining([
        { event: 'delta', data: { text: 'Hello ' } },
        { event: 'delta', data: { text: 'there' } },
        {
          event: 'done',
          data: { text: 'Hello there', promptTokens: 10, completionTokens: 2 },
        },
      ]),
    );
  });

  it('emits navigate when path is allowlisted for role', async () => {
    llm.streamChat.mockReturnValue(
      sseDeltas([
        {
          type: 'delta',
          text: 'Open calendar.\nNAVIGATE: /calendar',
        },
      ]),
    );

    const events = await collect({
      userId: 'u1',
      message: 'Show me calendar',
    });

    expect(events).toContainEqual({
      event: 'navigate',
      data: { path: '/calendar' },
    });
    const done = events.find((e) => e.event === 'done');
    expect(done?.data).toMatchObject({ text: 'Open calendar.' });
  });

  it('strips disallowed NAVIGATE for student (no navigate event)', async () => {
    llm.streamChat.mockReturnValue(
      sseDeltas([
        {
          type: 'delta',
          text: 'Go to finance.\nNAVIGATE: /finance',
        },
      ]),
    );

    const events = await collect({
      userId: 'u1',
      message: 'Show finance',
    });

    expect(events.some((e) => e.event === 'navigate')).toBe(false);
  });

  it('refuses academic cheat intent without calling LLM or consuming credit', async () => {
    const events = await collect({
      userId: 'u1',
      message: 'Give me the homework answers for this quiz',
    });

    expect(llm.streamChat).not.toHaveBeenCalled();
    expect(entitlements.consumeAiCredit).not.toHaveBeenCalled();
    expect(events[0]?.event).toBe('refused');
    expect(events[0]?.data).toMatchObject({ reason: 'academic' });
    expect(events.some((e) => e.event === 'done')).toBe(true);
  });

  it('maps provider stream errors to public chat copy (no raw key)', async () => {
    llm.streamChat.mockImplementation(async function* () {
      throw new Error(
        'LLM provider error (401): Invalid API key sk-secretABCDEF1234567890',
      );
    });

    const events = await collect({
      userId: 'u1',
      message: 'Hello',
    });

    const err = events.find((e) => e.event === 'error');
    expect(err?.data.message).toMatch(/misconfigured|authentication/i);
    expect(err?.data.message).not.toMatch(/sk-secret/i);
    expect(entitlements.consumeAiCredit).not.toHaveBeenCalled();
  });

  it('throws 503 when LLM resolve fails closed', async () => {
    llm.resolve.mockRejectedValue(
      new HttpException(
        'Arvi assistant is not configured.',
        HttpStatus.SERVICE_UNAVAILABLE,
      ),
    );

    let caught: unknown;
    try {
      await collect({ userId: 'u1', message: 'Hello' });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(HttpException);
    expect((caught as HttpException).getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(entitlements.assertAiCredit).not.toHaveBeenCalled();
  });
});
