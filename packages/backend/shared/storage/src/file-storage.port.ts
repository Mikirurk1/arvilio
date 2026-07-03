import type { ReadStream } from 'node:fs';

export const FILE_STORAGE_PORT = Symbol('FILE_STORAGE_PORT');

/**
 * Abstraction over file storage backends (local disk / S3-compatible).
 * Key convention: `schools/{schoolId}/{module}/{filename}` — no leading slash.
 */
export interface FileStoragePort {
  /** Write a file. Overwrites if the key already exists. */
  put(key: string, buffer: Buffer, mimeType: string): Promise<void>;

  /** Read a file's full contents. */
  getBuffer(key: string): Promise<Buffer>;

  /** Open a sequential read stream (for large file serving). */
  getReadStream(key: string): Promise<ReadStream>;

  /** Open a byte-range read stream (for video/audio seeking). */
  getReadStreamRange(key: string, start: number, end: number): ReadStream;

  /** File size in bytes. */
  getSizeBytes(key: string): Promise<number>;

  /** Delete a file. Silent if it does not exist. */
  delete(key: string): Promise<void>;

  /**
   * Return a short-lived pre-signed download URL, or `null` when the driver
   * serves files locally (caller should stream via the backend API instead).
   */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string | null>;

  /** Delete all objects whose key starts with `prefix`. Silent if none exist. */
  deleteByPrefix(prefix: string): Promise<void>;
}
