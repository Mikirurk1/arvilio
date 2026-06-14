'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  MyProfileDto,
  PaymentCurrencyCode,
  RecordStaffPayoutRequestDto,
  StaffCompensationProfileDto,
  StaffEarningsSectionDto,
  StaffFinanceOverviewDto,
  StaffPayoutDefaultsDto,
  StaffPayoutHistoryPageDto,
  StatsRange,
  UpdateStaffCompensationProfileRequestDto,
  UpdateStaffPayoutDefaultsRequestDto,
  UpdateStaffUserProfileRequestDto,
} from '@pkg/types';
import {
  RECORD_STAFF_PAYOUT,
  STAFF_COMPENSATION_PROFILE,
  STAFF_FINANCE_OVERVIEW,
  STAFF_MEMBER_EARNINGS,
  STAFF_PAYOUT_DEFAULTS,
  STAFF_PAYOUT_HISTORY,
  STAFF_PAYOUT_HISTORY_PAGE,
  STAFF_USER_PROFILE,
  UPDATE_STAFF_COMPENSATION_PROFILE,
  UPDATE_STAFF_PAYOUT_DEFAULTS,
  UPDATE_STAFF_USER_PROFILE,
} from '../graphql/operations';
import { graphqlRequest } from '../lib/graphql-client';
import {
  createIdleSlice,
  sliceError,
  sliceLoading,
  sliceSuccess,
  type AsyncSlice,
} from './lib/async-slice';

type FinanceStore = {
  defaults: AsyncSlice<StaffPayoutDefaultsDto>;
  overview: AsyncSlice<StaffFinanceOverviewDto>;
  fetchDefaults: () => Promise<StaffPayoutDefaultsDto>;
  updateDefaults: (input: UpdateStaffPayoutDefaultsRequestDto) => Promise<StaffPayoutDefaultsDto>;
  fetchOverview: (params: {
    range: StatsRange;
    rangeFrom?: string;
    rangeTo?: string;
  }) => Promise<StaffFinanceOverviewDto>;
  fetchCompensationProfile: (userId: string) => Promise<StaffCompensationProfileDto>;
  updateCompensationProfile: (
    input: UpdateStaffCompensationProfileRequestDto,
  ) => Promise<StaffCompensationProfileDto>;
  recordPayout: (input: RecordStaffPayoutRequestDto) => Promise<void>;
  fetchStaffMemberEarnings: (params: {
    userId: string;
    range: StatsRange;
    rangeFrom?: string;
    rangeTo?: string;
  }) => Promise<StaffEarningsSectionDto>;
  fetchStaffUserProfile: (userId: string) => Promise<MyProfileDto>;
  updateStaffUserProfile: (input: UpdateStaffUserProfileRequestDto) => Promise<MyProfileDto>;
};

export const useFinanceStore = create<FinanceStore>()(
  devtools(
    (set, get) => ({
      defaults: createIdleSlice(),
      overview: createIdleSlice(),

      async fetchDefaults() {
        set({ defaults: sliceLoading(get().defaults) });
        try {
          const data = await graphqlRequest<{ staffPayoutDefaults: StaffPayoutDefaultsDto }>(
            STAFF_PAYOUT_DEFAULTS,
          );
          const defaults = data.staffPayoutDefaults;
          set({ defaults: sliceSuccess(get().defaults, defaults) });
          return defaults;
        } catch (error) {
          set({
            defaults: sliceError(get().defaults, error),
          });
          throw error;
        }
      },

      async updateDefaults(input) {
        set({ defaults: sliceLoading(get().defaults) });
        try {
          const data = await graphqlRequest<{ updateStaffPayoutDefaults: StaffPayoutDefaultsDto }>(
            UPDATE_STAFF_PAYOUT_DEFAULTS,
            { input },
          );
          const defaults = data.updateStaffPayoutDefaults;
          set({ defaults: sliceSuccess(get().defaults, defaults) });
          return defaults;
        } catch (error) {
          set({
            defaults: sliceError(get().defaults, error),
          });
          throw error;
        }
      },

      async fetchOverview({ range, rangeFrom, rangeTo }) {
        set({ overview: sliceLoading(get().overview) });
        try {
          const data = await graphqlRequest<{ staffFinanceOverview: StaffFinanceOverviewDto & {
            rangeFrom: string;
            rangeTo: string;
          } }>(STAFF_FINANCE_OVERVIEW, { range, rangeFrom, rangeTo });
          const raw = data.staffFinanceOverview;
          const overview: StaffFinanceOverviewDto = {
            ...raw,
            rangeBounds: { from: raw.rangeFrom, to: raw.rangeTo },
          };
          set({ overview: sliceSuccess(get().overview, overview) });
          return overview;
        } catch (error) {
          set({
            overview: sliceError(get().overview, error),
          });
          throw error;
        }
      },

      async fetchCompensationProfile(userId) {
        const data = await graphqlRequest<{ staffCompensationProfile: StaffCompensationProfileDto }>(
          STAFF_COMPENSATION_PROFILE,
          { userId },
        );
        return data.staffCompensationProfile;
      },

      async updateCompensationProfile(input) {
        const data = await graphqlRequest<{
          updateStaffCompensationProfile: StaffCompensationProfileDto;
        }>(UPDATE_STAFF_COMPENSATION_PROFILE, { input });
        return data.updateStaffCompensationProfile;
      },

      async recordPayout(input) {
        await graphqlRequest(RECORD_STAFF_PAYOUT, {
          input: {
            ...input,
            currency: input.currency as PaymentCurrencyCode,
          },
        });
      },

      async fetchStaffMemberEarnings({ userId, range, rangeFrom, rangeTo }) {
        const data = await graphqlRequest<{ staffMemberEarnings: StaffEarningsSectionDto }>(
          STAFF_MEMBER_EARNINGS,
          { userId, range, rangeFrom, rangeTo },
        );
        return data.staffMemberEarnings;
      },

      async fetchStaffUserProfile(userId) {
        const data = await graphqlRequest<{ staffUserProfile: MyProfileDto }>(STAFF_USER_PROFILE, {
          userId,
        });
        return data.staffUserProfile;
      },

      async updateStaffUserProfile(input) {
        const data = await graphqlRequest<{ updateStaffUserProfile: MyProfileDto }>(
          UPDATE_STAFF_USER_PROFILE,
          { input },
        );
        return data.updateStaffUserProfile;
      },
    }),
    { name: 'finance-store' },
  ),
);

export async function fetchStaffPayoutHistory(params: {
  userId?: string;
  rangeFrom?: string;
  rangeTo?: string;
}) {
  const data = await graphqlRequest<{ staffPayoutHistory: StaffFinanceOverviewDto['recentPayouts'] }>(
    STAFF_PAYOUT_HISTORY,
    params,
  );
  return data.staffPayoutHistory;
}

export async function fetchStaffPayoutHistoryPage(params: {
  userId?: string;
  rangeFrom?: string;
  rangeTo?: string;
  cursor?: string;
  limit?: number;
}): Promise<StaffPayoutHistoryPageDto> {
  const data = await graphqlRequest<{ staffPayoutHistoryPage: StaffPayoutHistoryPageDto }>(
    STAFF_PAYOUT_HISTORY_PAGE,
    params,
  );
  return data.staffPayoutHistoryPage;
}
