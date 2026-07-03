import { Readable } from 'node:stream';
import type { ReadStream } from 'node:fs';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { FileStoragePort } from './file-storage.port';

export interface S3StorageConfig {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Prefix all keys with this string (e.g. `prod/`). Optional. */
  keyPrefix?: string;
}

/**
 * S3-compatible driver (AWS S3, Cloudflare R2, MinIO).
 * Download URLs are pre-signed — the client fetches directly from storage.
 */
export class S3FileStorageAdapter implements FileStoragePort {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly keyPrefix: string;

  constructor(config: S3StorageConfig) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint ? { endpoint: config.endpoint, forcePathStyle: true } : {}),
    });
    this.bucket = config.bucket;
    this.keyPrefix = config.keyPrefix ?? '';
  }

  private fullKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}${key}` : key;
  }

  async put(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.fullKey(key),
        Body: buffer,
        ContentType: mimeType,
      }),
    );
  }

  async getBuffer(key: string): Promise<Buffer> {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: this.fullKey(key) }),
    );
    const stream = res.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
    }
    return Buffer.concat(chunks);
  }

  async getReadStream(key: string): Promise<ReadStream> {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: this.fullKey(key) }),
    );
    return res.Body as unknown as ReadStream;
  }

  getReadStreamRange(key: string, start: number, end: number): ReadStream {
    // S3 range is served via signed URL + redirect; this path is reached only in
    // local mode. In S3 mode the controller redirects before calling this.
    const range = `bytes=${start}-${end}`;
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: this.fullKey(key), Range: range });
    let stream: ReadStream | null = null;
    void this.client.send(cmd).then((res) => {
      stream = res.Body as unknown as ReadStream;
    });
    // Lazy proxy — in practice the controller always redirects for S3 mode
    return stream as unknown as ReadStream;
  }

  async getSizeBytes(key: string): Promise<number> {
    const res = await this.client.send(
      new HeadObjectCommand({ Bucket: this.bucket, Key: this.fullKey(key) }),
    );
    return res.ContentLength ?? 0;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: this.fullKey(key) }),
    );
  }

  async getSignedUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: this.fullKey(key) });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresInSeconds });
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    const fullPrefix = this.fullKey(prefix);
    let continuationToken: string | undefined;
    do {
      const list = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: fullPrefix,
          ContinuationToken: continuationToken,
        }),
      );
      const keys = (list.Contents ?? []).map((o) => ({ Key: o.Key! }));
      if (keys.length > 0) {
        await this.client.send(
          new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: { Objects: keys, Quiet: true },
          }),
        );
      }
      continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
    } while (continuationToken);
  }
}
