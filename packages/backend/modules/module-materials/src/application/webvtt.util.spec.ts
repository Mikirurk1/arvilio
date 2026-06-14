import { buildWebVtt } from './webvtt.util';

describe('buildWebVtt', () => {
  it('builds valid webvtt from segments', () => {
    const vtt = buildWebVtt([
      { startSec: 0, endSec: 1.5, text: 'Hello' },
      { startSec: 2, endSec: 4, text: 'World' },
    ]);
    expect(vtt.startsWith('WEBVTT')).toBe(true);
    expect(vtt).toContain('Hello');
    expect(vtt).toContain('00:00:00.000 --> 00:00:01.500');
  });
});
