import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard, Roles, RolesGuard } from '@be/auth';
import {
  RecordStaffPayoutInput,
  StaffCompensationProfileType,
  StaffEarningsSectionType,
  StaffFinanceOverviewType,
  StaffPayoutDefaultsType,
  StaffPayoutHistoryPageType,
  StaffPayoutType,
  UpdateStaffCompensationProfileInput,
  UpdateStaffPayoutDefaultsInput,
} from '@be/graphql';
import type { PaymentCurrencyCode, StaffCompensationModeDto, StaffPayFrequencyDto, StatsRange } from '@pkg/types';
import {
  resolveStatsRangeBounds,
  statsRangeLabel,
} from '@pkg/types';
import { StaffPayrollService } from '../../application/staff-payroll.service';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class StaffPayrollResolver {
  constructor(private readonly staffPayroll: StaffPayrollService) {}

  @Query(() => StaffPayoutDefaultsType, { name: 'staffPayoutDefaults' })
  @Roles('SUPER_ADMIN')
  staffPayoutDefaults() {
    return this.staffPayroll.getDefaults();
  }

  @Mutation(() => StaffPayoutDefaultsType, { name: 'updateStaffPayoutDefaults' })
  @Roles('SUPER_ADMIN')
  updateStaffPayoutDefaults(@Args('input') input: UpdateStaffPayoutDefaultsInput) {
    return this.staffPayroll.updateDefaults({
      defaultMode: input.defaultMode as StaffCompensationModeDto,
      defaultPerLessonRateMinor: input.defaultPerLessonRateMinor,
      defaultSalaryMinor: input.defaultSalaryMinor,
      defaultCurrency: input.defaultCurrency as PaymentCurrencyCode,
      defaultPayFrequency: input.defaultPayFrequency as StaffPayFrequencyDto,
      defaultPayDayOfWeek: input.defaultPayDayOfWeek,
      defaultPayDayOfMonth: input.defaultPayDayOfMonth,
      defaultGraceDays: input.defaultGraceDays,
    });
  }

  @Query(() => StaffCompensationProfileType, { name: 'staffCompensationProfile' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  staffCompensationProfile(@Args('userId', { type: () => ID }) userId: string) {
    return this.staffPayroll.getCompensationProfile(userId);
  }

  @Mutation(() => StaffCompensationProfileType, { name: 'updateStaffCompensationProfile' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateStaffCompensationProfile(@Args('input') input: UpdateStaffCompensationProfileInput) {
    return this.staffPayroll.updateCompensationProfile({
      userId: input.userId,
      mode: (input.mode as StaffCompensationModeDto | null | undefined) ?? null,
      perLessonRateMinor: input.perLessonRateMinor,
      salaryMinor: input.salaryMinor,
      currency: input.currency as PaymentCurrencyCode | null | undefined,
      payFrequency: (input.payFrequency as StaffPayFrequencyDto | null | undefined) ?? null,
      payDayOfWeek: input.payDayOfWeek,
      payDayOfMonth: input.payDayOfMonth,
      graceDays: input.graceDays,
    });
  }

  @Mutation(() => StaffPayoutType, { name: 'recordStaffPayout' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  recordStaffPayout(
    @CurrentGqlUser() actorUserId: string,
    @Args('input') input: RecordStaffPayoutInput,
  ) {
    return this.staffPayroll.recordPayout(actorUserId, {
      ...input,
      currency: input.currency as PaymentCurrencyCode,
    });
  }

  @Query(() => [StaffPayoutType], { name: 'staffPayoutHistory' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async staffPayoutHistory(
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
    @Args('rangeFrom', { nullable: true }) rangeFrom?: string,
    @Args('rangeTo', { nullable: true }) rangeTo?: string,
  ) {
    const bounds =
      rangeFrom && rangeTo ? { from: rangeFrom, to: rangeTo } : undefined;
    return this.staffPayroll.listPayoutHistory(userId, bounds);
  }

  @Query(() => StaffPayoutHistoryPageType, { name: 'staffPayoutHistoryPage' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async staffPayoutHistoryPage(
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
    @Args('rangeFrom', { nullable: true }) rangeFrom?: string,
    @Args('rangeTo', { nullable: true }) rangeTo?: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    const bounds =
      rangeFrom && rangeTo ? { from: rangeFrom, to: rangeTo } : undefined;
    return this.staffPayroll.listPayoutHistoryPage({
      userId,
      bounds,
      cursor,
      limit: limit ?? 25,
    });
  }

  @Query(() => StaffEarningsSectionType, { name: 'myStaffEarnings' })
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  async myStaffEarnings(
    @CurrentGqlUser() userId: string,
    @Args('range') range: string,
    @Args('rangeFrom', { nullable: true }) rangeFrom?: string,
    @Args('rangeTo', { nullable: true }) rangeTo?: string,
  ) {
    return this.buildStaffEarningsResponse(userId, range, rangeFrom, rangeTo);
  }

  @Query(() => StaffEarningsSectionType, { name: 'staffMemberEarnings' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async staffMemberEarnings(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('range') range: string,
    @Args('rangeFrom', { nullable: true }) rangeFrom?: string,
    @Args('rangeTo', { nullable: true }) rangeTo?: string,
  ) {
    return this.buildStaffEarningsResponse(userId, range, rangeFrom, rangeTo);
  }

  private buildStaffEarningsResponse(
    userId: string,
    range: string,
    rangeFrom?: string,
    rangeTo?: string,
  ) {
    const statsRange = range as StatsRange;
    const now = new Date();
    const rangeBounds =
      rangeFrom && rangeTo
        ? resolveStatsRangeBounds(statsRange, now, { from: rangeFrom, to: rangeTo })
        : resolveStatsRangeBounds(statsRange, now);
    const rangeLabel = statsRangeLabel(statsRange, rangeBounds);
    return this.staffPayroll.buildMyEarnings(userId, statsRange, rangeBounds, rangeLabel);
  }

  @Query(() => StaffFinanceOverviewType, { name: 'staffFinanceOverview' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async staffFinanceOverview(
    @Args('range') range: string,
    @Args('rangeFrom', { nullable: true }) rangeFrom?: string,
    @Args('rangeTo', { nullable: true }) rangeTo?: string,
  ) {
    const statsRange = range as StatsRange;
    const now = new Date();
    const rangeBounds =
      rangeFrom && rangeTo
        ? resolveStatsRangeBounds(statsRange, now, { from: rangeFrom, to: rangeTo })
        : resolveStatsRangeBounds(statsRange, now);
    const rangeLabel = statsRangeLabel(statsRange, rangeBounds);
    const overview = await this.staffPayroll.buildFinanceOverview(
      statsRange,
      rangeBounds,
      rangeLabel,
    );
    return {
      ...overview,
      rangeFrom: overview.rangeBounds.from,
      rangeTo: overview.rangeBounds.to,
    };
  }
}
