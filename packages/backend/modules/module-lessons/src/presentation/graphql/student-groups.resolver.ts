import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard, Roles, RolesGuard } from '@be/auth';
import {
  CreateStudentGroupInput,
  OkResultType,
  StudentGroupType,
  UpdateStudentGroupInput,
} from '@be/graphql';
import type {
  CreateStudentGroupRequestDto,
  GroupFixedSplitMode,
  GroupLessonBillingMode,
  UpdateStudentGroupRequestDto,
} from '@pkg/types';
import { StudentGroupsService } from '../../application/student-groups.service';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class StudentGroupsResolver {
  constructor(private readonly studentGroups: StudentGroupsService) {}

  @Query(() => [StudentGroupType], { name: 'studentGroups' })
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  list(@CurrentGqlUser() userId: string) {
    return this.studentGroups.listForActor(userId);
  }

  @Query(() => StudentGroupType, { name: 'studentGroup' })
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  get(@CurrentGqlUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    return this.studentGroups.getById(userId, id);
  }

  @Mutation(() => StudentGroupType, { name: 'createStudentGroup' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@CurrentGqlUser() userId: string, @Args('input') input: CreateStudentGroupInput) {
    return this.studentGroups.create(userId, mapCreateInput(input));
  }

  @Mutation(() => StudentGroupType, { name: 'updateStudentGroup' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateStudentGroupInput,
  ) {
    return this.studentGroups.update(userId, id, mapUpdateInput(input));
  }

  @Mutation(() => OkResultType, { name: 'deleteStudentGroup' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  async remove(@CurrentGqlUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    await this.studentGroups.remove(userId, id);
    return { ok: true };
  }
}

function mapCreateInput(input: CreateStudentGroupInput): CreateStudentGroupRequestDto {
  return {
    name: input.name,
    teacherId: input.teacherId,
    memberUserIds: input.memberUserIds,
    groupBillingMode: input.groupBillingMode as GroupLessonBillingMode,
    groupPriceMinor: input.groupPriceMinor,
    groupCurrency: input.groupCurrency,
    groupSplitMode: input.groupSplitMode as GroupFixedSplitMode | undefined,
    groupPayerUserId: input.groupPayerUserId,
  };
}

function mapUpdateInput(input: UpdateStudentGroupInput): UpdateStudentGroupRequestDto {
  return {
    name: input.name,
    teacherId: input.teacherId,
    memberUserIds: input.memberUserIds,
    groupBillingMode: input.groupBillingMode as GroupLessonBillingMode | undefined,
    groupPriceMinor: input.groupPriceMinor,
    groupCurrency: input.groupCurrency,
    groupSplitMode: input.groupSplitMode as GroupFixedSplitMode | undefined,
    groupPayerUserId: input.groupPayerUserId,
  };
}
