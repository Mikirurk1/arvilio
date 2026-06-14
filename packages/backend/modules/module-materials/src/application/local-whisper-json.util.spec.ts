import { segmentsFromLocalWhisperJson } from './local-whisper-json.util';

describe('segmentsFromLocalWhisperJson', () => {
  it('parses whisper.cpp transcription offsets (ms)', () => {
    const { language, segments } = segmentsFromLocalWhisperJson({
      result: { language: 'en' },
      transcription: [
        {
          text: ' Hello',
          offsets: { from: 0, to: 1500 },
        },
        {
          text: ' world',
          offsets: { from: 1500, to: 2800 },
        },
      ],
    });

    expect(language).toBe('en');
    expect(segments).toEqual([
      { startSec: 0, endSec: 1.5, text: 'Hello' },
      { startSec: 1.5, endSec: 2.8, text: 'world' },
    ]);
  });
});
