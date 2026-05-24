import { resolveVerbForms } from '@pkg/types';
import type { WordCardDto } from '@pkg/types';
import type { EnrichedWordData } from './word-enrichment.service';

export function previewFromEnriched(enriched: EnrichedWordData): WordCardDto {
  return {
    id: 'preview',
    text: enriched.text,
    definition: enriched.definition,
    definitions: enriched.definitions,
    example: enriched.example,
    phonetic: enriched.phonetic,
    partOfSpeech: enriched.partOfSpeech,
    category: enriched.category,
    audioUrl: enriched.audioUrl,
    origin: enriched.origin,
    synonyms: enriched.synonyms,
    antonyms: enriched.antonyms,
    source: enriched.source,
    verbForms: resolveVerbForms(enriched.text, enriched.partOfSpeech, enriched.definitions),
  };
}
