import { act, fireEvent, renderHook } from '@testing-library/react';
import { usePracticeStore } from '../stores/practice-store';
import {
  DEFAULT_PRACTICE_IDLE_TIMEOUT_MS,
  recordPracticeSession,
  recordPracticeSessionDuration,
  usePracticeSessionTracker,
} from './practice-session-tracker';

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
    await recordPracticeSessionDuration('u1', 'quiz', 10_000);
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
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('records wall-clock session when idle tracking is disabled', async () => {
    const { rerender } = renderHook(
      ({ active }) => usePracticeSessionTracker('u1', 'speaking', active, { idleTimeoutMs: false }),
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

  it('records engaged session when active flips to false', async () => {
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

  it('does not record when idle longer than engaged time', async () => {
    const { unmount } = renderHook(() =>
      usePracticeSessionTracker('u1', 'quiz', true, { idleTimeoutMs: 60_000 }),
    );
    act(() => {
      jest.advanceTimersByTime(DEFAULT_PRACTICE_IDLE_TIMEOUT_MS);
    });
    act(() => {
      jest.advanceTimersByTime(120_000);
    });
    unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(recordSession).toHaveBeenCalledTimes(1);
    const payload = recordSession.mock.calls[0]?.[0];
    expect(payload).toBeDefined();
    const durationSec =
      (new Date(payload.endedAt).getTime() - new Date(payload.startedAt).getTime()) / 1000;
    expect(durationSec).toBeGreaterThanOrEqual(30);
    expect(durationSec).toBeLessThanOrEqual(61);
  });

  it('extends engaged time when user interacts', async () => {
    const { unmount } = renderHook(() => usePracticeSessionTracker('u1', 'games', true));
    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    act(() => {
      fireEvent.pointerDown(window);
    });
    act(() => {
      jest.advanceTimersByTime(35_000);
    });
    unmount();
    await act(async () => {
      await Promise.resolve();
    });
    const payload = recordSession.mock.calls[0]?.[0];
    const durationSec =
      (new Date(payload.endedAt).getTime() - new Date(payload.startedAt).getTime()) / 1000;
    expect(durationSec).toBeGreaterThanOrEqual(60);
  });
});
