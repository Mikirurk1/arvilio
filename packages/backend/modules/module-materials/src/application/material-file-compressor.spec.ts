import {
  compressMaterialFile,
  readMaterialCompressorConfig,
  resolveMaterialMediaKind,
} from './material-file-compressor';
import { applyMaterialCompressLevel, parseMaterialCompressLevel } from './material-compress-level';

describe('material-file-compressor', () => {
  it('resolveMaterialMediaKind detects pdf/audio/video/image', () => {
    expect(resolveMaterialMediaKind('application/pdf', 'book.pdf')).toBe('pdf');
    expect(resolveMaterialMediaKind('audio/wav', 'clip.wav')).toBe('audio');
    expect(resolveMaterialMediaKind('video/mp4', 'lesson.mp4')).toBe('video');
    expect(resolveMaterialMediaKind('image/png', 'cover.png')).toBe('image');
    expect(resolveMaterialMediaKind('text/plain', 'notes.txt')).toBe('other');
  });

  it('returns original buffer when compression disabled', async () => {
    const buffer = Buffer.from('plain');
    const result = await compressMaterialFile(
      { buffer, mimeType: 'application/pdf', originalName: 'a.pdf' },
      { ...readMaterialCompressorConfig(), enabled: false },
      { ffmpegBin: '/usr/bin/ffmpeg', ghostscriptBin: '/usr/bin/gs' },
    );
    expect(result.codec).toBe('none');
    expect(result.buffer).toEqual(buffer);
  });

  it('off level disables compression even when globally enabled', async () => {
    const buffer = Buffer.from('%PDF-1.4');
    const result = await compressMaterialFile(
      { buffer, mimeType: 'application/pdf', originalName: 'a.pdf' },
      readMaterialCompressorConfig(),
      { ffmpegBin: null, ghostscriptBin: null },
      'off',
    );
    expect(result.codec).toBe('none');
  });

  it('strong level lowers default pdf dpi', () => {
    const base = readMaterialCompressorConfig();
    const tuned = applyMaterialCompressLevel(base, 'strong');
    expect(tuned.pdfImageDpi).toBeLessThan(base.pdfImageDpi);
    expect(tuned.pdfSettings).toBe('/screen');
  });

  it('skips pdf when ghostscript unavailable', async () => {
    const buffer = Buffer.from('%PDF-1.4');
    const result = await compressMaterialFile(
      { buffer, mimeType: 'application/pdf', originalName: 'a.pdf' },
      readMaterialCompressorConfig(),
      { ffmpegBin: null, ghostscriptBin: null },
    );
    expect(result.codec).toBe('none');
    expect(result.sizeBytes).toBe(buffer.length);
  });
});
