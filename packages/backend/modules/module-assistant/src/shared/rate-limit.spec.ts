import {
  assertAssistantRateLimit,
  _resetAssistantRateLimitForTests,
} from './rate-limit';

describe('assertAssistantRateLimit', () => {
  beforeEach(() => _resetAssistantRateLimitForTests());

  it('allows bursts under the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => assertAssistantRateLimit('u1', 10)).not.toThrow();
    }
  });

  it('throws 429 when exceeded', () => {
    for (let i = 0; i < 3; i++) assertAssistantRateLimit('u2', 3);
    expect(() => assertAssistantRateLimit('u2', 3)).toThrow(/Too many/);
  });
});
