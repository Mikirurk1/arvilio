import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  compressMaterialFile,
  readMaterialCompressorConfig,
  resolveMaterialCompressorTools,
  type MaterialCompressResult,
  type MaterialCompressorTools,
} from './material-file-compressor';
import type { MaterialCompressLevel } from './material-compress-level';

@Injectable()
export class MaterialFileCompressorService implements OnModuleInit {
  private readonly logger = new Logger(MaterialFileCompressorService.name);
  private readonly config = readMaterialCompressorConfig();
  private toolsPromise: Promise<MaterialCompressorTools> = resolveMaterialCompressorTools(
    this.config,
  );

  onModuleInit(): void {
    void this.toolsPromise.then((tools) => {
      if (this.config.pdfEnabled && !tools.ghostscriptBin) {
        this.logger.warn(
          'Ghostscript (gs) not found — PDF uploads are stored uncompressed. Install: brew install ghostscript',
        );
      }
      if (this.config.audioEnabled && !tools.ffmpegBin) {
        this.logger.warn(
          'ffmpeg not found — audio/video material uploads are stored uncompressed.',
        );
      }
    });
  }

  async compress(file: {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
    compressLevel?: MaterialCompressLevel;
  }): Promise<MaterialCompressResult> {
    const tools = await this.toolsPromise;
    return compressMaterialFile(
      file,
      this.config,
      tools,
      file.compressLevel,
    );
  }
}
