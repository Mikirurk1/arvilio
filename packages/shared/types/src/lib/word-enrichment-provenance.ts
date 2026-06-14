/** Staff-facing labels for how a word was looked up and translated. */
export type WordEnrichmentProvenanceDto = {
  dictionaryLabel: string | null;
  supplementalLabels: string[];
  translationLabels: string[];
  /** True when translation providers were not stored on this word (legacy rows). */
  translationUnknown: boolean;
};

const DICTIONARY_PROVIDER_LABELS: Record<string, string> = {
  dictionary_api_dev: 'Free Dictionary API',
  reverso: 'Reverso Context',
  wiktionary: 'Wiktionary (Wikimedia)',
  datamuse: 'Datamuse (related words)',
  manual: 'Manual entry',
};

const TRANSLATION_PROVIDER_LABELS: Record<string, string> = {
  deepl: 'DeepL',
  google: 'Google Cloud Translation',
  microsoft: 'Microsoft Translator',
  reverso: 'Reverso Context',
  mymemory: 'MyMemory',
  libretranslate: 'LibreTranslate',
  gtx: 'Google Translate (GTX)',
};

function labelFor(
  id: string | null | undefined,
  catalog: Record<string, string>,
): string | null {
  if (!id?.trim()) return null;
  const key = id.trim().toLowerCase();
  return catalog[key] ?? id;
}

type SourcePayloadShape = {
  provider?: string | null;
  enrichment?: {
    dictionaryProvider?: string | null;
    translationProviders?: string[];
  };
};

function parseSourcePayload(json: string | null | undefined): SourcePayloadShape | null {
  if (!json?.trim()) return null;
  try {
    return JSON.parse(json) as SourcePayloadShape;
  } catch {
    return null;
  }
}

function parseCombinedSource(source: string): { dictionaryIds: string[]; supplementalIds: string[] } {
  const raw = source.startsWith('combined:') ? source.slice('combined:'.length) : source;
  const parts = raw.split('+').map((p) => p.trim()).filter(Boolean);
  const dictionaryIds: string[] = [];
  const supplementalIds: string[] = [];
  for (const part of parts) {
    if (part === 'datamuse') supplementalIds.push(part);
    else if (part !== 'manual') dictionaryIds.push(part);
  }
  return { dictionaryIds, supplementalIds };
}

export function resolveWordEnrichmentProvenance(
  source?: string | null,
  sourcePayloadJson?: string | null,
): WordEnrichmentProvenanceDto {
  const payload = parseSourcePayload(sourcePayloadJson);
  const enrichment = payload?.enrichment;

  const translationIds = (enrichment?.translationProviders ?? [])
    .map((id) => id?.trim().toLowerCase())
    .filter((id): id is string => Boolean(id));
  const translationLabels = [
    ...new Set(
      translationIds
        .map((id) => labelFor(id, TRANSLATION_PROVIDER_LABELS))
        .filter((l): l is string => Boolean(l)),
    ),
  ];

  let dictionaryLabel =
    labelFor(enrichment?.dictionaryProvider, DICTIONARY_PROVIDER_LABELS) ??
    labelFor(payload?.provider, DICTIONARY_PROVIDER_LABELS);

  const supplementalLabels: string[] = [];

  if (source?.trim()) {
    const { dictionaryIds, supplementalIds } = parseCombinedSource(source.trim());
    if (!dictionaryLabel && dictionaryIds.length > 0) {
      dictionaryLabel =
        labelFor(dictionaryIds[0], DICTIONARY_PROVIDER_LABELS) ?? dictionaryIds[0];
    }
    for (const id of supplementalIds) {
      const label = labelFor(id, DICTIONARY_PROVIDER_LABELS);
      if (label && !supplementalLabels.includes(label)) supplementalLabels.push(label);
    }
  }

  if (source?.trim() === 'manual' && !dictionaryLabel) {
    dictionaryLabel = DICTIONARY_PROVIDER_LABELS.manual ?? 'Manual entry';
  }

  return {
    dictionaryLabel,
    supplementalLabels,
    translationLabels,
    translationUnknown: translationLabels.length === 0,
  };
}
