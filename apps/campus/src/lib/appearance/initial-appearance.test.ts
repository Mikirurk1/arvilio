import { resolveInitialAppearance } from './initial-appearance';

describe('initial-appearance', () => {
  it('resolves dark theme from persisted zustand state', () => {
    expect(
      resolveInitialAppearance(
        {
          state: { theme: 'dark', fontSize: 'large' },
        },
        false,
      ),
    ).toEqual({ theme: 'dark', fontSize: 'large' });
  });

  it('resolves auto theme from system preference', () => {
    expect(
      resolveInitialAppearance(
        {
          state: { theme: 'auto', fontSize: 'medium' },
        },
        true,
      ),
    ).toEqual({ theme: 'dark', fontSize: 'medium' });
  });

  it('falls back for invalid persisted values', () => {
    expect(
      resolveInitialAppearance(
        {
          state: { theme: 'unknown', fontSize: 'huge' },
        },
        false,
      ),
    ).toEqual({ theme: 'light', fontSize: 'medium' });
  });
});
