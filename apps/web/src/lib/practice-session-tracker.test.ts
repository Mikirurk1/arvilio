import { act, renderHook } from '@testing-library/react';
import { usePracticeStore } from '../stores/practice-store';
import { recordPracticeSession, usePracticeSessionTracker } from './practice-session-tracker';

jest.mock('../stores/practice-store', () => ({
  usePracticeStore: {
    getState: jest.fn(),
  },
}));

describe('practice-session-tracker', () => {
  const recordSession = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (usePracticeStore.getState as jest.Mock).mockReturnValue({ recordSession });
  });

  it('skips when userId missing', async () => {
    await recordPracticeSession(undefined, 'vocabulary', Date.now() - 60_000);
    expect(recordSession).not.toHaveBeenCalled();
  });

  it('skips sessions shorter than 30 seconds', async () => {
    const end = Date.now();
    await recordPracticeSession('u1', 'quiz', end - 10_000, end);
    expect(recordSession).not.toHaveBeenCalled();
  });

  it('records long enough sessions', async () => {
    const end = Date.now();
    const start = end - 60_000;
    await recordPracticeSession('u1', 'vocabulary', start, end);
    expect(recordSession).toHaveBeenCalledWith({
      kind: 'vocabulary',
      startedAt: new Date(start).toISOString(),
      endedAt: new Date(end).toISOString(),
    });
  });

  it('logs warning when recordSession fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    recordSession.mockRejectedValueOnce(new Error('network'));
    await recordPracticeSession('u1', 'quiz', Date.now() - 60_000);
    expect(warn).toHaveBeenCalledWith('[practice-session] failed to record', expect.any(Error));
    warn.mockRestore();
  });
});

describe('usePracticeSessionTracker', () => {
  const recordSession = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (usePracticeStore.getState as jest.Mock).mockReturnValue({ recordSession });
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('records session when active flips to false', async () => {
    const { rerender } = renderHook(
      ({ active }) => usePracticeSessionTracker('u1', 'vocabulary', active),
      { initialProps: { active: true } },
    );
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    rerender({ active: false });
    await act(async () => {
      await Promise.resolve();
    });
    expect(recordSession).toHaveBeenCalled();
  });

  it('records session on unmount while active', async () => {
    const { unmount } = renderHook(() => usePracticeSessionTracker('u1', 'quiz', true));
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(recordSession).toHaveBeenCalled();
  });
});
