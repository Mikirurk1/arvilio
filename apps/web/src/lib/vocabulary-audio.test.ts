import { normalizeAudioUrl, playWordAudio } from './vocabulary-audio';

describe('vocabulary-audio', () => {
  it('normalizeAudioUrl handles protocol-relative and absolute URLs', () => {
    expect(normalizeAudioUrl('//cdn.example/audio.mp3')).toBe('https://cdn.example/audio.mp3');
    expect(normalizeAudioUrl('https://cdn.example/audio.mp3')).toBe(
      'https://cdn.example/audio.mp3',
    );
    expect(normalizeAudioUrl('http://cdn.example/audio.mp3')).toBe(
      'http://cdn.example/audio.mp3',
    );
  });

  it('normalizeAudioUrl rejects empty or non-http values', () => {
    expect(normalizeAudioUrl(null)).toBeNull();
    expect(normalizeAudioUrl('  ')).toBeNull();
    expect(normalizeAudioUrl('/relative/path.mp3')).toBeNull();
  });

  it('playWordAudio skips invalid URLs', () => {
    const AudioCtor = jest.fn().mockImplementation(() => ({
      pause: jest.fn(),
      play: jest.fn().mockResolvedValue(undefined),
      onended: null,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Audio = AudioCtor;

    playWordAudio('/not-a-url');
    expect(AudioCtor).not.toHaveBeenCalled();
  });

  it('playWordAudio creates Audio for normalized URL', () => {
    const play = jest.fn().mockResolvedValue(undefined);
    const pause = jest.fn();
    const AudioCtor = jest.fn().mockImplementation(() => ({
      pause,
      play,
      onended: null,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Audio = AudioCtor;

    playWordAudio('//cdn.example/word.mp3');
    expect(AudioCtor).toHaveBeenCalledWith('https://cdn.example/word.mp3');
    expect(play).toHaveBeenCalled();
  });

  it('playWordAudio pauses previous audio instance', () => {
    const pause = jest.fn();
    const play = jest.fn().mockResolvedValue(undefined);
    const AudioCtor = jest.fn().mockImplementation(() => ({
      pause,
      play,
      onended: null,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Audio = AudioCtor;

    playWordAudio('https://cdn.example/a.mp3');
    playWordAudio('https://cdn.example/b.mp3');
    expect(pause).toHaveBeenCalled();
    expect(AudioCtor).toHaveBeenCalledTimes(2);
  });

  it('playWordAudio clears active audio when play fails', async () => {
    const play = jest.fn().mockRejectedValue(new Error('blocked'));
    const AudioCtor = jest.fn().mockImplementation(() => ({
      pause: jest.fn(),
      play,
      onended: null,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Audio = AudioCtor;

    playWordAudio('https://cdn.example/word.mp3');
    await Promise.resolve();
    playWordAudio('https://cdn.example/word2.mp3');
    expect(AudioCtor).toHaveBeenCalledTimes(2);
  });
});
