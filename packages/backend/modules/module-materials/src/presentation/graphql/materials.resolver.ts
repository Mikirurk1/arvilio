import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard } from '@be/auth';
import type {
  CreateLibraryMaterialRequestDto,
  UpdateLibraryMaterialRequestDto,
  UpsertLibraryMaterialAssetsRequestDto,
} from '@pkg/types';
import {
  CreateLibraryMaterialInput,
  LibraryMaterialPageType,
  LibraryMaterialType,
  LibraryMaterialsQueryInput,
  UpdateLibraryMaterialInput,
  UpsertLibraryMaterialAssetsInput,
} from '@be/graphql';
import { MaterialsService } from '../../application/materials.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class MaterialsResolver {
  constructor(private readonly materials: MaterialsService) {}

  @Query(() => LibraryMaterialPageType, { name: 'libraryMaterials' })
  libraryMaterials(
    @CurrentGqlUser() userId: string,
    @Args('input', { nullable: true }) input?: LibraryMaterialsQueryInput,
  ) {
    return this.materials.list(userId, {
      kind: input?.kind ?? null,
      search: input?.search ?? null,
      tags: input?.tags ?? null,
      cursor: input?.cursor ?? null,
      take: input?.take ?? null,
    });
  }

  @Query(() => LibraryMaterialType, { name: 'libraryMaterial' })
  libraryMaterial(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.materials.getById(userId, id);
  }

  @Mutation(() => LibraryMaterialType, { name: 'createLibraryMaterial' })
  createLibraryMaterial(
    @CurrentGqlUser() userId: string,
    @Args('input') input: CreateLibraryMaterialInput,
  ) {
    const body: CreateLibraryMaterialRequestDto = {
      title: input.title,
      description: input.description ?? undefined,
      kind: input.kind as CreateLibraryMaterialRequestDto['kind'],
      tags: input.tags ?? undefined,
      level: input.level ?? undefined,
      publisher: input.publisher ?? undefined,
      schoolId: input.schoolId ?? undefined,
      coverAttachmentId: input.coverAttachmentId ?? undefined,
      assets: input.assets?.map((asset) => ({
        role: asset.role as CreateLibraryMaterialRequestDto['assets'][number]['role'],
        deliveryKind: asset.deliveryKind as 'url' | 'file',
        url: asset.url ?? undefined,
        fileAttachmentId: asset.fileAttachmentId ?? undefined,
        label: asset.label ?? undefined,
        sortOrder: asset.sortOrder ?? undefined,
      })),
    };
    return this.materials.create(userId, body);
  }

  @Mutation(() => LibraryMaterialType, { name: 'updateLibraryMaterial' })
  updateLibraryMaterial(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLibraryMaterialInput,
  ) {
    const body: UpdateLibraryMaterialRequestDto = {
      title: input.title ?? undefined,
      description: input.description ?? undefined,
      kind: input.kind as UpdateLibraryMaterialRequestDto['kind'],
      tags: input.tags ?? undefined,
      level: input.level ?? undefined,
      publisher: input.publisher ?? undefined,
      coverAttachmentId: input.coverAttachmentId ?? undefined,
      assets: input.assets?.map((asset) => ({
        role: asset.role as UpsertLibraryMaterialAssetsRequestDto['assets'][number]['role'],
        deliveryKind: asset.deliveryKind as 'url' | 'file',
        url: asset.url ?? undefined,
        fileAttachmentId: asset.fileAttachmentId ?? undefined,
        label: asset.label ?? undefined,
        sortOrder: asset.sortOrder ?? undefined,
      })),
    };
    return this.materials.update(userId, id, body);
  }

  @Mutation(() => Boolean, { name: 'deleteLibraryMaterial' })
  deleteLibraryMaterial(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.materials.delete(userId, id);
  }

  @Mutation(() => LibraryMaterialType, { name: 'upsertLibraryMaterialAssets' })
  upsertLibraryMaterialAssets(
    @CurrentGqlUser() userId: string,
    @Args('materialId', { type: () => ID }) materialId: string,
    @Args('input') input: UpsertLibraryMaterialAssetsInput,
  ) {
    const body: UpsertLibraryMaterialAssetsRequestDto = {
      assets: input.assets.map((asset) => ({
        role: asset.role as UpsertLibraryMaterialAssetsRequestDto['assets'][number]['role'],
        deliveryKind: asset.deliveryKind as 'url' | 'file',
        url: asset.url ?? undefined,
        fileAttachmentId: asset.fileAttachmentId ?? undefined,
        label: asset.label ?? undefined,
        sortOrder: asset.sortOrder ?? undefined,
      })),
    };
    return this.materials.upsertAssets(userId, materialId, body);
  }
}
