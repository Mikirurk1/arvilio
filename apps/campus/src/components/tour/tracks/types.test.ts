import { defaultSfxForPose } from './types';

describe('defaultSfxForPose', () => {
  it('maps common poses', () => {
    expect(defaultSfxForPose('greet')).toBe('greet');
    expect(defaultSfxForPose('point')).toBe('point');
    expect(defaultSfxForPose('celebrate')).toBe('celebrate');
    expect(defaultSfxForPose('encourage')).toBe('encourage');
    expect(defaultSfxForPose('idle')).toBe('none');
  });
});
