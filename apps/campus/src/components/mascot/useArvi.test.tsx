'use client';

/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ArviProvider, useArvi } from './useArvi';
import { ARVI_REACTION_MS } from '../../lib/mascot-capability';

function wrapper({ children }: { children: ReactNode }) {
  return <ArviProvider>{children}</ArviProvider>;
}

describe('useArvi', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts idle and setPose sticks', () => {
    const { result } = renderHook(() => useArvi(), { wrapper });
    expect(result.current.pose).toBe('idle');
    act(() => result.current.setPose('greet'));
    expect(result.current.pose).toBe('greet');
  });

  it('celebrate auto-returns to idle', () => {
    const { result } = renderHook(() => useArvi(), { wrapper });
    act(() => result.current.celebrate());
    expect(result.current.pose).toBe('celebrate');
    act(() => {
      jest.advanceTimersByTime(ARVI_REACTION_MS);
    });
    expect(result.current.pose).toBe('idle');
  });

  it('encourage / wave / think helpers set pose', () => {
    const { result } = renderHook(() => useArvi(), { wrapper });
    act(() => result.current.encourage());
    expect(result.current.pose).toBe('encourage');
    act(() => result.current.wave(0));
    expect(result.current.pose).toBe('wave');
    act(() => result.current.think(0));
    expect(result.current.pose).toBe('think');
  });

  it('noop outside provider', () => {
    const { result } = renderHook(() => useArvi());
    expect(result.current.pose).toBe('idle');
    act(() => result.current.celebrate());
    expect(result.current.pose).toBe('idle');
  });
});
