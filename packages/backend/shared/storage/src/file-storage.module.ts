import * as path from 'node:path';
import { Global, Module } from '@nestjs/common';
import { FILE_STORAGE_PORT } from './file-storage.port';
import { LocalFileStorageAdapter } from './local-file-storage.adapter';
import { S3FileStorageAdapter } from './s3-file-storage.adapter';

function createStorageAdapter() {
  const driver = (process.env['STORAGE_DRIVER'] ?? 'local').toLowerCase();

  if (driver === 's3') {
    const region = process.env['S3_REGION'];
    const bucket = process.env['S3_BUCKET'];
    const accessKeyId = process.env['S3_ACCESS_KEY_ID'];
    const secretAccessKey = process.env['S3_SECRET_ACCESS_KEY'];
    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'STORAGE_DRIVER=s3 requires S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY',
      );
    }
    return new S3FileStorageAdapter({
      region,
      bucket,
      accessKeyId,
      secretAccessKey,
      endpoint: process.env['S3_ENDPOINT'] || undefined,
      keyPrefix: process.env['S3_KEY_PREFIX'] || undefined,
    });
  }

  // Default: local disk. UPLOAD_ROOT supersedes legacy per-module dirs.
  const root =
    process.env['UPLOAD_ROOT'] ??
    process.env['MATERIAL_UPLOAD_DIR'] ??
    path.join(process.cwd(), 'data', 'uploads');
  return new LocalFileStorageAdapter(root);
}

/**
 * Global file-storage abstraction (G6). Provides `FILE_STORAGE_PORT` backed by
 * the local disk (`STORAGE_DRIVER=local`, default) or S3-compatible object
 * storage (`STORAGE_DRIVER=s3`). Inject via `@Inject(FILE_STORAGE_PORT)`.
 */
@Global()
@Module({
  providers: [
    {
      provide: FILE_STORAGE_PORT,
      useFactory: createStorageAdapter,
    },
  ],
  exports: [FILE_STORAGE_PORT],
})
export class FileStorageModule {}
