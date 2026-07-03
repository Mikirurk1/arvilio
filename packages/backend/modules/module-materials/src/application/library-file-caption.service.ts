import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';
import { TranslationService } from '@be/vocabulary';
import { EntitlementsService } from '@be/billing';
import { TenantContextService } from '@be/tenant';
import type {
  LibraryCaptionTrackDto,
  LibraryFileCaptionsResponseDto,
  MaterialAttachmentMetaDto,
  MaterialSttProviderId,
} from '@pkg/types';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { MaterialsAccessService } from './materials-access.service';
import { MaterialAttachmentService } from './material-attachment.service';
import {
  mapAssetRoleFromPrisma,
  resolveMaterialViewerMediaKind,
} from './material-viewer-meta.util';
import {
  buildWebVtt,
  captionLanguageLabel,
  segmentsFromWhisperResponse,
  type SttSegment,
} from './webvtt.util';
import { transcribeWithOpenAiWhisper } from '../infrastructure/whisper-stt.client';
import { transcribeWithLocalWhisper } from '../infrastructure/local-whisper-stt.client';
import { readMaterialCompressorConfig, resolveMaterialCompressorTools } from './material-file-compressor';
import {
  readLocalWhisperConfig,
  resolveLocalWhisperTools,
} from './whisper-local.config';

const execFileAsync = promisify(execFile);

