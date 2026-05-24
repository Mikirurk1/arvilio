import { Injectable } from '@nestjs/common';
import type {
  GenerateQuizRequestDto,
  QuizAttemptResultDto,
  QuizCardDto,
  QuizDetailDto,
  StudentQuizCardDto,
  SubmitQuizAttemptRequestDto,
} from '@pkg/types';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizDetailService } from './quiz-detail.service';
import { QuizGenerateService } from './quiz-generate.service';
import { QuizListService } from './quiz-list.service';

/** Thin facade over quiz vertical slices (list, detail, generate, attempt). */
@Injectable()
export class QuizGeneratorService {
  constructor(
    private readonly listService: QuizListService,
    private readonly detailService: QuizDetailService,
    private readonly generateService: QuizGenerateService,
    private readonly attemptService: QuizAttemptService,
  ) {}

  generate(actorId: string, body: GenerateQuizRequestDto): Promise<QuizDetailDto> {
    return this.generateService.generate(actorId, body);
  }

  delete(actorId: string, quizId: string): Promise<boolean> {
    return this.listService.delete(actorId, quizId);
  }

  listForStudent(viewerId: string, studentId: string): Promise<StudentQuizCardDto[]> {
    return this.listService.listForStudent(viewerId, studentId);
  }

  submitAttempt(
    actorId: string,
    body: SubmitQuizAttemptRequestDto,
  ): Promise<QuizAttemptResultDto> {
    return this.attemptService.submitAttempt(actorId, body);
  }

  listFor(userId: string): Promise<QuizCardDto[]> {
    return this.listService.listFor(userId);
  }

  listForPage(
    userId: string,
    limit?: number,
    cursor?: string,
  ): Promise<{ items: QuizCardDto[]; hasMore: boolean; nextCursor: string | null }> {
    return this.listService.listForPage(userId, limit, cursor);
  }

  listForStudentPage(
    viewerId: string,
    studentId: string,
    limit?: number,
    cursor?: string,
  ): Promise<{ items: StudentQuizCardDto[]; hasMore: boolean; nextCursor: string | null }> {
    return this.listService.listForStudentPage(viewerId, studentId, limit, cursor);
  }

  detailFor(userId: string, quizId: string): Promise<QuizDetailDto> {
    return this.detailService.detailFor(userId, quizId);
  }
}
