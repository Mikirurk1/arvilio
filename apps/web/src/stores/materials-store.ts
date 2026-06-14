'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  CreateLibraryMaterialRequestDto,
  LibraryMaterialDto,
  LibraryMaterialKindCountsDto,
  LibraryMaterialKindName,
  UpdateLibraryMaterialRequestDto,
} from '@pkg/types';
import {
  CREATE_LIBRARY_MATERIAL,
  DELETE_LIBRARY_MATERIAL,
  LIBRARY_MATERIALS,
  UPDATE_LIBRARY_MATERIAL,
} from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import type { LibraryKindFilter } from '../features/materials/material-asset-presets';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

type MaterialsListState = {
  items: LibraryMaterialDto[];
  nextCursor: string | null;
  kindCounts: LibraryMaterialKindCountsDto;
};

type MaterialsState = {
  list: AsyncSlice<MaterialsListState>;
  listKind: LibraryKindFilter;
  listSearch: string;
  saving: boolean;
  saveError: string | null;
  fetchList: (options?: {
    kind?: LibraryKindFilter;
    search?: string;
    cursor?: string | null;
    append?: boolean;
    force?: boolean;
  }) => Promise<void>;
  createMaterial: (body: CreateLibraryMaterialRequestDto) => Promise<LibraryMaterialDto>;
  updateMaterial: (
    id: string,
    body: UpdateLibraryMaterialRequestDto,
  ) => Promise<LibraryMaterialDto>;
  deleteMaterial: (id: string) => Promise<void>;
  setListKind: (kind: LibraryKindFilter) => void;
  setListSearch: (search: string) => void;
};

const emptyCounts = (): LibraryMaterialKindCountsDto => ({
  all: 0,
  board: 0,
  presentation: 0,
  book: 0,
  other: 0,
});

export const useMaterialsStore = create<MaterialsState>()(
  devtools(
    (set, get) => ({
      list: createIdleSlice<MaterialsListState>(),
      listKind: 'all',
      listSearch: '',
      saving: false,
      saveError: null,

      setListKind: (kind) => set({ listKind: kind }, false, 'materials/kind'),
      setListSearch: (search) => set({ listSearch: search }, false, 'materials/search'),

      fetchList: async (options = {}) => {
        const kind = options.kind ?? get().listKind;
        const search = options.search ?? get().listSearch;
        const append = options.append ?? false;
        const prev = get().list;

        if (!append && !options.force && prev.status === 'success' && prev.data && kind === get().listKind && search === get().listSearch) {
          return;
        }

        set({ list: sliceLoading(prev) }, false, 'materials/list:start');
        try {
          const data = await graphqlRequest<{
            libraryMaterials: {
              items: LibraryMaterialDto[];
              nextCursor: string | null;
              kindCounts: LibraryMaterialKindCountsDto;
            };
          }>(LIBRARY_MATERIALS, {
            input: {
              kind: kind === 'all' ? null : kind,
              search: search.trim() || null,
              cursor: options.cursor ?? null,
              take: 24,
            },
          });

          const mergedItems = append && prev.data
            ? [...prev.data.items, ...data.libraryMaterials.items]
            : data.libraryMaterials.items;

          set(
            {
              list: sliceSuccess(prev, {
                items: mergedItems,
                nextCursor: data.libraryMaterials.nextCursor,
                kindCounts: data.libraryMaterials.kindCounts,
              }),
              listKind: kind,
              listSearch: search,
            },
            false,
            'materials/list:success',
          );
        } catch (error) {
          set({ list: sliceError(prev, error) }, false, 'materials/list:error');
        }
      },

      createMaterial: async (body) => {
        set({ saving: true, saveError: null }, false, 'materials/create:start');
        try {
          const data = await graphqlRequest<{ createLibraryMaterial: LibraryMaterialDto }>(
            CREATE_LIBRARY_MATERIAL,
            { input: body },
          );
          const prev = get().list;
          if (prev.data) {
            set(
              {
                list: sliceSuccess(prev, {
                  ...prev.data,
                  items: [data.createLibraryMaterial, ...prev.data.items],
                  kindCounts: {
                    ...prev.data.kindCounts,
                    all: prev.data.kindCounts.all + 1,
                    [data.createLibraryMaterial.kind]:
                      prev.data.kindCounts[data.createLibraryMaterial.kind] + 1,
                  },
                }),
                saving: false,
              },
              false,
              'materials/create:success',
            );
          } else {
            set({ saving: false }, false, 'materials/create:success');
          }
          return data.createLibraryMaterial;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Could not create material';
          set({ saving: false, saveError: message }, false, 'materials/create:error');
          throw error;
        }
      },

      updateMaterial: async (id, body) => {
        set({ saving: true, saveError: null }, false, 'materials/update:start');
        try {
          const data = await graphqlRequest<{ updateLibraryMaterial: LibraryMaterialDto }>(
            UPDATE_LIBRARY_MATERIAL,
            { id, input: body },
          );
          const prev = get().list;
          if (prev.data) {
            set(
              {
                list: sliceSuccess(prev, {
                  ...prev.data,
                  items: prev.data.items.map((item) =>
                    item.id === id ? data.updateLibraryMaterial : item,
                  ),
                }),
                saving: false,
              },
              false,
              'materials/update:success',
            );
          } else {
            set({ saving: false }, false, 'materials/update:success');
          }
          return data.updateLibraryMaterial;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Could not update material';
          set({ saving: false, saveError: message }, false, 'materials/update:error');
          throw error;
        }
      },

      deleteMaterial: async (id) => {
        set({ saving: true, saveError: null }, false, 'materials/delete:start');
        try {
          await graphqlRequest(DELETE_LIBRARY_MATERIAL, { id });
          const prev = get().list;
          if (prev.data) {
            const removed = prev.data.items.find((item) => item.id === id);
            set(
              {
                list: sliceSuccess(prev, {
                  ...prev.data,
                  items: prev.data.items.filter((item) => item.id !== id),
                  kindCounts: removed
                    ? {
                        ...prev.data.kindCounts,
                        all: Math.max(0, prev.data.kindCounts.all - 1),
                        [removed.kind]: Math.max(0, prev.data.kindCounts[removed.kind] - 1),
                      }
                    : prev.data.kindCounts,
                }),
                saving: false,
              },
              false,
              'materials/delete:success',
            );
          } else {
            set({ saving: false }, false, 'materials/delete:success');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Could not delete material';
          set({ saving: false, saveError: message }, false, 'materials/delete:error');
          throw error;
        }
      },
    }),
    { name: 'materials-store' },
  ),
);
