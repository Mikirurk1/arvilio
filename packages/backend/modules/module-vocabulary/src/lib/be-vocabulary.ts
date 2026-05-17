import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '@soenglish/data-access-prisma';
import { AuthGuard, CurrentUser } from '@soenglish/module-auth';
import type {
  CreateStudentWordCardRequestDto,
  CreateWordRequestDto,
  StudentWordCardDto,
  VocabularyOverviewDto,
  WordCardDto,
  WordDefinitionDto,
  WordDetailsDto,
  WordLookupResultDto,
} from '@soenglish/shared-types';
import { DatamuseProvider } from './datamuse.provider';
import {
  coerceDictionaryEntries,
  extractMeaningGroups,
  DictionaryService,
} from './dictionary.service';
import { TranslationService } from './translation.service';
import { assertEnglishLemma } from './word-text.util';
import { PlatformSettingsService } from './platform-settings.service';
import { containsHtml } from './strip-html.util';
import type { EnrichedWordData } from './word-enrichment.service';
import { WordEnrichmentService } from './word-enrichment.service';

function dictionaryPayloadFromSource(sourcePayload?: unknown): unknown {
  if (!sourcePayload || typeof sourcePayload !== 'object') return null;
  const sp = sourcePayload as { dictionary?: unknown; dictionaryapi?: unknown };
  return sp.dictionary ?? sp.dictionaryapi ?? null;
}

const wordInclude = {
  definitions: {
    select: {
      id: true,
      languageId: true,
      text: true,
      lemmaText: true,
      partOfSpeech: true,
      language: { select: { code: true } },
    },
  },
} as const;

type WordRow = {
  id: string;
  text: string;
  definition: string;
  example: string | null;
  phonetic: string | null;
  partOfSpeech: string | null;
  category: string | null;
  audioUrl: string | null;
  origin: string | null;
  synonyms: string[];
  antonyms: string[];
  source: string | null;
  sourcePayload?: unknown;
  definitions: WordDefinitionDto[];
};

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function mapWordRow(word: WordRow): WordCardDto {
  const definitions =
    word.definitions.length > 0
      ? word.definitions.map((d) => ({
          languageId: d.languageId,
          text: d.text,
          lemmaText: d.lemmaText ?? null,
          partOfSpeech: d.partOfSpeech || undefined,
        }))
      : [{ languageId: 'en', text: word.definition, lemmaText: null }];
  return {
    id: word.id,
    text: word.text,
    definition: word.definition,
    definitions,
    example: word.example,
    phonetic: word.phonetic,
    partOfSpeech: word.partOfSpeech,
    category: word.category,
    audioUrl: word.audioUrl,
    origin: word.origin,
    synonyms: word.synonyms,
    antonyms: word.antonyms,
    source: word.source,
  };
}

function statusToDto(status: 'NEW' | 'REPEATED' | 'MISTAKES_WORK' | 'LEARNED'): StudentWordCardDto['status'] {
  return status.toLowerCase() as StudentWordCardDto['status'];
}

function statusFromDto(status: StudentWordCardDto['status']): 'NEW' | 'REPEATED' | 'MISTAKES_WORK' | 'LEARNED' {
  return status.toUpperCase() as 'NEW' | 'REPEATED' | 'MISTAKES_WORK' | 'LEARNED';
}

