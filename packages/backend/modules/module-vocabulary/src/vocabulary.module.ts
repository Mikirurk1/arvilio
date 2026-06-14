import { Module } from '@nestjs/common';
import { MailModule } from '@be/mail';
import { PrismaModule } from '@be/prisma';
import { DictionaryService } from './application/dictionary.service';
import { PlatformIntegrationService } from './application/platform-integration/platform-integration.service';
import { PlatformSettingsService } from './application/platform-settings.service';
import { TranslationService } from './application/translation.service';
import { VocabularyService } from './application/vocabulary.service';
import { WordEnrichmentService } from './application/word-enrichment.service';
import { DatamuseProvider } from './infrastructure/datamuse.provider';
import { StudentVocabularyController } from './presentation/rest/student-vocabulary.controller';
import { VocabularyController } from './presentation/rest/vocabulary.controller';
import { SystemResolver } from './presentation/graphql/system.resolver';
import { VocabularyResolver } from './presentation/graphql/vocabulary.resolver';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [VocabularyController, StudentVocabularyController],
  providers: [
    VocabularyService,
    DictionaryService,
    PlatformSettingsService,
    PlatformIntegrationService,
    DatamuseProvider,
    TranslationService,
    WordEnrichmentService,
    VocabularyResolver,
    SystemResolver,
  ],
  exports: [
    VocabularyService,
    DictionaryService,
    PlatformSettingsService,
    PlatformIntegrationService,
    WordEnrichmentService,
    TranslationService,
    VocabularyResolver,
    SystemResolver,
  ],
})
export class VocabularyModule {}
