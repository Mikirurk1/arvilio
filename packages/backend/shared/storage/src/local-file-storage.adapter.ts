import * as fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import * as path from 'node:path';
import type { ReadStream } from 'node:fs';
import type { FileStoragePort } from './file-storage.port';

/**
 * Local-disk driver — identical behaviour to the original attachment services.
 * Used in development and single-server deployments. Not tenant-isolated at the
 * OS level; isolation is enforced by the key prefix (`schools/{schoolId}/…`).
 */
export class LocalFileStorageAdapter implements FileStoragePort {
  constructor(private readonly rootDir: string) {}

  private resolve(key: string): string {
    if (!key || key.includes('..')) throw new Error(`Invalid storage key: ${key}`);
    const full = path.resolve(this.rootDir, key);
    if (!full.startsWith(path.resolve(this.rootDir))) {
      throw new Error(`Storage key escapes root: ${key}`);
    }
    return full;
  }

  async put(key: string, buffer: Buffer): Promise<void> {
    const full = this.resolve(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, buffer);
  }

  async getBuffer(key: string): Promise<Buffer> {
    return fs.readFile(this.resolve(key));
  }

  async getReadStream(key: string): Promise<ReadStream> {
    await fs.access(this.resolve(key));
    return createReadStream(this.resolve(key));
  }

  getReadStreamRange(key: string, start: number, end: number): ReadStream {
    return createReadStream(this.resolve(key), { start, end });
  }

  async getSizeBytes(key: string): Promise<number> {
    const stat = await fs.stat(this.resolve(key));
    return stat.size;
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolve(key));
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
  }

  async getSignedUrl(): Promise<null> {
    return null; // local driver: caller must stream via backend API
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    try {
      await fs.rm(this.resolve(prefix), { recursive: true, force: true });
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
  }
}
