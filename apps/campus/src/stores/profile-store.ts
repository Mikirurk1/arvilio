'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  ChangePasswordRequestDto,
  MyProfileDto,
  ProfileNotificationPrefs,
  UpdateMyProfileRequestDto,
} from '@pkg/types';
import { CHANGE_MY_PASSWORD, MY_PROFILE, UPDATE_MY_PROFILE } from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import { useAuthStore } from './auth-store';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

type ProfileState = {
  profile: AsyncSlice<MyProfileDto>;
  passwordMutating: boolean;
  passwordError: string | null;
  profileMutating: boolean;
  profileError: string | null;
  fetchProfile: (force?: boolean) => Promise<void>;
  updateProfile: (body: UpdateMyProfileRequestDto) => Promise<MyProfileDto>;
  updateNotificationPrefs: (prefs: ProfileNotificationPrefs) => Promise<MyProfileDto>;
  changePassword: (body: ChangePasswordRequestDto) => Promise<void>;
};

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
      profile: createIdleSlice<MyProfileDto>(),
      passwordMutating: false,
      passwordError: null,
      profileMutating: false,
      profileError: null,

      fetchProfile: async (force = false) => {
        const prev = get().profile;
        if (!force && prev.status === 'success' && prev.data) return;
        set({ profile: sliceLoading(prev) }, false, 'profile/fetch:start');
        try {
          const data = await graphqlRequest<{ myProfile: MyProfileDto }>(MY_PROFILE);
          set({ profile: sliceSuccess(prev, data.myProfile) }, false, 'profile/fetch:success');
        } catch (error) {
          set({ profile: sliceError(prev, error) }, false, 'profile/fetch:error');
        }
      },

      updateProfile: async (body) => {
        set({ profileMutating: true, profileError: null }, false, 'profile/update:start');
        try {
          const data = await graphqlRequest<{ updateMyProfile: MyProfileDto }>(
            UPDATE_MY_PROFILE,
            { input: body },
          );
          const prevEmail = get().profile.data?.email;
          const updated = {
            ...data.updateMyProfile,
            email: data.updateMyProfile.email || prevEmail || '',
          };
          set(
            { profile: sliceSuccess(get().profile, updated), profileMutating: false },
            false,
            'profile/update:success',
          );
          useAuthStore.setState((state) => {
            if (!state.user) return state;
            return {
              user: {
                ...state.user,
                displayName: updated.displayName,
                avatarUrl: updated.avatarUrl,
                timezone: updated.timezone,
                proficiencyLevel: updated.proficiencyLevel,
              },
            };
          });
          return updated;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update profile';
          set({ profileMutating: false, profileError: message }, false, 'profile/update:error');
          throw error;
        }
      },

      updateNotificationPrefs: async (prefs) => {
        return get().updateProfile({ notificationPrefs: prefs });
      },

      changePassword: async (body) => {
        set({ passwordMutating: true, passwordError: null }, false, 'profile/password:start');
        try {
          await graphqlRequest(CHANGE_MY_PASSWORD, { input: body });
          set({ passwordMutating: false }, false, 'profile/password:success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to change password';
          set({ passwordMutating: false, passwordError: message }, false, 'profile/password:error');
          throw error;
        }
      },
    }),
    { name: 'soenglish/profile' },
  ),
);
