import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard } from '@be/auth';
import { VocabularyService } from '../../application/vocabulary.service';
import type { StudentWordCardDto } from '@pkg/types';
import {
  CreateStudentWordCardInput,
  StudentVocabularyPageType,
  StudentWordCardType,
  UpdateCardStatusInput,
  VocabularyOverviewType,
  WordCardType,
  WordDetailsType,
  WordLookupResultType,
} from '@be/graphql';

@Resolver()
@UseGuards(GqlAuthGuard)
export class VocabularyResolver {
  constructor(private readonly vocabulary: VocabularyService) {}

  @Query(() => VocabularyOverviewType, { name: 'vocabularyOverview' })
  vocabularyOverview(@CurrentGqlUser() userId: string) {
    return this.vocabulary.overviewFor(userId);
  }

  @Query(() => WordLookupResultType, { name: 'lookupWord' })
  lookupWord(@Args('text') text: string) {
    return this.vocabulary.lookupWord(text);
  }

  @Query(() => [WordCardType], { name: 'wordsByIds' })
  wordsByIds(@Args('ids', { type: () => [ID] }) ids: string[]) {
    return this.vocabulary.listWordsByIds(ids);
  }

  @Query(() => WordDetailsType, { name: 'wordDetails' })
  wordDetails(@Args('id', { type: () => ID }) id: string) {
    return this.vocabulary.getWordDetails(id);
  }

  @Query(() => [WordCardType], { name: 'globalWords' })
  globalWords(
    @Args('search', { nullable: true }) search?: string,
    @Args('category', { nullable: true }) category?: string,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
  ) {
    return this.vocabulary.listWords({ search, category, take });
  }

  @Query(() => [StudentWordCardType], { name: 'studentVocabulary' })
  studentVocabulary(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
  ) {
    return this.vocabulary.listStudentCards(studentId ?? userId);
  }

  @Query(() => StudentVocabularyPageType, { name: 'studentVocabularyPage' })
  studentVocabularyPage(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.vocabulary.listStudentCardsPage(studentId ?? userId, limit ?? 25, cursor);
  }

  @Mutation(() => StudentWordCardType, { name: 'addStudentWordCard' })
  addStudentWordCard(
    @CurrentGqlUser() userId: string,
    @Args('input') input: CreateStudentWordCardInput,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
  ) {
    const targetId = studentId ?? userId;
    return this.vocabulary.createStudentCard(targetId, userId, {
      text: input.text,
      lessonId: input.lessonId,
      status: (input.status ?? 'new') as StudentWordCardDto['status'],
    });
  }

  @Mutation(() => StudentWordCardType, { name: 'updateCardStatus' })
  updateCardStatus(
    @CurrentGqlUser() userId: string,
    @Args('input') input: UpdateCardStatusInput,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
  ) {
    const targetId = studentId ?? userId;
    return this.vocabulary.statusUpdate(
      targetId,
      input.cardId,
      input.status as StudentWordCardDto['status'],
      userId,
    );
  }

  @Mutation(() => Boolean, { name: 'deleteStudentWordCard' })
  deleteStudentWordCard(
    @CurrentGqlUser() userId: string,
    @Args('cardId', { type: () => ID }) cardId: string,
    @Args('studentId', { type: () => ID }) studentId: string,
  ) {
    return this.vocabulary.deleteStudentCard(userId, studentId, cardId);
  }
}
