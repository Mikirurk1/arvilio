/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useArviVoice } from './useArviVoice';

describe('useArviVoice', () => {
  const playMock = jest.fn().mockResolvedValue(undefined);
  const pauseMock = jest.fn();

  beforeEach(() => {
    playMock.mockClear();
    pauseMock.mockClear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Audio = jest.fn().mockImplementation(() => ({
      play: playMock,
      pause: pauseMock,
      volume: 1,
      currentTime: 0,
    }));
  });

  it('plays voice when unmuted and src is set', () => {
    const { result } = renderHook(() => useArviVoice({ muted: false }));
    act(() => {
      result.current.playVoice('/mascot/voice/en/stu-welcome.mp3');
    });
    expect(global.Audio).toHaveBeenCalledWith('/mascot/voice/en/stu-welcome.mp3');
    expect(playMock).toHaveBeenCalled();
  });

  it('does not play when muted', () => {
    const { result } = renderHook(() => useArviVoice({ muted: true }));
    act(() => {
      result.current.playVoice('/mascot/voice/en/stu-welcome.mp3');
    });
    expect(global.Audio).not.toHaveBeenCalled();
  });

  it('stops previous clip when a new src plays', () => {
    const { result } = renderHook(() => useArviVoice({ muted: false }));
    act(() => {
      result.current.playVoice('/mascot/voice/en/a.mp3');
      result.current.playVoice('/mascot/voice/en/b.mp3');
    });
    expect(pauseMock).toHaveBeenCalled();
    expect(global.Audio).toHaveBeenCalledTimes(2);
  });
});
