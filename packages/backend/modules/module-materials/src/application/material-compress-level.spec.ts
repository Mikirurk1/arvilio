import {
  applyMaterialCompressLevel,
  parseMaterialCompressLevel,
} from './material-compress-level';
import { readMaterialCompressorConfig } from './material-file-compressor';

describe('material-compress-level', () => {
  it('defaults unknown values to balanced', () => {
    expect(parseMaterialCompressLevel(undefined)).toBe('balanced');
    expect(parseMaterialCompressLevel('nope')).toBe('balanced');
  });

  it('off disables compression', () => {
    const tuned = applyMaterialCompressLevel(readMaterialCompressorConfig(), 'off');
    expect(tuned.enabled).toBe(false);
  });

  it('strong uses screen profile and lower dpi', () => {
    const tuned = applyMaterialCompressLevel(readMaterialCompressorConfig(), 'strong');
    expect(tuned.pdfSettings).toBe('/screen');
    expect(tuned.pdfImageDpi).toBe(96);
  });

  it('light uses printer profile and higher dpi', () => {
    const tuned = applyMaterialCompressLevel(readMaterialCompressorConfig(), 'light');
    expect(tuned.pdfSettings).toBe('/printer');
    expect(tuned.pdfImageDpi).toBe(200);
  });
});
