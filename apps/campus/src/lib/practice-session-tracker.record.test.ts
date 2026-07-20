import { PRACTICE_SESSION_LOGGED_EVENT, recordPracticeSession } from './practice-session-tracker';

const recordSession = jest.fn().mockResolvedValue(undefined);

jest.mock('../stores/practice-store', () => ({
  usePracticeStore: {
    getState: () => ({ recordSession }),
  },
}));

describe('recordPracticeSession', () => {
  beforeEach(() => {
    recordSession.mockClear();
  });

  it('skips short sessions and missing userId', async () => {
    await recordPracticeSession(undefined, 'vocabulary', Date.now() - 1000);
    await recordPracticeSession('user-1', 'vocabulary', Date.now() - 1000);
    expect(recordSession).not.toHaveBeenCalled();
  });

  it('records session and dispatches browser event', async () => {
    const dispatch = jest.fn();
    Object.defineProperty(global, 'window', {
      value: { dispatchEvent: dispatch },
      configurable: true,
    });

    const started = Date.now() - 60_000;
    await recordPracticeSession('user-1', 'quiz', started);

    expect(recordSession).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'quiz',
        startedAt: new Date(started).toISOString(),
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: PRACTICE_SESSION_LOGGED_EVENT }));
  });
});
