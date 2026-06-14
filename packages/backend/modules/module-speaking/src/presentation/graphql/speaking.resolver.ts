import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard } from '@be/auth';
import type {
  CreateSpeakingTopicRequestDto,
  ReviewSpeakingSubmissionRequestDto,
  SubmitSpeakingRecordingRequestDto,
} from '@pkg/types';
import {
  CreateSpeakingTopicInput,
  ReviewSpeakingSubmissionInput,
  SpeakingSubmissionType,
  SpeakingTopicCardType,
  SubmitSpeakingRecordingInput,
} from '@be/graphql';
import { SpeakingTopicsService } from '../../application/speaking-topics.service';
import { SpeakingSubmissionsService } from '../../application/speaking-submissions.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SpeakingResolver {
  constructor(
    private readonly topics: SpeakingTopicsService,
    private readonly submissions: SpeakingSubmissionsService,
  ) {}

  @Query(() => [SpeakingTopicCardType], { name: 'mySpeakingTopics' })
  mySpeakingTopics(@CurrentGqlUser() userId: string) {
    return this.topics.listForUser(userId);
  }

  @Query(() => [SpeakingTopicCardType], { name: 'studentSpeakingTopics' })
  studentSpeakingTopics(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { type: () => ID }) studentId: string,
  ) {
    return this.topics.listForStudent(userId, studentId);
  }

  @Query(() => [SpeakingSubmissionType], { name: 'studentSpeakingSubmissions' })
  studentSpeakingSubmissions(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { type: () => ID }) studentId: string,
  ) {
    return this.submissions.listForStudent(userId, studentId);
  }

  @Mutation(() => SpeakingTopicCardType, { name: 'createSpeakingTopic' })
  createSpeakingTopic(
    @CurrentGqlUser() userId: string,
    @Args('input') input: CreateSpeakingTopicInput,
  ) {
    const body: CreateSpeakingTopicRequestDto = {
      title: input.title,
      prompt: input.prompt,
      wordIds: input.wordIds ?? undefined,
      studentId: input.studentId ?? undefined,
      personalNote: input.personalNote ?? undefined,
      dueDate: input.dueDate ?? undefined,
    };
    return this.topics.create(userId, body);
  }

  @Mutation(() => Boolean, { name: 'deleteSpeakingTopic' })
  deleteSpeakingTopic(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.topics.delete(userId, id);
  }

  @Mutation(() => SpeakingSubmissionType, { name: 'submitSpeakingRecording' })
  submitSpeakingRecording(
    @CurrentGqlUser() userId: string,
    @Args('input') input: SubmitSpeakingRecordingInput,
  ) {
    const body: SubmitSpeakingRecordingRequestDto = {
      topicId: input.topicId,
      assignmentId: input.assignmentId ?? undefined,
      durationSec: input.durationSec ?? undefined,
    };
    return this.submissions.submit(userId, body);
  }

  @Mutation(() => SpeakingSubmissionType, { name: 'reviewSpeakingSubmission' })
  reviewSpeakingSubmission(
    @CurrentGqlUser() userId: string,
    @Args('input') input: ReviewSpeakingSubmissionInput,
  ) {
    const body: ReviewSpeakingSubmissionRequestDto = {
      submissionId: input.submissionId,
      teacherFeedback: input.teacherFeedback,
    };
    return this.submissions.review(userId, body);
  }
}
