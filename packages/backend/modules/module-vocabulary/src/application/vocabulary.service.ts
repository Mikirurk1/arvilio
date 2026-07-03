import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, TenantPrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';
import type {
  CreateStudentWordCardRequestDto,
  CreateWordRequestDto,
  StudentWordCardDto,
  VocabularyOverviewDto,
  WordCardDto,
  WordDetailsDto,
  WordLookupResultDto,
} from '@pkg/types';
import { coerceDictionaryEntries, extractMeaningGroups } from './dictionary.service';
import { TranslationService } from './translation.service';
import { assertEnglishLemma, normalizeVocabularyText } from '../shared/word-text.util';
import { containsHtml } from '../domain/strip-html.util';
import type { EnrichedWordData } from './word-enrichment.service';
import { WordEnrichmentService } from './word-enrichment.service';
import {
  decodeCardCursor,
  dictionaryPayloadFromSource,
  encodeCardCursor,
  mapStudentCardDto,
  mapWordRow,
  normalizeLemmaText,
  statusFromDto,
  statusToDto,
  type VocabularyStudentCardRow,
} from '../shared/vocabulary-map.util';
import {
  assertStaffCanDeleteVocabularyCards,
  vocabularyOverviewFromCounts,
} from '../domain/vocabulary-rbac.util';
import {
  assertStaffCanManageStudentVocabulary,
  assertStaffRole,
} from '../shared/vocabulary-staff-access.util';
import { previewFromEnriched } from './vocabulary-preview.util';

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

type StudentCardRow = VocabularyStudentCardRow;

@Injectable()
export class VocabularyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantPrisma: TenantPrismaService,
    private readonly tenant: TenantContextService,
    private readonly enrichment: WordEnrichmentService,
    private readonly translation: TranslationService,
  ) {}

  /**
   * Tenant-scoped Prisma client (ADR-005). StudentWordCard reads/updates/deletes
   * are auto-filtered by the active school. Word/WordDefinition/User/ReviewQueue
   * are global catalogs (not in TENANT_SCOPED_MODELS) so they pass through
   * untouched. All entry points here run behind auth, so a tenant is in context.
   */
  private get db() {
    return this.tenantPrisma.client;
  }

  async lookupWord(text: string): Promise<WordLookupResultDto> {
    const trimmed = normalizeVocabularyText(text);
    assertEnglishLemma(trimmed);
    const normalizedText = normalizeLemmaText(trimmed);
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
    const text = normalizeVocabularyText(input.text);
    assertEnglishLemma(text);
    const normalizedText = normalizeLemmaText(text);
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

  private async loadStudentCardsRows(
    where: Record<string, unknown>,
    take?: number,
  ): Promise<StudentCardRow[]> {
    let cards = await this.db.studentWordCard.findMany({
      where,
      include: { word: { include: wordInclude } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(take !== undefined ? { take } : {}),
    });
    const needsBackfill = cards.filter((c) => !this.hasNativeGloss(c.word));
    if (needsBackfill.length > 0) {
      await Promise.all(needsBackfill.map((c) => this.backfillTranslations(c.word)));
      cards = await this.db.studentWordCard.findMany({
        where,
        include: { word: { include: wordInclude } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        ...(take !== undefined ? { take } : {}),
      });
    }
    return cards as StudentCardRow[];
  }

  async listStudentCards(
    studentUserId: string,
    actorUserId: string = studentUserId,
  ): Promise<StudentWordCardDto[]> {
    if (actorUserId !== studentUserId) {
      await this.assertStaffCanManageStudent(actorUserId, studentUserId);
    }
    const cards = await this.loadStudentCardsRows({ userId: studentUserId });
    return cards.map((card) => mapStudentCardDto(card));
  }

  async listStudentCardsPage(
    studentUserId: string,
    limit = 25,
    cursor?: string,
    actorUserId: string = studentUserId,
  ): Promise<{
    items: StudentWordCardDto[];
    hasMore: boolean;
    nextCursor: string | null;
  }> {
    if (actorUserId !== studentUserId) {
      await this.assertStaffCanManageStudent(actorUserId, studentUserId);
    }
    const take = Math.min(Math.max(limit, 1), 100);
    const cursorRow = cursor ? decodeCardCursor(cursor) : null;
    const cursorWhere = cursorRow
      ? {
          OR: [
            { createdAt: { lt: cursorRow.createdAt } },
            {
              AND: [{ createdAt: cursorRow.createdAt }, { id: { lt: cursorRow.id } }],
            },
          ],
        }
      : {};

    const cards = await this.loadStudentCardsRows({ userId: studentUserId, ...cursorWhere }, take + 1);
    const hasMore = cards.length > take;
    const page = hasMore ? cards.slice(0, take) : cards;
    const items = page.map((card) => mapStudentCardDto(card));
    const last = page[page.length - 1];
    const nextCursor = hasMore && last ? encodeCardCursor(last) : null;
    return { items, hasMore, nextCursor };
  }

  async createStudentCard(
    studentUserId: string,
    actorUserId: string,
    body: CreateStudentWordCardRequestDto,
  ): Promise<StudentWordCardDto> {
    if (actorUserId !== studentUserId) {
      await this.assertStaffCanManageStudent(actorUserId, studentUserId);
    }
    const word = await this.findOrCreateWord({ text: body.text });
    const existing = await this.db.studentWordCard.findUnique({
      where: { userId_wordId: { userId: studentUserId, wordId: word.id } },
    });
    if (existing) {
      if (body.lessonId && existing.lessonId !== body.lessonId) {
        await this.db.studentWordCard.update({
          where: { id: existing.id },
          data: { lessonId: body.lessonId },
        });
      }
      return this.statusUpdate(studentUserId, existing.id, body.status ?? 'new', actorUserId);
    }
    const created = await this.prisma.studentWordCard.create({
      data: {
        userId: studentUserId,
        schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
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
    if (actorUserId !== studentUserId) {
      await this.assertStaffCanManageStudent(actorUserId, studentUserId);
    }
    const card = await this.db.studentWordCard.findUnique({ where: { id: cardId } });
    if (!card || card.userId !== studentUserId) throw new NotFoundException('Card not found');
    const next = statusFromDto(status);
    const updated = await this.db.studentWordCard.update({
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
    const card = await this.db.studentWordCard.findUnique({ where: { id: cardId } });
    if (!card || card.userId !== studentUserId) {
      throw new NotFoundException('Card not found');
    }
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { role: true },
    });
    assertStaffCanDeleteVocabularyCards(actor?.role);
    if (actorUserId !== studentUserId) {
      await this.assertStaffCanManageStudent(actorUserId, studentUserId);
    }
    await this.db.$transaction([
      this.db.reviewQueue.deleteMany({
        where: { userId: studentUserId, wordId: card.wordId },
      }),
      this.db.studentWordCard.delete({ where: { id: cardId } }),
    ]);
    return true;
  }

  private async requireStaff(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    assertStaffRole(user?.role);
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
    assertStaffCanManageStudentVocabulary(viewer?.role, student, actorUserId);
  }

  async overviewFor(userId: string): Promise<VocabularyOverviewDto> {
    const [total, mastered, dueRows] = await Promise.all([
      this.db.studentWordCard.count({ where: { userId } }),
      this.db.studentWordCard.count({ where: { userId, status: 'LEARNED' } }),
      this.db.studentWordCard.findMany({
        where: { userId, OR: [{ status: 'NEW' }, { status: 'MISTAKES_WORK' }] },
        select: { id: true },
      }),
    ]);
    return vocabularyOverviewFromCounts(total, mastered, dueRows.length);
  }
}

