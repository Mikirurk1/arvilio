import {
  publicAdminLlmError,
  publicChatLlmError,
  redactSecrets,
} from './llm-public-error';

describe('llm-public-error', () => {
  it('redacts bearer tokens and sk- keys', () => {
    const raw =
      'Invalid key Bearer sk-proj-ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 and sk-ant-secretvaluehere1234567890';
    const out = redactSecrets(raw);
    expect(out).not.toContain('sk-proj-');
    expect(out).not.toContain('Bearer sk-');
    expect(out).toContain('[REDACTED]');
  });

  it('maps chat errors to safe copy without provider body', () => {
    expect(publicChatLlmError(401)).toMatch(/misconfigured/i);
    expect(publicChatLlmError(401)).not.toMatch(/sk-/);
    expect(publicChatLlmError(404)).toMatch(/model or endpoint/i);
  });

  it('admin errors keep status but redact key material in detail', () => {
    const body = JSON.stringify({
      error: { message: 'Invalid API key: sk-proj-ABCDEFGHIJKLMNOPQRSTUVWX1234567890abcd' },
    });
    const msg = publicAdminLlmError(401, body);
    expect(msg).toContain('401');
    expect(msg).not.toContain('sk-proj-ABCDEF');
    expect(msg).toContain('[REDACTED]');
  });
});
