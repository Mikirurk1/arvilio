import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@soenglish/module-auth';
import { FlashcardsModule } from '@soenglish/module-flashcards';
import { LessonsModule } from '@soenglish/module-lessons';
import { ProgressModule } from '@soenglish/module-progress';
import { VocabularyModule } from '@soenglish/module-vocabulary';

@Module({
  imports: [
    AuthModule,
    VocabularyModule,
    FlashcardsModule,
    LessonsModule,
    ProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
