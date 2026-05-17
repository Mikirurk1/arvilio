'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  AdminUserSummaryDto,
  CreateAdminUserRequestDto,
  CreateAdminUserResultDto,
} from '@soenglish/shared-types';
import { ADMIN_USERS, CREATE_ADMIN_USER, DELETE_ADMIN_USER } from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

type AdminState = {
  users: AsyncSlice<AdminUserSummaryDto[]>;
  mutating: boolean;
  mutationError: string | null;
  fetchUsers: (force?: boolean) => Promise<void>;
  createUser: (body: CreateAdminUserRequestDto) => Promise<CreateAdminUserResultDto>;
  deleteUser: (id: string) => Promise<void>;
};

export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      users: createIdleSlice<AdminUserSummaryDto[]>(),
      mutating: false,
      mutationError: null,

      fetchUsers: async (force = false) => {
        const prev = get().users;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ users: sliceLoading(prev) }, false, 'admin/users:start');
        try {
          const data = await graphqlRequest<{ adminUsers: AdminUserSummaryDto[] }>(ADMIN_USERS);
          set({ users: sliceSuccess(prev, data.adminUsers) }, false, 'admin/users:success');
        } catch (error) {
          set({ users: sliceError(prev, error) }, false, 'admin/users:error');
        }
      },

      createUser: async (body) => {
        set({ mutating: true, mutationError: null }, false, 'admin/create:start');
        try {
          const data = await graphqlRequest<{ createAdminUser: CreateAdminUserResultDto }>(
            CREATE_ADMIN_USER,
            { input: body },
          );
          await get().fetchUsers(true);
          set({ mutating: false }, false, 'admin/create:success');
          return data.createAdminUser;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create user';
          set({ mutating: false, mutationError: message }, false, 'admin/create:error');
          throw error;
        }
      },

      deleteUser: async (id) => {
        set({ mutating: true, mutationError: null }, false, 'admin/delete:start');
        try {
          await graphqlRequest(DELETE_ADMIN_USER, { id });
          await get().fetchUsers(true);
          set({ mutating: false }, false, 'admin/delete:success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete user';
          set({ mutating: false, mutationError: message }, false, 'admin/delete:error');
          throw error;
        }
      },
    }),
    { name: 'soenglish/admin' },
  ),
);
