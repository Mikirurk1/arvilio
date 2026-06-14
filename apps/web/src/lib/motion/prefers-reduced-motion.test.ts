import {
  motionDurationMs,
  prefersReducedMotion,
  REDUCED_MOTION_QUERY,
  subscribeReducedMotion,
} from './prefers-reduced-motion';

describe('prefers-reduced-motion', () => {
  it('REDUCED_MOTION_QUERY matches spec', () => {
    expect(REDUCED_MOTION_QUERY).toBe('(prefers-reduced-motion: reduce)');
  });

  it('prefersReducedMotion reads matchMedia', () => {
    const matchMedia = jest.fn().mockReturnValue({ matches: true });
    Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMedia });
    expect(prefersReducedMotion()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
  });

  it('motionDurationMs short-circuits when reduced', () => {
    const matchMedia = jest.fn().mockReturnValue({ matches: true });
    Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMedia });
    expect(motionDurationMs(300)).toBe(0);
    expect(motionDurationMs(300, 50)).toBe(50);
  });

  it('subscribeReducedMotion notifies and cleans up', () => {
    const listeners: Array<() => void> = [];
    const mq = {
      matches: false,
      addEventListener: (_: string, fn: () => void) => listeners.push(fn),
      removeEventListener: (_: string, fn: () => void) => {
        const i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      },
    };
    const matchMedia = jest.fn().mockReturnValue(mq);
    Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMedia });

    const values: boolean[] = [];
    const unsub = subscribeReducedMotion((reduced) => values.push(reduced));
    expect(values).toEqual([false]);

    mq.matches = true;
    listeners.forEach((fn) => fn());
    expect(values).toEqual([false, true]);

    unsub();
    mq.matches = false;
    listeners.forEach((fn) => fn());
    expect(values).toEqual([false, true]);
  });
});
