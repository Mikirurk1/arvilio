import { parseBytesRangeHeader } from './material-byte-range.util';

describe('parseBytesRangeHeader', () => {
  it('parses open-ended range', () => {
    expect(parseBytesRangeHeader('bytes=0-', 1000)).toEqual({ start: 0, end: 999 });
    expect(parseBytesRangeHeader('bytes=500-', 1000)).toEqual({ start: 500, end: 999 });
  });

  it('parses closed range', () => {
    expect(parseBytesRangeHeader('bytes=100-199', 1000)).toEqual({ start: 100, end: 199 });
  });

  it('parses suffix range', () => {
    expect(parseBytesRangeHeader('bytes=-500', 1000)).toEqual({ start: 500, end: 999 });
  });

  it('rejects invalid ranges', () => {
    expect(parseBytesRangeHeader(undefined, 100)).toBeNull();
    expect(parseBytesRangeHeader('bytes=1000-', 100)).toBeNull();
  });
});
