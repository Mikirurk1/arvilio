export type ParsedByteRange = {
  start: number;
  end: number;
};

export function parseBytesRangeHeader(
  rangeHeader: string | undefined,
  fileSize: number,
): ParsedByteRange | null {
  if (!rangeHeader?.startsWith('bytes=') || fileSize <= 0) return null;

  const [startPart, endPart] = rangeHeader.slice('bytes='.length).split('-', 2);
  if (startPart === '' && endPart === '') return null;

  let start = startPart ? Number.parseInt(startPart, 10) : NaN;
  let end = endPart ? Number.parseInt(endPart, 10) : NaN;

  if (startPart === '' && Number.isFinite(end)) {
    const suffixLength = end;
    start = Math.max(fileSize - suffixLength, 0);
    end = fileSize - 1;
  } else if (!Number.isFinite(start)) {
    return null;
  } else if (!Number.isFinite(end)) {
    end = fileSize - 1;
  }

  if (start < 0 || end < start || start >= fileSize) return null;
  end = Math.min(end, fileSize - 1);

  return { start, end };
}
