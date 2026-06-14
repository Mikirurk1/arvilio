import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type {
  CreateLibraryMaterialRequestDto,
  LibraryMaterialsPageDto,
  LibraryMaterialDto,
  UpdateLibraryMaterialRequestDto,
  UpsertLibraryMaterialAssetsRequestDto,
} from '@pkg/types';
import { MaterialAttachmentService } from './material-attachment.service';
import { MaterialsAccessService } from './materials-access.service';
import {
  decodeLibraryMaterialCursor,
  encodeLibraryMaterialCursor,
  libraryAssetRoleFromDto,
  libraryDeliveryKindFromDto,
  libraryMaterialKindFromDto,
  mapLibraryMaterialRow,
} from '../shared/materials-map.util';
import {
  isBookTitlePageRole,
} from './material-pdf-preview';

const MATERIAL_INCLUDE = {
  coverAttachment: {
    select: { id: true, fileName: true, mimeType: true },
  },
  assets: {
    include: {
      fileAttachment: {
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          previewStorageKey: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: MaterialsAccessService,
    private readonly attachments: MaterialAttachmentService,
  ) {}

  private mapRow(row: Parameters<typeof mapLibraryMaterialRow>[0]): LibraryMaterialDto {
    return mapLibraryMaterialRow(row, {
      downloadPath: (id) => this.attachments.downloadPath(id),
      previewDownloadPath: (id) => this.attachments.previewDownloadPath(id),
    });
  }

  private async ensureBookAssetPreviews(
    assets: Array<{
      role: string;
      deliveryKind: string;
      fileAttachmentId: string | null;
    }>,
  ): Promise<void> {
    for (const asset of assets) {
      if (asset.deliveryKind !== 'FILE' || !asset.fileAttachmentId) continue;
      if (!isBookTitlePageRole(asset.role)) continue;
      await this.attachments.ensurePdfTitlePagePreview(asset.fileAttachmentId);
    }
  }

  async list(
    userId: string,
    input: {
      kind?: string | null;
      search?: string | null;
      tags?: string[] | null;
      cursor?: string | null;
      take?: number | null;
    },
  ): Promise<LibraryMaterialsPageDto> {
    await this.access.assertStaff(userId);
    const take = Math.min(Math.max(input.take ?? 24, 1), 100);
    const where: {
      kind?: 'BOARD' | 'PRESENTATION' | 'BOOK' | 'OTHER';
      tags?: { hasSome: string[] };
      AND?: Array<Record<string, unknown>>;
    } = {};

    if (input.kind) {
      where.kind = libraryMaterialKindFromDto(
        input.kind as CreateLibraryMaterialRequestDto['kind'],
      );
    }
    const andClauses: Array<Record<string, unknown>> = [];
    if (input.search?.trim()) {
      const q = input.search.trim();
      andClauses.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      });
    }
    if (input.tags?.length) {
      andClauses.push({ tags: { hasSome: input.tags } });
    }
    if (input.cursor) {
      const decoded = decodeLibraryMaterialCursor(input.cursor);
      andClauses.push({
        OR: [
          { updatedAt: { lt: decoded.updatedAt } },
          { updatedAt: decoded.updatedAt, id: { lt: decoded.id } },
        ],
      });
    }
    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    const rows = await this.prisma.libraryMaterial.findMany({
      where,
      include: MATERIAL_INCLUDE,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
    });

    const hasMore = rows.length > take;
    const pageRows = hasMore ? rows.slice(0, take) : rows;
    const last = pageRows[pageRows.length - 1];

    return {
      items: pageRows.map((row) => this.mapRow(row)),
      nextCursor: hasMore && last ? encodeLibraryMaterialCursor(last) : null,
      kindCounts: await this.kindCounts(),
    };
  }

  async getById(userId: string, id: string): Promise<LibraryMaterialDto> {
    await this.access.assertStaff(userId);
    const row = await this.prisma.libraryMaterial.findUnique({
      where: { id },
      include: MATERIAL_INCLUDE,
    });
    if (!row) throw new NotFoundException('Material not found');
    return this.mapRow(row);
  }

  async create(userId: string, body: CreateLibraryMaterialRequestDto): Promise<LibraryMaterialDto> {
    await this.access.assertStaff(userId);
    const row = await this.prisma.libraryMaterial.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        kind: libraryMaterialKindFromDto(body.kind),
        tags: body.tags ?? [],
        level: body.level?.trim() || null,
        publisher: body.publisher?.trim() || null,
        schoolId: body.schoolId ?? null,
        createdById: userId,
        coverAttachmentId: body.coverAttachmentId ?? null,
        assets: body.assets?.length
          ? {
              create: body.assets.map((asset, index) => ({
                role: libraryAssetRoleFromDto(asset.role),
                deliveryKind: libraryDeliveryKindFromDto(asset.deliveryKind),
                url: asset.deliveryKind === 'url' ? asset.url?.trim() || null : null,
                fileAttachmentId:
                  asset.deliveryKind === 'file' ? asset.fileAttachmentId ?? null : null,
                label: asset.label?.trim() || null,
                sortOrder: asset.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: MATERIAL_INCLUDE,
    });

    if (body.assets?.length) {
      void this.ensureBookAssetPreviews(
        body.assets.map((asset) => ({
          role: libraryAssetRoleFromDto(asset.role),
          deliveryKind: libraryDeliveryKindFromDto(asset.deliveryKind),
          fileAttachmentId:
            asset.deliveryKind === 'file' ? asset.fileAttachmentId ?? null : null,
        })),
      ).catch((error) => {
        this.logger.warn(`Book preview generation failed: ${String(error)}`);
      });
    }

    const refreshed = await this.prisma.libraryMaterial.findUnique({
      where: { id: row.id },
      include: MATERIAL_INCLUDE,
    });
    return this.mapRow(refreshed ?? row);
  }

  async update(
    userId: string,
    id: string,
    body: UpdateLibraryMaterialRequestDto,
  ): Promise<LibraryMaterialDto> {
    await this.access.assertStaff(userId);
    const existing = await this.prisma.libraryMaterial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Material not found');

    await this.prisma.libraryMaterial.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title.trim() : undefined,
        description:
          body.description !== undefined ? body.description?.trim() || null : undefined,
        kind: body.kind !== undefined ? libraryMaterialKindFromDto(body.kind) : undefined,
        tags: body.tags !== undefined ? body.tags : undefined,
        level: body.level !== undefined ? body.level?.trim() || null : undefined,
        publisher: body.publisher !== undefined ? body.publisher?.trim() || null : undefined,
        coverAttachmentId:
          body.coverAttachmentId !== undefined ? body.coverAttachmentId ?? null : undefined,
      },
    });

    if (body.assets !== undefined) {
      await this.upsertAssets(userId, id, { assets: body.assets });
    }

    return this.getById(userId, id);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    await this.access.assertStaff(userId);
    const existing = await this.prisma.libraryMaterial.findUnique({
      where: { id },
      include: { fileAttachments: true },
    });
    if (!existing) throw new NotFoundException('Material not found');

    await this.prisma.libraryMaterial.delete({ where: { id } });
    await Promise.all(
      existing.fileAttachments.map((file) => this.attachments.removeFromDisk(file.storageKey)),
    );
    await this.attachments.removeMaterialDir(id);
    return true;
  }

  async upsertAssets(
    userId: string,
    materialId: string,
    body: UpsertLibraryMaterialAssetsRequestDto,
  ): Promise<LibraryMaterialDto> {
    await this.access.assertStaff(userId);
    const existing = await this.prisma.libraryMaterial.findUnique({ where: { id: materialId } });
    if (!existing) throw new NotFoundException('Material not found');

    for (const asset of body.assets) {
      if (asset.deliveryKind === 'url' && !asset.url?.trim()) {
        throw new BadRequestException('URL assets require a url');
      }
      if (asset.deliveryKind === 'file' && !asset.fileAttachmentId) {
        throw new BadRequestException('File assets require fileAttachmentId');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.libraryMaterialAsset.deleteMany({ where: { materialId } });
      if (body.assets.length > 0) {
        await tx.libraryMaterialAsset.createMany({
          data: body.assets.map((asset, index) => ({
            materialId,
            role: libraryAssetRoleFromDto(asset.role),
            deliveryKind: libraryDeliveryKindFromDto(asset.deliveryKind),
            url: asset.deliveryKind === 'url' ? asset.url?.trim() || null : null,
            fileAttachmentId:
              asset.deliveryKind === 'file' ? asset.fileAttachmentId ?? null : null,
            label: asset.label?.trim() || null,
            sortOrder: asset.sortOrder ?? index,
          })),
        });
      }
      await tx.libraryMaterial.update({
        where: { id: materialId },
        data: { updatedAt: new Date() },
      });
    });

    await this.ensureBookAssetPreviews(
      body.assets.map((asset) => ({
        role: libraryAssetRoleFromDto(asset.role),
        deliveryKind: libraryDeliveryKindFromDto(asset.deliveryKind),
        fileAttachmentId:
          asset.deliveryKind === 'file' ? asset.fileAttachmentId ?? null : null,
      })),
    ).catch((error) => {
      this.logger.warn(`Book preview generation failed: ${String(error)}`);
    });

    return this.getById(userId, materialId);
  }

  async kindCounts(): Promise<LibraryMaterialsPageDto['kindCounts']> {
    const grouped = await this.prisma.libraryMaterial.groupBy({
      by: ['kind'],
      _count: { _all: true },
    });
    const counts = {
      all: 0,
      board: 0,
      presentation: 0,
      book: 0,
      other: 0,
    };
    for (const row of grouped) {
      counts.all += row._count._all;
      switch (row.kind) {
        case 'BOARD':
          counts.board = row._count._all;
          break;
        case 'PRESENTATION':
          counts.presentation = row._count._all;
          break;
        case 'BOOK':
          counts.book = row._count._all;
          break;
        default:
          counts.other += row._count._all;
      }
    }
    return counts;
  }

  async findByIds(ids: string[]): Promise<LibraryMaterialDto[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.libraryMaterial.findMany({
      where: { id: { in: ids } },
      include: MATERIAL_INCLUDE,
    });
    return rows.map((row) => this.mapRow(row));
  }
}
