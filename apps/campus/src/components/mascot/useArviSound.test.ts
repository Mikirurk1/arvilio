/**
 * @jest-environment jsdom
 */
import { ARVI_SFX_MUTE_KEY } from '../mascot/useArviSound';

describe('ARVI_SFX_MUTE_KEY', () => {
  it('uses stable localStorage key from TZ', () => {
    expect(ARVI_SFX_MUTE_KEY).toBe('arvi.sfxMuted');
  });
});

describe('SFX asset paths', () => {
  const ids = ['greet', 'point', 'click', 'celebrate', 'encourage', 'wave'] as const;

  it('stubs exist under public/mascot/sfx', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const dir = path.join(process.cwd(), 'apps/campus/public/mascot/sfx');
    for (const id of ids) {
      expect(fs.existsSync(path.join(dir, `${id}.wav`))).toBe(true);
    }
  });
});