@Injectable()
export class VocabularyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enrichment: WordEnrichmentService,
    private readonly translation: TranslationService,
  ) {}

  async lookupWord(text: string): Promise<WordLookupResultDto> {
    const trimmed = text.trim();
    assertEnglishLemma(trimmed);
    const normalizedText = normalize(trimmed);
    const existing = await this.prisma.word.findUnique({
      where: { normalizedText },
      include: wordInclude,
    });
    if (existing) {
      await this.backfillTranslations(existing);
      const refreshed = await this.prisma.word.findUnique({
        where: { normalizedText },
        include: wordInclude,
      });
      const word = mapWordRow(refreshed!);
      return { foundInDb: true, foundInDictionary: true, word, preview: word };
    }
    const enriched = await this.enrichment.enrich(trimmed);
    if (!enriched.dictionaryFound) {
      return { foundInDb: false, foundInDictionary: false, word: null, preview: null };
    }
    const preview = previewFromEnriched(enriched);
    return {
      foundInDb: false,
      foundInDictionary: true,
      word: null,
      preview,
    };
  }

  async getWordDetails(id: string): Promise<WordDetailsDto> {
    const word = await this.prisma.word.findUnique({
      where: { id },
      include: wordInclude,
    });
    if (!word) throw new NotFoundException('Word not found');
    await this.backfillMissingLemmaTexts(word);
    await this.backfillTranslations(word);
    const refreshed = await this.prisma.word.findUnique({
      where: { id },
      include: wordInclude,
    });
    const card = mapWordRow(refreshed!);
    const payload = refreshed!.sourcePayload;
    return {
      ...card,
      sourcePayloadJson:
        payload === null || payload === undefined
          ? null
          : typeof payload === 'string'
            ? payload
            : JSON.stringify(payload),
    };
  }

  private isUsableGloss(text?: string | null, lemmaText?: string | null): boolean {
    const ok = (value?: string | null) => {
      const t = value?.trim();
      return Boolean(t && t !== '—' && t !== '-');
    };
    return ok(text) || ok(lemmaText);
  }

  private hasNativeGloss(
    word: {
      definitions: Array<{
        text: string;
        lemmaText: string | null;
        language: { code: string };
      }>;
    },
  ): boolean {
    return word.definitions.some(
      (d) => d.language.code !== 'en' && this.isUsableGloss(d.text, d.lemmaText),
    );
  }

  private needsHtmlCleanup(word: { definition: string; definitions: Array<{ text: string }> }): boolean {
    if (containsHtml(word.definition)) return true;
    return word.definitions.some((d) => containsHtml(d.text));
  }

  private needsMultiPosBackfill(
    word: {
      sourcePayload?: unknown;
      definitions: Array<{ partOfSpeech: string }>;
    },
  ): boolean {
    const groups = extractMeaningGroups(
      coerceDictionaryEntries(dictionaryPayloadFromSource(word.sourcePayload)),
    );
    if (groups.length <= 1) return false;

    const existingPos = new Set(
      word.definitions.map((d) => (d.partOfSpeech || '').toLowerCase()),
    );
    return !groups.every((g) => existingPos.has(g.partOfSpeech.toLowerCase()));
  }

  /** Re-enrich when native glosses or per-POS rows are missing. */
  private async backfillTranslations(
    word: {
      id: string;
      text: string;
      definition: string;
      sourcePayload?: unknown;
      definitions: Array<{
        partOfSpeech: string;
        text: string;
        lemmaText: string | null;
        language: { code: string };
      }>;
    },
  ): Promise<void> {
    if (this.needsHtmlCleanup(word)) {
      const enriched = await this.enrichment.enrich(word.text);
      await this.persistEnrichedWord(word.id, enriched);
      return;
    }

    const hasNative = this.hasNativeGloss(word);
    const needsMultiPos = this.needsMultiPosBackfill(word);
    const legacyRows = word.definitions.every((d) => !d.partOfSpeech?.trim());

    if (hasNative && !needsMultiPos && !legacyRows) return;

    if (hasNative && !needsMultiPos && legacyRows) {
      const enriched = await this.enrichment.enrich(word.text);
      const newGroups = extractMeaningGroups(
        coerceDictionaryEntries(dictionaryPayloadFromSource(enriched.sourcePayload)),
      );
      if (newGroups.length <= 1) return;
      await this.persistEnrichedWord(word.id, enriched);
      return;
    }

    if (!hasNative || needsMultiPos) {
      const enriched = await this.enrichment.enrich(word.text);
      await this.persistEnrichedWord(word.id, enriched);
    }
  }

  private async persistEnrichedWord(wordId: string, enriched: EnrichedWordData): Promise<void> {
    await this.persistEnrichedDefinitions(wordId, enriched);
  }

  private async persistEnrichedDefinitions(
    wordId: string,
    enriched: Pick<EnrichedWordData, 'definitions' | 'sourcePayload' | 'definition' | 'example' | 'phonetic' | 'partOfSpeech' | 'category' | 'audioUrl' | 'origin' | 'synonyms' | 'antonyms' | 'source'>,
  ): Promise<void> {
    const { definitions, sourcePayload } = enriched;
    await this.prisma.$transaction(async (tx) => {
      for (const d of definitions) {
        const partOfSpeech = d.partOfSpeech ?? '';
        await tx.wordDefinition.upsert({
          where: {
            wordId_languageId_partOfSpeech: {
              wordId,
              languageId: d.languageId,
              partOfSpeech,
            },
          },
          create: {
            wordId,
            languageId: d.languageId,
            text: d.text,
            lemmaText: d.lemmaText ?? null,
            partOfSpeech,
          },
          update: {
            text: d.text,
            lemmaText: d.lemmaText ?? null,
          },
        });
      }
      await tx.word.update({
        where: { id: wordId },
        data: {
          definition: enriched.definition,
          example: enriched.example,
          phonetic: enriched.phonetic,
          partOfSpeech: enriched.partOfSpeech,
          category: enriched.category,
          audioUrl: enriched.audioUrl,
          origin: enriched.origin,
          synonyms: enriched.synonyms,
          antonyms: enriched.antonyms,
          source: enriched.source,
          sourcePayload,
        },
      });
    });
  }

  /** Fills lemmaText for legacy rows that only have translated definitions. */
  private async backfillMissingLemmaTexts(
    word: { id: string; text: string; definitions: Array<{ id: string; languageId: string; lemmaText: string | null; language: { code: string } }> },
  ): Promise<void> {
    const missing = word.definitions.filter(
      (d) => d.language.code !== 'en' && !d.lemmaText?.trim(),
    );
    if (missing.length === 0) return;

    await Promise.all(
      missing.map(async (row) => {
        const lemmaText = await this.translation.translate(word.text, 'en', row.language.code);
        if (!lemmaText) return;
        await this.prisma.wordDefinition.update({
          where: { id: row.id },
          data: { lemmaText },
        });
      }),
    );
  }

  async findOrCreateWord(input: CreateWordRequestDto): Promise<WordCardDto> {
    const text = input.text.trim();
    assertEnglishLemma(text);
    const normalizedText = normalize(text);
    const existing = await this.prisma.word.findUnique({
      where: { normalizedText },
      include: wordInclude,
    });
    if (existing) return mapWordRow(existing);

    const overrides: Partial<import('./word-enrichment.service').EnrichedWordData> = {};
    if (input.definition?.trim()) overrides.definition = input.definition.trim();
    if (input.example !== undefined) overrides.example = input.example;
    if (input.phonetic !== undefined) overrides.phonetic = input.phonetic;
    if (input.partOfSpeech !== undefined) overrides.partOfSpeech = input.partOfSpeech;
    if (input.category !== undefined) overrides.category = input.category;
    const enriched = await this.enrichment.enrich(text, overrides);
    const hasManualDefinition = Boolean(input.definition?.trim());
    if (!enriched.dictionaryFound && !hasManualDefinition) {
      throw new NotFoundException(`No dictionary entry found for "${text}".`);
    }

    const word = await this.prisma.$transaction(async (tx) => {
      const created = await tx.word.create({
        data: {
          text: enriched.text,
          normalizedText: enriched.normalizedText,
          definition: enriched.definition,
          example: enriched.example,
          phonetic: enriched.phonetic,
          partOfSpeech: enriched.partOfSpeech,
          category: enriched.category,
          audioUrl: enriched.audioUrl,
          origin: enriched.origin,
          synonyms: enriched.synonyms,
          antonyms: enriched.antonyms,
          source: enriched.source,
          sourcePayload: enriched.sourcePayload,
        },
      });
      const definitionRows = enriched.definitions;
      if (definitionRows.length > 0) {
        await tx.wordDefinition.createMany({
          data: definitionRows.map((d) => ({
            wordId: created.id,
            languageId: d.languageId,
            text: d.text,
            lemmaText: d.lemmaText ?? null,
            partOfSpeech: d.partOfSpeech ?? '',
          })),
        });
      }
      return tx.word.findUniqueOrThrow({
        where: { id: created.id },
        include: wordInclude,
      });
    });
    return mapWordRow(word);
  }

  async listWordsByIds(ids: string[]): Promise<WordCardDto[]> {
    if (ids.length === 0) return [];
    const words = await this.prisma.word.findMany({
      where: { id: { in: ids } },
      include: wordInclude,
    });
    const byId = new Map(words.map((w) => [w.id, mapWordRow(w)]));
    return ids.map((id) => byId.get(id)).filter((w): w is WordCardDto => Boolean(w));
  }

  async listWords(params: { search?: string; category?: string; take?: number }): Promise<WordCardDto[]> {
    const take = Math.min(Math.max(params.take ?? 100, 1), 500);
    const where: Record<string, unknown> = {};
    if (params.search) {
      const search = params.search.trim();
      where['OR'] = [
        { text: { contains: search, mode: 'insensitive' } },
        { definition: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (params.category) where['category'] = params.category;
    const words = await this.prisma.word.findMany({
      where,
      orderBy: { text: 'asc' },
      take,
      include: wordInclude,
    });
    return words.map(mapWordRow);
  }

  async listStudentCards(userId: string): Promise<StudentWordCardDto[]> {
    let cards = await this.prisma.studentWordCard.findMany({
      where: { userId },
      include: { word: { include: wordInclude } },
      orderBy: { createdAt: 'desc' },
    });

    const needsBackfill = cards.filter((c) => !this.hasNativeGloss(c.word));
    if (needsBackfill.length > 0) {
      await Promise.all(needsBackfill.map((c) => this.backfillTranslations(c.word)));
      cards = await this.prisma.studentWordCard.findMany({
        where: { userId },
        include: { word: { include: wordInclude } },
        orderBy: { createdAt: 'desc' },
      });
    }

    return cards.map((card) => ({
      id: card.id,
      word: mapWordRow(card.word),
      status: statusToDto(card.status),
      masteryLevel: card.masteryLevel,
      lessonId: card.lessonId,
      firstSeenAt: card.firstSeenAt?.toISOString() ?? null,
      lastReviewedAt: card.lastReviewedAt?.toISOString() ?? null,
      nextReviewAt: card.nextReviewAt?.toISOString() ?? null,
      knownAt: card.knownAt?.toISOString() ?? null,
    }));
  }

  async createStudentCard(
    studentUserId: string,
    actorUserId: string,
    body: CreateStudentWordCardRequestDto,
  ): Promise<StudentWordCardDto> {
    const word = await this.findOrCreateWord({ text: body.text });
    const existing = await this.prisma.studentWordCard.findUnique({
      where: { userId_wordId: { userId: studentUserId, wordId: word.id } },
    });
    if (existing) {
      return this.statusUpdate(studentUserId, existing.id, body.status ?? 'new', actorUserId);
    }
    const created = await this.prisma.studentWordCard.create({
      data: {
        userId: studentUserId,
        wordId: word.id,
        lessonId: body.lessonId ?? null,
        status: statusFromDto(body.status ?? 'new'),
        firstSeenAt: new Date(),
      },
      include: { word: { include: wordInclude } },
    });
    return {
      id: created.id,
      word: mapWordRow(created.word),
      status: statusToDto(created.status),
      masteryLevel: created.masteryLevel,
      lessonId: created.lessonId,
      firstSeenAt: created.firstSeenAt?.toISOString() ?? null,
      lastReviewedAt: created.lastReviewedAt?.toISOString() ?? null,
      nextReviewAt: created.nextReviewAt?.toISOString() ?? null,
      knownAt: created.knownAt?.toISOString() ?? null,
    };
  }

  async statusUpdate(
    studentUserId: string,
    cardId: string,
    status: StudentWordCardDto['status'],
    actorUserId: string,
  ): Promise<StudentWordCardDto> {
    const card = await this.prisma.studentWordCard.findUnique({ where: { id: cardId } });
    if (!card || card.userId !== studentUserId) throw new NotFoundException('Card not found');
    const next = statusFromDto(status);
    const updated = await this.prisma.studentWordCard.update({
      where: { id: cardId },
      data: {
        status: next,
        lastReviewedAt: new Date(),
        knownAt: next === 'LEARNED' ? new Date() : null,
        knownByTeacherId: next === 'LEARNED' ? actorUserId : null,
      },
      include: { word: { include: wordInclude } },
    });
    return {
      id: updated.id,
      word: mapWordRow(updated.word),
      status: statusToDto(updated.status),
      masteryLevel: updated.masteryLevel,
      lessonId: updated.lessonId,
      firstSeenAt: updated.firstSeenAt?.toISOString() ?? null,
      lastReviewedAt: updated.lastReviewedAt?.toISOString() ?? null,
      nextReviewAt: updated.nextReviewAt?.toISOString() ?? null,
      knownAt: updated.knownAt?.toISOString() ?? null,
    };
  }

  async deleteStudentCard(
    actorUserId: string,
    studentUserId: string,
    cardId: string,
  ): Promise<boolean> {
    const card = await this.prisma.studentWordCard.findUnique({ where: { id: cardId } });
    if (!card || card.userId !== studentUserId) {
      throw new NotFoundException('Card not found');
    }
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { role: true },
    });
    if (!actor || actor.role === 'STUDENT') {
      throw new ForbiddenException('Students cannot delete vocabulary cards');
    }
    if (actorUserId !== studentUserId) {
      await this.assertStaffCanManageStudent(actorUserId, studentUserId);
    }
    await this.prisma.$transaction([
      this.prisma.reviewQueue.deleteMany({
        where: { userId: studentUserId, wordId: card.wordId },
      }),
      this.prisma.studentWordCard.delete({ where: { id: cardId } }),
    ]);
    return true;
  }

  private async requireStaff(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role === 'STUDENT') {
      throw new ForbiddenException('This action requires teacher, admin, or super admin role');
    }
  }

  private async assertStaffCanManageStudent(
    actorUserId: string,
    studentUserId: string,
  ): Promise<void> {
    await this.requireStaff(actorUserId);
    const viewer = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { role: true },
    });
    const student = await this.prisma.user.findUnique({
      where: { id: studentUserId },
      select: { role: true, teacherId: true },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }
    if (viewer?.role === 'ADMIN' || viewer?.role === 'SUPER_ADMIN') return;
    if (viewer?.role === 'TEACHER' && student.teacherId === actorUserId) return;
    throw new ForbiddenException('You can only manage vocabulary for your students');
  }

  async overviewFor(userId: string): Promise<VocabularyOverviewDto> {
    const [total, mastered, dueRows] = await Promise.all([
      this.prisma.studentWordCard.count({ where: { userId } }),
      this.prisma.studentWordCard.count({ where: { userId, status: 'LEARNED' } }),
      this.prisma.studentWordCard.findMany({
        where: { userId, OR: [{ status: 'NEW' }, { status: 'MISTAKES_WORK' }] },
        select: { id: true },
      }),
    ]);
    return { totalWords: total, masteredWords: mastered, dueToday: dueRows.length };
  }
}

