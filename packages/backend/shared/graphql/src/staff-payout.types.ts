import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StaffPayoutDefaultsType {
  @Field()
  defaultMode!: string;

  @Field(() => Int)
  defaultPerLessonRateMinor!: number;

  @Field(() => Int)
  defaultSalaryMinor!: number;

  @Field()
  defaultCurrency!: string;

  @Field()
  defaultPayFrequency!: string;

  @Field(() => Int)
  defaultPayDayOfWeek!: number;

  @Field(() => Int)
  defaultPayDayOfMonth!: number;

  @Field(() => Int)
  defaultGraceDays!: number;
}

@InputType()
export class UpdateStaffPayoutDefaultsInput {
  @Field()
  defaultMode!: string;

  @Field(() => Int)
  defaultPerLessonRateMinor!: number;

  @Field(() => Int)
  defaultSalaryMinor!: number;

  @Field()
  defaultCurrency!: string;

  @Field()
  defaultPayFrequency!: string;

  @Field(() => Int)
  defaultPayDayOfWeek!: number;

  @Field(() => Int)
  defaultPayDayOfMonth!: number;

  @Field(() => Int)
  defaultGraceDays!: number;
}

@ObjectType()
export class StaffCompensationProfileType {
  @Field(() => ID)
  userId!: string;

  @Field({ nullable: true })
  mode?: string | null;

  @Field(() => Int, { nullable: true })
  perLessonRateMinor?: number | null;

  @Field(() => Int, { nullable: true })
  salaryMinor?: number | null;

  @Field({ nullable: true })
  currency?: string | null;

  @Field({ nullable: true })
  payFrequency?: string | null;

  @Field(() => Int, { nullable: true })
  payDayOfWeek?: number | null;

  @Field(() => Int, { nullable: true })
  payDayOfMonth?: number | null;

  @Field(() => Int, { nullable: true })
  graceDays?: number | null;
}

@InputType()
export class UpdateStaffCompensationProfileInput {
  @Field(() => ID)
  userId!: string;

  @Field({ nullable: true })
  mode?: string | null;

  @Field(() => Int, { nullable: true })
  perLessonRateMinor?: number | null;

  @Field(() => Int, { nullable: true })
  salaryMinor?: number | null;

  @Field({ nullable: true })
  currency?: string | null;

  @Field({ nullable: true })
  payFrequency?: string | null;

  @Field(() => Int, { nullable: true })
  payDayOfWeek?: number | null;

  @Field(() => Int, { nullable: true })
  payDayOfMonth?: number | null;

  @Field(() => Int, { nullable: true })
  graceDays?: number | null;
}

@InputType()
export class RecordStaffPayoutInput {
  @Field(() => ID)
  userId!: string;

  @Field(() => Int)
  amountMinor!: number;

  @Field()
  currency!: string;

  @Field()
  paidAt!: string;

  @Field({ nullable: true })
  periodFrom?: string | null;

  @Field({ nullable: true })
  periodTo?: string | null;

  @Field({ nullable: true })
  note?: string | null;
}

@ObjectType()
export class StaffPayoutType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  userId!: string;

  @Field()
  userDisplayName!: string;

  @Field(() => Int)
  amountMinor!: number;

  @Field()
  currency!: string;

  @Field()
  paidAt!: string;

  @Field({ nullable: true })
  periodFrom?: string | null;

  @Field({ nullable: true })
  periodTo?: string | null;

  @Field({ nullable: true })
  note?: string | null;

  @Field(() => ID)
  createdByUserId!: string;

  @Field()
  createdByDisplayName!: string;

  @Field()
  createdAt!: string;
}

@ObjectType()
export class StaffPayoutHistoryPageType {
  @Field(() => [StaffPayoutType])
  items!: StaffPayoutType[];

  @Field()
  hasMore!: boolean;

  @Field({ nullable: true })
  nextCursor?: string | null;
}

@ObjectType()
export class StaffEarningsTrendPointType {
  @Field()
  label!: string;

  @Field(() => Int)
  accruedMinor!: number;

  @Field(() => Int)
  paidMinor!: number;
}

@ObjectType()
export class StaffEarningsSectionType {
  @Field(() => Int)
  completedLessons!: number;

  @Field(() => Float)
  lessonHours!: number;

  @Field(() => Int)
  accruedMinor!: number;

  @Field(() => Int)
  paidMinor!: number;

  @Field(() => Int)
  outstandingMinor!: number;

  @Field()
  currency!: string;

  @Field()
  mode!: string;

  @Field(() => Int)
  perLessonRateMinor!: number;

  @Field(() => Int)
  salaryMinor!: number;

  @Field()
  payFrequency!: string;

  @Field()
  nextPayDate!: string;

  @Field()
  payoutStatus!: string;

  @Field(() => [StaffEarningsTrendPointType])
  trend!: StaffEarningsTrendPointType[];
}

@ObjectType()
export class StaffFinanceStaffRowType {
  @Field(() => ID)
  userId!: string;

  @Field()
  displayName!: string;

  @Field()
  role!: string;

  @Field()
  mode!: string;

  @Field(() => Int)
  completedLessons!: number;

  @Field(() => Int)
  accruedMinor!: number;

  @Field(() => Int)
  paidMinor!: number;

  @Field(() => Int)
  outstandingMinor!: number;

  @Field()
  currency!: string;

  @Field()
  nextPayDate!: string;

  @Field()
  payoutStatus!: string;
}

@ObjectType()
export class StaffFinanceOverviewType {
  @Field()
  range!: string;

  @Field()
  rangeLabel!: string;

  @Field()
  rangeFrom!: string;

  @Field()
  rangeTo!: string;

  @Field()
  currency!: string;

  @Field(() => Int)
  totalAccruedMinor!: number;

  @Field(() => Int)
  totalPaidMinor!: number;

  @Field(() => Int)
  totalOutstandingMinor!: number;

  @Field(() => [StaffFinanceStaffRowType])
  staff!: StaffFinanceStaffRowType[];

  @Field(() => [StaffEarningsTrendPointType])
  trend!: StaffEarningsTrendPointType[];

  @Field(() => [StaffPayoutType])
  recentPayouts!: StaffPayoutType[];
}
