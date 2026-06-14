import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, NotFoundException, UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard } from '@be/auth';
import {
  CreateScheduledLessonInput,
  OkResultType,
  ScheduledLessonType,
  ScheduledLessonsPageType,
  UpdateScheduledLessonInput,
} from '@be/graphql';
import { LessonsService } from '../../application/lessons.service';
import { isLessonMember } from '../../domain/lessons-access.util';
import {
  mapGroupBillingInput,
  mapLessonHomeworkInput,
  mapLessonMaterialsInput,
  mapStudentResponseInput,
} from './lessons-mapper.util';

@Resolver()
@UseGuards(GqlAuthGuard)
export class LessonsResolver {
  constructor(private readonly lessons: LessonsService) {}

  @Query(() => [ScheduledLessonType], { name: 'scheduledLessons' })
  scheduledLessons(@CurrentGqlUser() userId: string) {
    return this.lessons.listFor(userId);
  }

  @Query(() => ScheduledLessonsPageType, { name: 'scheduledLessonsPage' })
  async scheduledLessonsPage(
    @CurrentGqlUser() userId: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
  ) {
    const page = await this.lessons.listForPage(
      userId,
      limit ?? 25,
      cursor,
      studentId,
    );
    return page;
  }

  @Query(() => ScheduledLessonType, { name: 'scheduledLesson' })
  async scheduledLesson(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const lesson = await this.lessons.fetchLesson(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (!isLessonMember(lesson, userId)) {
      throw new ForbiddenException();
    }
    return this.lessons.toDto(lesson);
  }

  @Mutation(() => ScheduledLessonType, { name: 'createScheduledLesson' })
  createScheduledLesson(
    @CurrentGqlUser() userId: string,
    @Args('input') input: CreateScheduledLessonInput,
  ) {
    return this.lessons.create(userId, {
      title: input.title,
      description: input.description,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      studentId: input.studentId,
      teacherId: input.teacherId,
      duration: input.duration,
      timezone: input.timezone,
      notes: input.notes,
      lessonPlan: input.lessonPlan,
      status: input.status as 'planned' | 'completed' | 'cancelled' | undefined,
      recurrence: input.recurrence as 'none' | 'daily' | 'weekly' | 'monthly' | undefined,
      weeklyDays: input.weeklyDays,
      seriesId: input.seriesId,
      linkedWordIds: input.linkedWordIds,
      createMeetLink: input.createMeetLink,
      kind: input.kind as 'individual' | 'group' | undefined,
      studentGroupId: input.studentGroupId,
      participantIds: input.participantIds,
      groupBilling: mapGroupBillingInput(input.groupBilling),
      materials: mapLessonMaterialsInput(input.materials),
      homework: mapLessonHomeworkInput(input.homework),
      studentResponse: mapStudentResponseInput(input.studentResponse),
    });
  }

  @Mutation(() => ScheduledLessonType, { name: 'updateScheduledLesson' })
  updateScheduledLesson(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateScheduledLessonInput,
  ) {
    return this.lessons.update(id, userId, {
      title: input.title,
      description: input.description,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      duration: input.duration,
      timezone: input.timezone,
      notes: input.notes,
      lessonPlan: input.lessonPlan,
      status: input.status as 'planned' | 'completed' | 'cancelled' | undefined,
      recurrence: input.recurrence as 'none' | 'daily' | 'weekly' | 'monthly' | undefined,
      weeklyDays: input.weeklyDays,
      seriesId: input.seriesId,
      linkedWordIds: input.linkedWordIds,
      cancelReason: input.cancelReason as
        | 'student_absent'
        | 'student_requested_cancel'
        | 'teacher_absent'
        | undefined,
      credited: input.credited,
      kind: input.kind as 'individual' | 'group' | undefined,
      participantIds: input.participantIds,
      groupBilling: mapGroupBillingInput(input.groupBilling),
      materials: mapLessonMaterialsInput(input.materials),
      homework: mapLessonHomeworkInput(input.homework),
      studentResponse: mapStudentResponseInput(input.studentResponse),
    });
  }

  @Mutation(() => ScheduledLessonType, { name: 'ensureScheduledLessonMeet' })
  ensureScheduledLessonMeet(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.lessons.ensureMeetLink(id, userId);
  }

  @Mutation(() => OkResultType, { name: 'deleteScheduledLesson' })
  async deleteScheduledLesson(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    await this.lessons.remove(id, userId);
    return { ok: true };
  }
}