@Controller('vocabulary')
@UseGuards(AuthGuard)
export class VocabularyController {
  constructor(private readonly vocabulary: VocabularyService) {}

  @Get('overview')
  async overview(@CurrentUser() userId: string): Promise<VocabularyOverviewDto> {
    return this.vocabulary.overviewFor(userId);
  }

  @Get('words')
  async words(
    @Query('search') search: string | undefined,
    @Query('category') category: string | undefined,
    @Query('take') take: string | undefined,
  ): Promise<WordCardDto[]> {
    return this.vocabulary.listWords({
      search,
      category,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('words/lookup')
  async lookupWord(@Query('text') text: string | undefined): Promise<WordLookupResultDto> {
    if (!text?.trim()) throw new BadRequestException('text query is required');
    return this.vocabulary.lookupWord(text);
  }

  @Get('words/:id/details')
  async wordDetails(@Param('id') id: string): Promise<WordDetailsDto> {
    return this.vocabulary.getWordDetails(id);
  }

  @Post('words')
  async createWord(@Body() body: CreateWordRequestDto): Promise<WordCardDto> {
    return this.vocabulary.findOrCreateWord(body);
  }

  @Get('cards')
  async myCards(@CurrentUser() userId: string): Promise<StudentWordCardDto[]> {
    return this.vocabulary.listStudentCards(userId);
  }

  @Post('cards')
  async addCard(
    @CurrentUser() userId: string,
    @Body() body: CreateStudentWordCardRequestDto,
  ): Promise<StudentWordCardDto> {
    return this.vocabulary.createStudentCard(userId, userId, body);
  }

  @Patch('cards/:id/status')
  async updateCardStatus(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: { status: StudentWordCardDto['status'] },
  ): Promise<StudentWordCardDto> {
    if (!body?.status) throw new BadRequestException('status is required');
    return this.vocabulary.statusUpdate(userId, id, body.status, userId);
  }
}

@Controller('students')
@UseGuards(AuthGuard)
export class StudentVocabularyController {
  constructor(private readonly vocabulary: VocabularyService) {}

  @Get(':studentId/vocabulary')
  async listStudentCards(@Param('studentId') studentId: string): Promise<StudentWordCardDto[]> {
    return this.vocabulary.listStudentCards(studentId);
  }

  @Post(':studentId/vocabulary')
  async addStudentCard(
    @CurrentUser() actorId: string,
    @Param('studentId') studentId: string,
    @Body() body: CreateStudentWordCardRequestDto,
  ): Promise<StudentWordCardDto> {
    return this.vocabulary.createStudentCard(studentId, actorId, body);
  }

  @Patch(':studentId/vocabulary/:cardId/status')
  async updateStudentCard(
    @CurrentUser() actorId: string,
    @Param('studentId') studentId: string,
    @Param('cardId') cardId: string,
    @Body() body: { status: StudentWordCardDto['status'] },
  ): Promise<StudentWordCardDto> {
    if (!body?.status) throw new BadRequestException('status is required');
    return this.vocabulary.statusUpdate(studentId, cardId, body.status, actorId);
  }
}

function previewFromEnriched(enriched: import('./word-enrichment.service').EnrichedWordData): WordCardDto {
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
  };
}

@Module({
  controllers: [VocabularyController, StudentVocabularyController],
  providers: [
    VocabularyService,
    DictionaryService,
    PlatformSettingsService,
    DatamuseProvider,
    TranslationService,
    WordEnrichmentService,
  ],
  exports: [VocabularyService, DictionaryService, PlatformSettingsService, WordEnrichmentService],
})
export class VocabularyModule {}
