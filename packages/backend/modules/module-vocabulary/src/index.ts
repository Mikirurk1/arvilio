export * from './vocabulary.module';
export { VocabularyService } from './application/vocabulary.service';
export { PlatformSettingsService } from './application/platform-settings.service';
export { PlatformIntegrationService } from './application/platform-integration/platform-integration.service';
export {
  getPlatformIntegrationRuntime,
  setPlatformIntegrationRuntime,
} from './application/platform-integration';
export { DictionaryService } from './application/dictionary.service';
export { WordEnrichmentService } from './application/word-enrichment.service';
export { TranslationService } from './application/translation.service';
