import { Controller, Get, Module } from '@nestjs/common';
import { VocabularyOverviewDto, VocabularyWordDto } from '@soenglish/shared-types';

/** Mock “mastered” ids — global catalog has no per-user status; overview uses this until profile progress exists in API. */
const mockOverviewKnownWordIds = new Set<number>([3, 8, 10]);

const vocabularyWords: VocabularyWordDto[] = [
  {
    id: 1,
    word: 'Eloquent',
    phonetic: '/ˈɛl.ə.kwənt/',
    pos: 'adjective',
    definition: 'Fluent and persuasive in speaking or writing; able to express ideas clearly.',
    example: 'She delivered an eloquent speech that moved the entire audience.',
    category: 'communication',
  },
  {
    id: 2,
    word: 'Leverage',
    phonetic: '/ˈlev.ər.ɪdʒ/',
    pos: 'verb / noun',
    definition: 'Use something to maximum advantage; the power to influence.',
    example: 'We need to leverage our existing network to grow the business.',
    category: 'business',
  },
  {
    id: 3,
    word: 'Concise',
    phonetic: '/kənˈsaɪs/',
    pos: 'adjective',
    definition: 'Giving a lot of information clearly and in a few words.',
    example: 'Please be concise - we only have five minutes for your presentation.',
    category: 'communication',
  },
  {
    id: 4,
    word: 'Ambiguous',
    phonetic: '/æmˈbɪɡ.ju.əs/',
    pos: 'adjective',
    definition: 'Open to more than one interpretation; not having one obvious meaning.',
    example: 'The contract terms were ambiguous, leading to a legal dispute.',
    category: 'communication',
  },
  {
    id: 5,
    word: 'Coherent',
    phonetic: '/kəʊˈhɪər.ənt/',
    pos: 'adjective',
    definition: 'Logical and consistent; forming a unified whole.',
    example: 'Her argument was coherent and well-supported by evidence.',
    category: 'communication',
  },
  {
    id: 6,
    word: 'Equity',
    phonetic: '/ˈek.wɪ.ti/',
    pos: 'noun',
    definition: 'The value of shares issued by a company; fairness and justice.',
    example: 'The startup raised $2M in equity funding from venture capitalists.',
    category: 'finance',
  },
  {
    id: 7,
    word: 'Yield',
    phonetic: '/jiːld/',
    pos: 'noun / verb',
    definition: 'The income return on an investment; to produce or provide.',
    example: 'The bond yield dropped after the central bank cut interest rates.',
    category: 'finance',
  },
  {
    id: 8,
    word: 'Portfolio',
    phonetic: '/pɔːtˈfəʊ.li.əʊ/',
    pos: 'noun',
    definition: 'A range of investments held by a person or organization.',
    example: 'Diversifying your portfolio reduces risk during market volatility.',
    category: 'finance',
  },
  {
    id: 9,
    word: 'Deliberate',
    phonetic: '/dɪˈlɪb.ər.ət/',
    pos: 'adjective / verb',
    definition: 'Done consciously and intentionally; to think carefully about.',
    example: 'Her deliberate approach to problem-solving impressed the team.',
    category: 'general',
  },
  {
    id: 10,
    word: 'Facilitate',
    phonetic: '/fəˈsɪl.ɪ.teɪt/',
    pos: 'verb',
    definition: 'Make an action or process easy or easier.',
    example: 'Good leadership facilitates open communication within teams.',
    category: 'business',
  },
  {
    id: 11,
    word: 'Nuance',
    phonetic: '/ˈnjuː.ɑːns/',
    pos: 'noun',
    definition: 'A subtle difference in meaning, expression, or sound.',
    example: 'Understanding cultural nuances is essential for global business.',
    category: 'communication',
  },
  {
    id: 12,
    word: 'Pivotal',
    phonetic: '/ˈpɪv.ə.təl/',
    pos: 'adjective',
    definition: 'Of crucial importance in relation to the development of something.',
    example: 'This meeting is pivotal for the future of our partnership.',
    category: 'general',
  },
];

@Controller('vocabulary')
export class VocabularyController {
  @Get('overview')
  getOverview(): VocabularyOverviewDto {
    return {
      totalWords: vocabularyWords.length,
      masteredWords: vocabularyWords.filter((word) => mockOverviewKnownWordIds.has(word.id)).length,
      dueToday: vocabularyWords.filter((word) => !mockOverviewKnownWordIds.has(word.id)).length,
    };
  }

  @Get('words')
  getWords(): VocabularyWordDto[] {
    return vocabularyWords;
  }
}

@Module({
  controllers: [VocabularyController],
})
export class VocabularyModule {}
