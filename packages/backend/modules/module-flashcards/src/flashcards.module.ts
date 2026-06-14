import { Module } from '@nestjs/common';
import { PrismaModule } from '@be/prisma';
import { QuizAccessService } from './application/quiz-access.service';
import { QuizAttemptService } from './application/quiz-attempt.service';
import { QuizDetailService } from './application/quiz-detail.service';
import { QuizDistractorService } from './application/quiz-distractor.service';
import { QuizGenerateService } from './application/quiz-generate.service';
import { QuizGeneratorService } from './application/quiz-generator.service';
import { QuizListService } from './application/quiz-list.service';
import { QuizRepository } from './infrastructure/quiz.repository';
import { QuizzesResolver } from './presentation/graphql/quizzes.resolver';
import { QuizController } from './presentation/rest/quiz.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController],
  providers: [
    QuizRepository,
    QuizAccessService,
    QuizListService,
    QuizDetailService,
    QuizDistractorService,
    QuizGenerateService,
    QuizAttemptService,
    QuizGeneratorService,
    QuizzesResolver,
  ],
  exports: [QuizGeneratorService, QuizzesResolver],
})
export class FlashcardsModule {}