@Injectable()
export class LibraryFileCaptionService {
  private readonly logger = new Logger(LibraryFileCaptionService.name);
  private readonly pending = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: MaterialsAccessService,
    @Inject(forwardRef(() => MaterialAttachmentService))
    private readonly attachments: MaterialAttachmentService,
    private readonly translation: TranslationService,
    private readonly entitlements: EntitlementsService,
    private readonly tenant: TenantContextService,
  ) {}

  async getAttachmentMeta(userId: string, attachmentId: string): Promise<MaterialAttachmentMetaDto> {
    const row = await this.prisma.libraryFileAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        materialId: true,
        assets: {
          select: { role: true },
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!row) throw new NotFoundException('Attachment not found');
    await this.access.assertCanDownloadMaterial(userId, row.materialId);

    const prismaRole = row.assets[0]?.role ?? null;
    const assetRole = mapAssetRoleFromPrisma(prismaRole?.toLowerCase());

    return {
      fileAttachmentId: row.id,
      fileName: row.fileName,
      mimeType: row.mimeType,
      mediaKind: resolveMaterialViewerMediaKind(row.mimeType, assetRole),
      assetRole,
    };
  }

  async listCaptions(userId: string, attachmentId: string): Promise<LibraryFileCaptionsResponseDto> {
    const meta = await this.attachments.assertDownloadable(attachmentId);
    await this.access.assertCanDownloadMaterial(userId, meta.materialId);

    const rows = await this.prisma.libraryFileCaptionTrack.findMany({
      where: { fileAttachmentId: attachmentId },
      orderBy: [{ kind: 'asc' }, { language: 'asc' }],
    });

    return {
      tracks: rows.map((row) => this.toTrackDto(row)),
    };
  }

  async openCaptionVtt(userId: string, attachmentId: string, language: string): Promise<{
    vtt: string;
    fileName: string;
  }> {
    const meta = await this.attachments.assertDownloadable(attachmentId);
    await this.access.assertCanDownloadMaterial(userId, meta.materialId);

    const row = await this.prisma.libraryFileCaptionTrack.findFirst({
      where: {
        fileAttachmentId: attachmentId,
        language: language.trim().toLowerCase(),
        status: 'READY',
      },
    });
    if (!row?.vttStorageKey) {
      throw new NotFoundException('Caption track not found');
    }

    const vtt = (await this.attachments.readFileBuffer(row.vttStorageKey)).toString('utf8');
    return {
      vtt,
      fileName: `${path.parse(meta.fileName).name}.${language}.vtt`,
    };
  }

  enqueueForAttachment(attachmentId: string): void {
    if (this.pending.has(attachmentId)) return;
    this.pending.add(attachmentId);
    void this.generateCaptions(attachmentId)
      .catch((error) => {
        this.logger.warn(`Caption generation failed for ${attachmentId}: ${String(error)}`);
      })
      .finally(() => {
        this.pending.delete(attachmentId);
      });
  }

  async triggerGeneration(userId: string, attachmentId: string): Promise<LibraryFileCaptionsResponseDto> {
    await this.access.assertStaff(userId);
    const meta = await this.attachments.assertDownloadable(attachmentId);
    const mediaKind = resolveMaterialViewerMediaKind(meta.mimeType, null);
    if (mediaKind !== 'audio' && mediaKind !== 'video') {
      throw new NotFoundException('Captions are only supported for audio and video files');
    }

    const runtime = getPlatformIntegrationRuntime();
    const config = runtime.mediaCaptions;
    if (!config.enabled || config.sttProvider === 'disabled') {
      throw new BadRequestException(
        'Media captions are disabled. Enable them in System → Word dictionary → Media captions.',
      );
    }
    await this.assertSttProviderReady(config.sttProvider, runtime.mediaCaptions.openaiWhisperApiKey);

    const schoolId = this.tenant.schoolId;
    if (schoolId) {
      await this.entitlements.assertAiCredit(schoolId);
    }

    this.enqueueForAttachment(attachmentId);

    if (schoolId) {
      await this.entitlements.consumeAiCredit(schoolId);
    }

    return this.listCaptions(userId, attachmentId);
  }

  private async assertSttProviderReady(
    sttProvider: MaterialSttProviderId,
    openaiWhisperApiKey: string | null,
  ): Promise<void> {
    if (sttProvider === 'openai_whisper') {
      if (!openaiWhisperApiKey) {
        throw new BadRequestException(
          'OpenAI Whisper API key is not configured. Add it in System → Word dictionary → Media captions, or switch to Local Whisper.',
        );
      }
      return;
    }

    if (sttProvider === 'local_whisper') {
      const tools = await resolveLocalWhisperTools();
      if (!tools.whisperBin || !tools.modelPath || !tools.ffmpegBin) {
        throw new BadRequestException(
          'Local Whisper is not ready. Install whisper.cpp (`brew install whisper-cpp`), download a ggml model, set MATERIAL_WHISPER_MODEL in .env, and ensure ffmpeg is available.',
        );
      }
    }
  }

  private async generateCaptions(attachmentId: string): Promise<void> {
    const runtime = getPlatformIntegrationRuntime();
    const config = runtime.mediaCaptions;
    if (!config.enabled || config.sttProvider === 'disabled') {
      return;
    }

    const attachment = await this.prisma.libraryFileAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        materialId: true,
        fileName: true,
        mimeType: true,
        storageKey: true,
      },
    });
    if (!attachment) return;

    const mediaKind = resolveMaterialViewerMediaKind(attachment.mimeType, null);
    if (mediaKind !== 'audio' && mediaKind !== 'video') return;

    try {
      await this.assertSttProviderReady(
        config.sttProvider,
        runtime.mediaCaptions.openaiWhisperApiKey,
      );
    } catch (error) {
      this.logger.warn(
        `Skipping caption generation for ${attachmentId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return;
    }

    await this.upsertTrack(attachmentId, config.sourceLanguage ?? 'auto', 'SOURCE', {
      status: 'PROCESSING',
      errorMessage: null,
    });

    try {
      const audio = await this.prepareAudioForStt(attachment.storageKey, attachment.fileName, attachment.mimeType);
      const whisper = await this.transcribeMedia(config.sttProvider, runtime, audio, config.sourceLanguage);
      const { language, segments } = segmentsFromWhisperResponse(whisper);
      if (segments.length === 0) {
        throw new Error('No speech detected in media file');
      }

      const sourceLanguage = (language ?? config.sourceLanguage ?? 'en').toLowerCase();
      const sourceVttKey = this.vttStorageKey(attachment.materialId, attachmentId, sourceLanguage, 'source');
      await this.attachments.saveToDisk(Buffer.from(buildWebVtt(segments), 'utf8'), sourceVttKey);

      const sourceTrack = await this.upsertTrack(attachmentId, sourceLanguage, 'SOURCE', {
        status: 'READY',
        vttStorageKey: sourceVttKey,
        errorMessage: null,
      });

      await this.prisma.libraryFileCaptionTrack.deleteMany({
        where: {
          fileAttachmentId: attachmentId,
          kind: 'SOURCE',
          language: 'und',
          NOT: { id: sourceTrack.id },
        },
      });

      const targets = config.targetLanguages
        .map((code) => code.trim().toLowerCase())
        .filter((code) => code && code !== sourceLanguage);

      for (const targetLang of targets) {
        await this.upsertTrack(attachmentId, targetLang, 'TRANSLATION', {
          status: 'PROCESSING',
          sourceTrackId: sourceTrack.id,
          errorMessage: null,
        });
        try {
          const translated = await this.translateSegments(segments, sourceLanguage, targetLang);
          const vttKey = this.vttStorageKey(attachment.materialId, attachmentId, targetLang, 'translation');
          await this.attachments.saveToDisk(Buffer.from(buildWebVtt(translated), 'utf8'), vttKey);
          await this.upsertTrack(attachmentId, targetLang, 'TRANSLATION', {
            status: 'READY',
            vttStorageKey: vttKey,
            sourceTrackId: sourceTrack.id,
            errorMessage: null,
          });
        } catch (error) {
          await this.upsertTrack(attachmentId, targetLang, 'TRANSLATION', {
            status: 'FAILED',
            sourceTrackId: sourceTrack.id,
            errorMessage: error instanceof Error ? error.message : 'Translation failed',
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Caption generation failed';
      await this.upsertTrack(attachmentId, config.sourceLanguage ?? 'auto', 'SOURCE', {
        status: 'FAILED',
        errorMessage: message,
      });
      throw error;
    }
  }

  private async transcribeMedia(
    sttProvider: MaterialSttProviderId,
    runtime: ReturnType<typeof getPlatformIntegrationRuntime>,
    audio: { buffer: Buffer; fileName: string; mimeType: string },
    sourceLanguage: string | null,
  ) {
    if (sttProvider === 'local_whisper') {
      const localConfig = readLocalWhisperConfig();
      const tools = await resolveLocalWhisperTools(localConfig);
      if (!tools.whisperBin || !tools.modelPath || !tools.ffmpegBin) {
        throw new Error('Local Whisper is not configured');
      }
      return transcribeWithLocalWhisper({
        whisperBin: tools.whisperBin,
        modelPath: tools.modelPath,
        ffmpegBin: tools.ffmpegBin,
        audioBuffer: audio.buffer,
        fileName: audio.fileName,
        mimeType: audio.mimeType,
        language: sourceLanguage,
        timeoutMs: localConfig.commandTimeoutMs,
      });
    }

    const apiKey = runtime.mediaCaptions.openaiWhisperApiKey;
    if (!apiKey) {
      throw new Error('OpenAI Whisper API key is missing');
    }
    return transcribeWithOpenAiWhisper({
      apiKey,
      audioBuffer: audio.buffer,
      fileName: audio.fileName,
      mimeType: audio.mimeType,
      language: sourceLanguage,
    });
  }

  private async translateSegments(
    segments: SttSegment[],
    from: string,
    to: string,
  ): Promise<SttSegment[]> {
    const out: SttSegment[] = [];
    for (const segment of segments) {
      const translated = await this.translation.translate(segment.text, from, to);
      out.push({
        ...segment,
        text: translated ?? segment.text,
      });
    }
    return out;
  }

  private async prepareAudioForStt(
    storageKey: string,
    fileName: string,
    mimeType: string,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const buffer = await this.attachments.readFileBuffer(storageKey);
    if (mimeType.startsWith('audio/')) {
      return { buffer, fileName, mimeType };
    }

    const config = readMaterialCompressorConfig();
    const tools = await resolveMaterialCompressorTools(config);
    if (!tools.ffmpegBin) {
      throw new Error('ffmpeg is required to extract audio from video for captions');
    }

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'soenglish-captions-'));
    const inputPath = path.join(tempDir, fileName.replace(/[^\w.\-()\s]/g, '_') || 'input.mp4');
    const outputPath = path.join(tempDir, 'audio.mp3');
    await fs.writeFile(inputPath, buffer);

    try {
      await execFileAsync(
        tools.ffmpegBin,
        ['-y', '-i', inputPath, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '64k', outputPath],
        { timeout: config.commandTimeoutMs },
      );
      const audioBuffer = await fs.readFile(outputPath);
      return { buffer: audioBuffer, fileName: 'audio.mp3', mimeType: 'audio/mpeg' };
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  private vttStorageKey(
    materialId: string,
    attachmentId: string,
    language: string,
    kind: 'source' | 'translation',
  ): string {
    return path.posix.join('library', materialId, 'captions', attachmentId, `${language}.${kind}.vtt`);
  }

  private async upsertTrack(
    fileAttachmentId: string,
    language: string,
    kind: 'SOURCE' | 'TRANSLATION',
    data: {
      status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
      vttStorageKey?: string | null;
      sourceTrackId?: string | null;
      errorMessage?: string | null;
    },
  ) {
    const normalizedLanguage = language === 'auto' ? 'und' : language.trim().toLowerCase();
    return this.prisma.libraryFileCaptionTrack.upsert({
      where: {
        fileAttachmentId_language_kind: {
          fileAttachmentId,
          language: normalizedLanguage,
          kind,
        },
      },
      create: {
        fileAttachmentId,
        language: normalizedLanguage,
        kind,
        status: data.status,
        vttStorageKey: data.vttStorageKey ?? null,
        sourceTrackId: data.sourceTrackId ?? null,
        errorMessage: data.errorMessage ?? null,
      },
      update: {
        status: data.status,
        vttStorageKey: data.vttStorageKey ?? undefined,
        sourceTrackId: data.sourceTrackId ?? undefined,
        errorMessage: data.errorMessage ?? null,
      },
    });
  }

  private toTrackDto(row: {
    id: string;
    language: string;
    kind: 'SOURCE' | 'TRANSLATION';
    status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
    errorMessage: string | null;
  }): LibraryCaptionTrackDto {
    const kind = row.kind === 'SOURCE' ? 'source' : 'translation';
    const labelBase = captionLanguageLabel(row.language === 'und' ? 'unknown' : row.language);
    return {
      id: row.id,
      language: row.language,
      kind,
      status: row.status.toLowerCase() as LibraryCaptionTrackDto['status'],
      label: kind === 'source' ? `${labelBase} (original)` : labelBase,
      errorMessage: row.errorMessage,
    };
  }
}
