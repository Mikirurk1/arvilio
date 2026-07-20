import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { Logger } from '@nestjs/common';
import {
  readMaterialCompressorConfig,
  resolveMaterialCompressorTools,
  type MaterialCompressorConfig,
} from './material-file-compressor';

const execFileAsync = promisify(execFile);
const logger = new Logger('MaterialPdfPreview');

export const BOOK_TITLE_PAGE_ROLES = ['STUDENT_BOOK', 'TEACHER_BOOK', 'WORKBOOK'] as const;

export type BookTitlePageRole = (typeof BOOK_TITLE_PAGE_ROLES)[number];

export function isBookTitlePageRole(role: string): role is BookTitlePageRole {
  return (BOOK_TITLE_PAGE_ROLES as readonly string[]).includes(role);
}

export function isPdfAttachment(mimeType: string, fileName: string): boolean {
  return (
    mimeType.toLowerCase() === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')
  );
}

async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arvilio-material-preview-'));
  try {
    return await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function renderPdfFirstPageJpeg(
  pdfBuffer: Buffer,
  config: MaterialCompressorConfig = readMaterialCompressorConfig(),
): Promise<Buffer | null> {
  const tools = await resolveMaterialCompressorTools(config);
  const ghostscriptBin = tools.ghostscriptBin;
  if (!ghostscriptBin) {
    logger.warn('Ghostscript (gs) not found — cannot render PDF title page preview');
    return null;
  }

  return withTempDir(async (dir) => {
    const inputPath = path.join(dir, 'input.pdf');
    const outputPath = path.join(dir, 'preview.jpg');
    await fs.writeFile(inputPath, pdfBuffer);

    const dpi = Math.min(config.pdfImageDpi, 200);

    try {
      await execFileAsync(
        ghostscriptBin,
        [
          '-dSAFER',
          '-dBATCH',
          '-dNOPAUSE',
          '-sDEVICE=jpeg',
          '-dFirstPage=1',
          '-dLastPage=1',
          `-r${dpi}`,
          '-dJPEGQ=85',
          `-sOutputFile=${outputPath}`,
          inputPath,
        ],
        { timeout: config.commandTimeoutMs, maxBuffer: 16 * 1024 * 1024 },
      );
      return await fs.readFile(outputPath);
    } catch (error) {
      logger.warn(`PDF preview render failed: ${String(error)}`);
      return null;
    }
  });
}

export function previewStorageKeyForAttachment(
  materialId: string,
  attachmentId: string,
): string {
  return path.posix.join('library', materialId, `${attachmentId}-preview.jpg`);
}
