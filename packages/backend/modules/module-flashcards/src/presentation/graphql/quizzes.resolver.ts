import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard } from '@be/auth';
import type { GenerateQuizRequestDto } from '@pkg/types';
import {
  GenerateQuizInput,
  QuizAttemptResultType,
  QuizCardType,
  QuizDetailType,
  QuizzesPageType,
  StudentQuizCardType,
  StudentQuizzesPageType,
  SubmitQuizAttemptInput,
} from '@be/graphql';
import { QuizGeneratorService } from '../../application/quiz-generator.service';
import { mapQuizDetail } from './quiz-graphql.util';

@Resolver()
@UseGuards(GqlAuthGuard)
export class QuizzesResolver {
  constructor(private readonly quizService: QuizGeneratorService) {}

  @Query(() => [QuizCardType], { name: 'quizzes' })
  quizzes(@CurrentGqlUser() userId: string) {
    return this.quizService.listFor(userId);
  }

  @Query(() => QuizzesPageType, { name: 'quizzesPage' })
  quizzesPage(
    @CurrentGqlUser() userId: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.quizService.listForPage(userId, limit ?? 25, cursor);
  }

  @Query(() => QuizDetailType, { name: 'quiz' })
  async quiz(@CurrentGqlUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const detail = await this.quizService.detailFor(userId, id);
    return mapQuizDetail(detail);
  }

  @Mutation(() => QuizDetailType, { name: 'generateQuiz' })
  async generateQuiz(@CurrentGqlUser() userId: string, @Args('input') input: GenerateQuizInput) {
    const body: GenerateQuizRequestDto = {
      title: input.title,
      category: input.category,
      difficulty: input.difficulty as GenerateQuizRequestDto['difficulty'],
      source: input.source as GenerateQuizRequestDto['source'],
      questionCount: input.questionCount,
      lessonId: input.lessonId,
      studentId: input.studentId,
      includeIrregularVerbDrills: input.includeIrregularVerbDrills,
    };
    const detail = await this.quizService.generate(userId, body);
    return mapQuizDetail(detail);
  }

  @Mutation(() => Boolean, { name: 'deleteQuiz' })
  deleteQuiz(@CurrentGqlUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    return this.quizService.delete(userId, id);
  }

  @Query(() => [StudentQuizCardType], { name: 'studentQuizzes' })
  studentQuizzes(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { nullable: true, type: () => ID }) studentId?: string,
  ) {
    return this.quizService.listForStudent(userId, studentId ?? userId);
  }

  @Query(() => StudentQuizzesPageType, { name: 'studentQuizzesPage' })
  studentQuizzesPage(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { type: () => ID }) studentId: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.quizService.listForStudentPage(userId, studentId, limit ?? 25, cursor);
  }

  @Mutation(() => QuizAttemptResultType, { name: 'submitQuizAttempt' })
  submitQuizAttempt(
    @CurrentGqlUser() userId: string,
    @Args('input') input: SubmitQuizAttemptInput,
  ) {
    return this.quizService.submitAttempt(userId, {
      quizId: input.quizId,
      studentId: input.studentId,
      practiceMode: input.practiceMode,
      answers: input.answers,
    });
  }
}
