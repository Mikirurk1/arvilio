"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VocabularyModule = exports.StudentVocabularyController = exports.VocabularyController = exports.VocabularyService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const data_access_prisma_1 = require("../../../../data-access/data-access-prisma/src/index.js");
const module_auth_1 = require("../../../module-auth/src/index.js");
const datamuse_provider_1 = require("./datamuse.provider");
const dictionary_service_1 = require("./dictionary.service");
const translation_service_1 = require("./translation.service");
const word_text_util_1 = require("./word-text.util");
const platform_settings_service_1 = require("./platform-settings.service");
const strip_html_util_1 = require("./strip-html.util");
const word_enrichment_service_1 = require("./word-enrichment.service");
function dictionaryPayloadFromSource(sourcePayload) {
    if (!sourcePayload || typeof sourcePayload !== 'object')
        return null;
    const sp = sourcePayload;
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
};
function normalize(text) {
    return text.trim().toLowerCase();
}
function mapWordRow(word) {
    const definitions = word.definitions.length > 0
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
function statusToDto(status) {
    return status.toLowerCase();
}
function statusFromDto(status) {
    return status.toUpperCase();
}
let VocabularyService = class VocabularyService {
    constructor(prisma, enrichment, translation) {
        this.prisma = prisma;
        this.enrichment = enrichment;
        this.translation = translation;
    }
    async lookupWord(text) {
        const trimmed = text.trim();
        (0, word_text_util_1.assertEnglishLemma)(trimmed);
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
            const word = mapWordRow(refreshed);
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
    async getWordDetails(id) {
        const word = await this.prisma.word.findUnique({
            where: { id },
            include: wordInclude,
        });
        if (!word)
            throw new common_1.NotFoundException('Word not found');
        await this.backfillMissingLemmaTexts(word);
        await this.backfillTranslations(word);
        const refreshed = await this.prisma.word.findUnique({
            where: { id },
            include: wordInclude,
        });
        const card = mapWordRow(refreshed);
        const payload = refreshed.sourcePayload;
        return {
            ...card,
            sourcePayloadJson: payload === null || payload === undefined
                ? null
                : typeof payload === 'string'
                    ? payload
                    : JSON.stringify(payload),
        };
    }
    isUsableGloss(text, lemmaText) {
        const ok = (value) => {
            const t = value?.trim();
            return Boolean(t && t !== '—' && t !== '-');
        };
        return ok(text) || ok(lemmaText);
    }
    hasNativeGloss(word) {
        return word.definitions.some((d) => d.language.code !== 'en' && this.isUsableGloss(d.text, d.lemmaText));
    }
    needsHtmlCleanup(word) {
        if ((0, strip_html_util_1.containsHtml)(word.definition))
            return true;
        return word.definitions.some((d) => (0, strip_html_util_1.containsHtml)(d.text));
    }
    needsMultiPosBackfill(word) {
        const groups = (0, dictionary_service_1.extractMeaningGroups)((0, dictionary_service_1.coerceDictionaryEntries)(dictionaryPayloadFromSource(word.sourcePayload)));
        if (groups.length <= 1)
            return false;
        const existingPos = new Set(word.definitions.map((d) => (d.partOfSpeech || '').toLowerCase()));
        return !groups.every((g) => existingPos.has(g.partOfSpeech.toLowerCase()));
    }
    /** Re-enrich when native glosses or per-POS rows are missing. */
    async backfillTranslations(word) {
        if (this.needsHtmlCleanup(word)) {
            const enriched = await this.enrichment.enrich(word.text);
            await this.persistEnrichedWord(word.id, enriched);
            return;
        }
        const hasNative = this.hasNativeGloss(word);
        const needsMultiPos = this.needsMultiPosBackfill(word);
        const legacyRows = word.definitions.every((d) => !d.partOfSpeech?.trim());
        if (hasNative && !needsMultiPos && !legacyRows)
            return;
        if (hasNative && !needsMultiPos && legacyRows) {
            const enriched = await this.enrichment.enrich(word.text);
            const newGroups = (0, dictionary_service_1.extractMeaningGroups)((0, dictionary_service_1.coerceDictionaryEntries)(dictionaryPayloadFromSource(enriched.sourcePayload)));
            if (newGroups.length <= 1)
                return;
            await this.persistEnrichedWord(word.id, enriched);
            return;
        }
        if (!hasNative || needsMultiPos) {
            const enriched = await this.enrichment.enrich(word.text);
            await this.persistEnrichedWord(word.id, enriched);
        }
    }
    async persistEnrichedWord(wordId, enriched) {
        await this.persistEnrichedDefinitions(wordId, enriched);
    }
    async persistEnrichedDefinitions(wordId, enriched) {
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
    async backfillMissingLemmaTexts(word) {
        const missing = word.definitions.filter((d) => d.language.code !== 'en' && !d.lemmaText?.trim());
        if (missing.length === 0)
            return;
        await Promise.all(missing.map(async (row) => {
            const lemmaText = await this.translation.translate(word.text, 'en', row.language.code);
            if (!lemmaText)
                return;
            await this.prisma.wordDefinition.update({
                where: { id: row.id },
                data: { lemmaText },
            });
        }));
    }
    async findOrCreateWord(input) {
        const text = input.text.trim();
        (0, word_text_util_1.assertEnglishLemma)(text);
        const normalizedText = normalize(text);
        const existing = await this.prisma.word.findUnique({
            where: { normalizedText },
            include: wordInclude,
        });
        if (existing)
            return mapWordRow(existing);
        const overrides = {};
        if (input.definition?.trim())
            overrides.definition = input.definition.trim();
        if (input.example !== undefined)
            overrides.example = input.example;
        if (input.phonetic !== undefined)
            overrides.phonetic = input.phonetic;
        if (input.partOfSpeech !== undefined)
            overrides.partOfSpeech = input.partOfSpeech;
        if (input.category !== undefined)
            overrides.category = input.category;
        const enriched = await this.enrichment.enrich(text, overrides);
        const hasManualDefinition = Boolean(input.definition?.trim());
        if (!enriched.dictionaryFound && !hasManualDefinition) {
            throw new common_1.NotFoundException(`No dictionary entry found for "${text}".`);
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
    async listWordsByIds(ids) {
        if (ids.length === 0)
            return [];
        const words = await this.prisma.word.findMany({
            where: { id: { in: ids } },
            include: wordInclude,
        });
        const byId = new Map(words.map((w) => [w.id, mapWordRow(w)]));
        return ids.map((id) => byId.get(id)).filter((w) => Boolean(w));
    }
    async listWords(params) {
        const take = Math.min(Math.max(params.take ?? 100, 1), 500);
        const where = {};
        if (params.search) {
            const search = params.search.trim();
            where['OR'] = [
                { text: { contains: search, mode: 'insensitive' } },
                { definition: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (params.category)
            where['category'] = params.category;
        const words = await this.prisma.word.findMany({
            where,
            orderBy: { text: 'asc' },
            take,
            include: wordInclude,
        });
        return words.map(mapWordRow);
    }
    async listStudentCards(userId) {
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
    async createStudentCard(studentUserId, actorUserId, body) {
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
    async statusUpdate(studentUserId, cardId, status, actorUserId) {
        const card = await this.prisma.studentWordCard.findUnique({ where: { id: cardId } });
        if (!card || card.userId !== studentUserId)
            throw new common_1.NotFoundException('Card not found');
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
    async deleteStudentCard(actorUserId, studentUserId, cardId) {
        const card = await this.prisma.studentWordCard.findUnique({ where: { id: cardId } });
        if (!card || card.userId !== studentUserId) {
            throw new common_1.NotFoundException('Card not found');
        }
        const actor = await this.prisma.user.findUnique({
            where: { id: actorUserId },
            select: { role: true },
        });
        if (!actor || actor.role === 'STUDENT') {
            throw new common_1.ForbiddenException('Students cannot delete vocabulary cards');
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
    async requireStaff(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user || user.role === 'STUDENT') {
            throw new common_1.ForbiddenException('This action requires teacher, admin, or super admin role');
        }
    }
    async assertStaffCanManageStudent(actorUserId, studentUserId) {
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
            throw new common_1.NotFoundException('Student not found');
        }
        if (student.role !== 'STUDENT') {
            throw new common_1.NotFoundException('Student not found');
        }
        if (viewer?.role === 'ADMIN' || viewer?.role === 'SUPER_ADMIN')
            return;
        if (viewer?.role === 'TEACHER' && student.teacherId === actorUserId)
            return;
        throw new common_1.ForbiddenException('You can only manage vocabulary for your students');
    }
    async overviewFor(userId) {
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
};
exports.VocabularyService = VocabularyService;
exports.VocabularyService = VocabularyService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [data_access_prisma_1.PrismaService,
        word_enrichment_service_1.WordEnrichmentService,
        translation_service_1.TranslationService])
], VocabularyService);
let VocabularyController = class VocabularyController {
    constructor(vocabulary) {
        this.vocabulary = vocabulary;
    }
    async overview(userId) {
        return this.vocabulary.overviewFor(userId);
    }
    async words(search, category, take) {
        return this.vocabulary.listWords({
            search,
            category,
            take: take ? Number(take) : undefined,
        });
    }
    async lookupWord(text) {
        if (!text?.trim())
            throw new common_1.BadRequestException('text query is required');
        return this.vocabulary.lookupWord(text);
    }
    async wordDetails(id) {
        return this.vocabulary.getWordDetails(id);
    }
    async createWord(body) {
        return this.vocabulary.findOrCreateWord(body);
    }
    async myCards(userId) {
        return this.vocabulary.listStudentCards(userId);
    }
    async addCard(userId, body) {
        return this.vocabulary.createStudentCard(userId, userId, body);
    }
    async updateCardStatus(userId, id, body) {
        if (!body?.status)
            throw new common_1.BadRequestException('status is required');
        return this.vocabulary.statusUpdate(userId, id, body.status, userId);
    }
};
exports.VocabularyController = VocabularyController;
tslib_1.__decorate([
    (0, common_1.Get)('overview'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], VocabularyController.prototype, "overview", null);
tslib_1.__decorate([
    (0, common_1.Get)('words'),
    tslib_1.__param(0, (0, common_1.Query)('search')),
    tslib_1.__param(1, (0, common_1.Query)('category')),
    tslib_1.__param(2, (0, common_1.Query)('take')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], VocabularyController.prototype, "words", null);
tslib_1.__decorate([
    (0, common_1.Get)('words/lookup'),
    tslib_1.__param(0, (0, common_1.Query)('text')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], VocabularyController.prototype, "lookupWord", null);
tslib_1.__decorate([
    (0, common_1.Get)('words/:id/details'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], VocabularyController.prototype, "wordDetails", null);
tslib_1.__decorate([
    (0, common_1.Post)('words'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VocabularyController.prototype, "createWord", null);
tslib_1.__decorate([
    (0, common_1.Get)('cards'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], VocabularyController.prototype, "myCards", null);
tslib_1.__decorate([
    (0, common_1.Post)('cards'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VocabularyController.prototype, "addCard", null);
tslib_1.__decorate([
    (0, common_1.Patch)('cards/:id/status'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VocabularyController.prototype, "updateCardStatus", null);
exports.VocabularyController = VocabularyController = tslib_1.__decorate([
    (0, common_1.Controller)('vocabulary'),
    (0, common_1.UseGuards)(module_auth_1.AuthGuard),
    tslib_1.__metadata("design:paramtypes", [VocabularyService])
], VocabularyController);
let StudentVocabularyController = class StudentVocabularyController {
    constructor(vocabulary) {
        this.vocabulary = vocabulary;
    }
    async listStudentCards(studentId) {
        return this.vocabulary.listStudentCards(studentId);
    }
    async addStudentCard(actorId, studentId, body) {
        return this.vocabulary.createStudentCard(studentId, actorId, body);
    }
    async updateStudentCard(actorId, studentId, cardId, body) {
        if (!body?.status)
            throw new common_1.BadRequestException('status is required');
        return this.vocabulary.statusUpdate(studentId, cardId, body.status, actorId);
    }
};
exports.StudentVocabularyController = StudentVocabularyController;
tslib_1.__decorate([
    (0, common_1.Get)(':studentId/vocabulary'),
    tslib_1.__param(0, (0, common_1.Param)('studentId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], StudentVocabularyController.prototype, "listStudentCards", null);
tslib_1.__decorate([
    (0, common_1.Post)(':studentId/vocabulary'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('studentId')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], StudentVocabularyController.prototype, "addStudentCard", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':studentId/vocabulary/:cardId/status'),
    tslib_1.__param(0, (0, module_auth_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('studentId')),
    tslib_1.__param(2, (0, common_1.Param)('cardId')),
    tslib_1.__param(3, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], StudentVocabularyController.prototype, "updateStudentCard", null);
exports.StudentVocabularyController = StudentVocabularyController = tslib_1.__decorate([
    (0, common_1.Controller)('students'),
    (0, common_1.UseGuards)(module_auth_1.AuthGuard),
    tslib_1.__metadata("design:paramtypes", [VocabularyService])
], StudentVocabularyController);
function previewFromEnriched(enriched) {
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
let VocabularyModule = class VocabularyModule {
};
exports.VocabularyModule = VocabularyModule;
exports.VocabularyModule = VocabularyModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [VocabularyController, StudentVocabularyController],
        providers: [
            VocabularyService,
            dictionary_service_1.DictionaryService,
            platform_settings_service_1.PlatformSettingsService,
            datamuse_provider_1.DatamuseProvider,
            translation_service_1.TranslationService,
            word_enrichment_service_1.WordEnrichmentService,
        ],
        exports: [VocabularyService, dictionary_service_1.DictionaryService, platform_settings_service_1.PlatformSettingsService, word_enrichment_service_1.WordEnrichmentService],
    })
], VocabularyModule);
//# sourceMappingURL=be-vocabulary.js.map