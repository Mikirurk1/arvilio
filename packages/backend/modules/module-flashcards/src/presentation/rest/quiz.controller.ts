import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from '@be/auth';
import type {
  GenerateQuizRequestDto,
  QuizAttemptResultDto,
  QuizCardDto,
  QuizDetailDto,
  StudentQuizCardDto,
  SubmitQuizAttemptRequestDto,
} from '@pkg/types';
import { QuizGeneratorService } from '../../application/quiz-generator.service';

@Controller('quizzes')
@UseGuards(AuthGuard)
export class QuizController {
  constructor(private readonly quizzes: QuizGeneratorService) {}

  @Get()
  async list(@CurrentUser() userId: string): Promise<QuizCardDto[]> {
    return this.quizzes.listFor(userId);
  }

  @Get('student/:studentId')
  async listForStudent(
    @CurrentUser() userId: string,
    @Param('studentId') studentId: string,
  ): Promise<StudentQuizCardDto[]> {
    return this.quizzes.listForStudent(userId, studentId);
  }

  @Post('generate')
  async generate(
    @CurrentUser() userId: string,
    @Body() body: GenerateQuizRequestDto,
  ): Promise<QuizDetailDto> {
    return this.quizzes.generate(userId, body);
  }

  @Post('submit')
  async submit(
    @CurrentUser() userId: string,
    @Body() body: SubmitQuizAttemptRequestDto,
  ): Promise<QuizAttemptResultDto> {
    return this.quizzes.submitAttempt(userId, body);
  }

  @Get(':id')
  async detail(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<QuizDetailDto> {
    return this.quizzes.detailFor(userId, id);
  }

  @Delete(':id')
  async remove(@CurrentUser() userId: string, @Param('id') id: string): Promise<{ ok: boolean }> {
    const ok = await this.quizzes.delete(userId, id);
    return { ok };
  }
}

