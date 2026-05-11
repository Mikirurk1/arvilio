import { createCardSpec } from '@soenglish/shared-ui';
import { VocabularyOverviewDto } from '@soenglish/shared-types';

export type VocabularyOverview = VocabularyOverviewDto;

const fallbackOverview: VocabularyOverview = {
  totalWords: 1200,
  masteredWords: 240,
  dueToday: 32,
};

export const vocabularyOverviewCard = createCardSpec(
  'Vocabulary',
  'Server-fetched overview for the learner dashboard',
);

export async function getVocabularyOverview(): Promise<VocabularyOverview> {
  const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://api:3000/api';

  try {
    const response = await fetch(`${baseUrl}/vocabulary/overview`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return fallbackOverview;
    }

    return (await response.json()) as VocabularyOverview;
  } catch {
    return fallbackOverview;
  }
}
