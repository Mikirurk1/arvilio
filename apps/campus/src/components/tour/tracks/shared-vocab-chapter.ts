import type { TourChapter } from './types';

/**
 * Shared soft chapter for student / teacher / admin (and super_admin → admin track).
 * No auto-redirect — card spotlights where to click (Practice nav → Vocabulary card → Add word).
 * Dictionary lookup autofill; saving is optional via soft-skip.
 */
export const SHARED_VOCAB_ADD_CHAPTER: TourChapter = {
  id: 'shared-ch-vocab-add',
  title: 'Add words with lookup',
  body: 'Open Vocabulary from Practice, find Add word, type an English word — dictionary lookup fills the card. Saving is optional.',
  area: 'Vocabulary',
  pose: 'encourage',
  steps: [
    {
      id: 'shared-ch-vocab-open-practice',
      level: 'B',
      title: 'Open Practice',
      body: 'Click Practice in the sidebar — that’s the path to Vocabulary.',
      area: 'Add words',
      navHref: '/practice',
      pose: 'point',
      sfx: 'click',
      softSkipLabel: 'Skip for now',
      requiresAction: {
        id: 'shared-ch-vocab-open-practice',
        hint: 'Click Practice in the sidebar.',
        detects: [{ kind: 'pathname', value: '/practice', match: 'startsWith' }],
      },
      uaIntent: 'Клік Practice в сайдбарі',
    },
    {
      id: 'shared-ch-vocab-open',
      level: 'B',
      title: 'Open Vocabulary',
      body: 'Click the Vocabulary card on the Practice hub.',
      area: 'Add words',
      navHref: '/practice',
      anchorId: 'practice-card-vocabulary',
      pose: 'encourage',
      sfx: 'encourage',
      softSkipLabel: 'Skip for now',
      requiresAction: {
        id: 'shared-ch-vocab-open',
        hint: 'Click the Vocabulary card.',
        detects: [
          { kind: 'pathname', value: '/vocabulary', match: 'startsWith' },
          { kind: 'pathname', value: '/practice/vocabulary', match: 'startsWith' },
        ],
      },
      uaIntent: 'Клік картки Vocabulary',
    },
    {
      id: 'shared-ch-vocab-add-bar',
      level: 'B',
      title: 'Find Add word',
      body: 'The Add word bar looks up English words in the dictionary and autofills the card.',
      area: 'Add words',
      navHref: '/vocabulary',
      anchorId: 'vocab-add-word',
      pose: 'point',
      sfx: 'click',
      softSkipLabel: 'Skip for now',
      requiresAction: {
        id: 'shared-ch-vocab-add-bar',
        hint: 'Find the Add word bar on Vocabulary.',
        detects: [{ kind: 'selector', value: '[data-tour-anchor="vocab-add-word"]' }],
      },
      uaIntent: 'Поле Add word',
    },
    {
      id: 'shared-ch-vocab-lookup',
      level: 'B',
      title: 'Lookup autofill',
      body: 'Type an English word and submit — dictionary lookup autofills translation and details. Soft-skip if you only want to peek.',
      area: 'Add words',
      navHref: '/vocabulary',
      anchorId: 'vocab-add-word',
      pose: 'encourage',
      sfx: 'encourage',
      softSkipLabel: 'Skip for now',
      requiresAction: {
        id: 'shared-ch-vocab-lookup',
        hint: 'Type a word and look it up (dictionary autofill).',
        detects: [
          { kind: 'event', value: 'vocab_lookup_ok' },
          { kind: 'event', value: 'vocab_word_added' },
        ],
      },
      uaIntent: 'Dictionary lookup autofill',
    },
  ],
};
