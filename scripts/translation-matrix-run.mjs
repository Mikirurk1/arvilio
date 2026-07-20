#!/usr/bin/env node
/**
 * Translation provider matrix — runs lookup + add + wordDetails via GraphQL
 * (same path as the vocabulary UI). Provider switching via translation-matrix-providers.mjs.
 *
 * Usage: node scripts/translation-matrix-run.mjs
 * Output: tmp/translation-matrix/report.md, report.json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, process.env.TRANSLATION_MATRIX_OUT ?? 'tmp/translation-matrix');
const WORDS_FILE = resolve(ROOT, 'scripts/translation-matrix-words.txt');

const DICT_IDS = ['dictionary_api_dev', 'wiktionary', 'reverso'];
const TRANS_IDS = ['deepl', 'google', 'microsoft', 'reverso', 'mymemory', 'libretranslate', 'gtx'];

const TRANSLATION_LABELS = {
  deepl: 'DeepL',
  google: 'Google',
  microsoft: 'Microsoft',
  reverso: 'Reverso',
  mymemory: 'MyMemory',
  libretranslate: 'LibreTranslate',
  gtx: 'GTX',
};

function loadEnvFile() {
  const path = resolve(ROOT, '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();

const { resolveWordEnrichmentProvenance } = await import('@pkg/types');

const API_BASE = (process.env.API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');
let cookieJar = '';

async function login() {
  const email =
    process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL ?? 'jest-super-admin@arvilio.test';
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed (${res.status})`);
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length === 0) {
    const single = res.headers.get('set-cookie');
    if (single) setCookie.push(single);
  }
  cookieJar = setCookie.map((c) => c.split(';')[0]).join('; ');
}

async function graphql(query, variables) {
  const res = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieJar },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    const err = new Error(json.errors.map((e) => e.message).join('; '));
    err.gqlErrors = json.errors;
    throw err;
  }
  return json.data;
}

function setProviders(dictId, transId) {
  execSync(`node "${resolve(ROOT, 'scripts/translation-matrix-providers.mjs')}" dict ${dictId}`, {
    stdio: 'pipe',
  });
  execSync(
    `node "${resolve(ROOT, 'scripts/translation-matrix-providers.mjs')}" translation ${transId}`,
    { stdio: 'pipe' },
  );
}

function restoreProviders(dictId, transId) {
  execSync(
    `node "${resolve(ROOT, 'scripts/translation-matrix-providers.mjs')}" restore ${dictId} ${transId}`,
    { stdio: 'pipe' },
  );
}

function readWords() {
  const words = [];
  for (const line of readFileSync(WORDS_FILE, 'utf8').split('\n')) {
    const trimmed = line.replace(/#.*$/, '').trim();
    if (trimmed) words.push(trimmed);
  }
  return words;
}

function hasNativeGloss(definitions, englishLanguageId, nativeLanguageId) {
  if (!nativeLanguageId) {
    return definitions.some((d) => d.languageId && d.languageId !== englishLanguageId);
  }
  return definitions.some((d) => {
    if (d.languageId !== nativeLanguageId) return false;
    const text = d.text?.trim();
    const lemma = d.lemmaText?.trim();
    const ok = (v) => v && v !== '—' && v !== '-';
    return ok(text) || ok(lemma);
  });
}

async function loadLanguageIds() {
  const data = await graphql(`query { languages { id code } }`);
  const langs = data.languages ?? [];
  const en = langs.find((l) => l.code === 'en')?.id ?? null;
  const uk = langs.find((l) => l.code === 'uk')?.id ?? null;
  const native = uk ?? langs.find((l) => l.code !== 'en')?.id ?? null;
  return { englishLanguageId: en, nativeLanguageId: native };
}

function classifyRun(dictId, transId, lookup, details, provenance, elapsedMs, err, langIds) {
  if (err) {
    const msg = err.message ?? String(err);
    if (/dictionary|not found|No dictionary/i.test(msg)) {
      return { status: 'dict_not_found', notes: msg };
    }
    return { status: 'add_failed', notes: msg };
  }
  if (!lookup?.foundInDictionary) {
    return {
      status: 'dict_not_found',
      notes: 'lookupWord: foundInDictionary=false (dictionary provider returned no entry)',
    };
  }
  if (!details) {
    return { status: 'add_failed', notes: 'No word details after add' };
  }
  const dictSource = provenance.dictionaryLabel ?? '';
  const transSources = provenance.translationLabels.join(', ');
  const gloss = hasNativeGloss(
    details.definitions ?? [],
    langIds.englishLanguageId,
    langIds.nativeLanguageId,
  );

  if (provenance.translationUnknown && !gloss) {
    return {
      status: 'translation_missing',
      notes: 'No native gloss and translation providers not stored on word',
      dictionarySource: dictSource,
      translationSources: transSources,
    };
  }
  if (!gloss) {
    return {
      status: 'translation_missing',
      notes: 'Card created but no native-language gloss in definitions',
      dictionarySource: dictSource,
      translationSources: transSources,
    };
  }

  const exp = TRANSLATION_LABELS[transId] ?? transId;
  if (transSources && !transSources.includes(exp.split(' ')[0]) && !transSources.includes(exp)) {
    return {
      status: 'translation_fallback',
      notes: `Selected ${exp}; provenance: ${transSources}`,
      dictionarySource: dictSource,
      translationSources: transSources,
    };
  }

  return {
    status: 'ok',
    notes: lookup.foundInDb ? 'Word already in DB (lookup skipped re-enrich)' : '',
    dictionarySource: dictSource,
    translationSources: transSources,
  };
}

const LOOKUP_QUERY = `
  query LookupWord($text: String!) {
    lookupWord(text: $text) {
      foundInDb
      foundInDictionary
      word { id }
      preview { id source }
    }
  }
`;

const ADD_CARD = `
  mutation AddCard($input: CreateStudentWordCardInput!) {
    addStudentWordCard(input: $input) {
      id
      word { id text source }
    }
  }
`;

const WORD_DETAILS = `
  query WordDetails($id: ID!) {
    wordDetails(id: $id) {
      id text source sourcePayloadJson
      definitions { text lemmaText languageId partOfSpeech }
    }
  }
`;

const DELETE_CARD = `
  mutation DeleteCard($cardId: ID!, $studentId: ID!) {
    deleteStudentWordCard(cardId: $cardId, studentId: $studentId)
  }
`;

const ME = `
  query Me { me { id } }
`;

async function runCombo(dictId, transId, word, preflight, langIds) {
  if (['deepl', 'google', 'microsoft'].includes(transId) && !preflight.paidConfigured[transId]) {
    return {
      status: 'skipped',
      elapsedMs: 0,
      notes: `No API key configured for ${transId}`,
      dictionarySource: '',
      translationSources: '',
    };
  }
  if (transId === 'libretranslate' && !preflight.libreTranslateUrlConfigured) {
    return {
      status: 'skipped',
      elapsedMs: 0,
      notes: 'LIBRETRANSLATE_URL not set on server',
      dictionarySource: '',
      translationSources: '',
    };
  }

  setProviders(dictId, transId);
  const t0 = Date.now();
  let lookup;
  let card;
  let details;
  let err;

  try {
    lookup = (await graphql(LOOKUP_QUERY, { text: word })).lookupWord;
    if (!lookup.foundInDictionary) {
      const elapsedMs = Date.now() - t0;
      return {
        status: 'dict_not_found',
        elapsedMs,
        notes: 'lookupWord: foundInDictionary=false',
        dictionarySource: '',
        translationSources: '',
      };
    }
    card = (await graphql(ADD_CARD, { input: { text: word, status: 'new' } })).addStudentWordCard;
    const wordId = card.word?.id;
    if (wordId) {
      details = (await graphql(WORD_DETAILS, { id: wordId })).wordDetails;
    }
    const elapsedMs = Date.now() - t0;
    const provenance = resolveWordEnrichmentProvenance
      ? resolveWordEnrichmentProvenance(details?.source, details?.sourcePayloadJson)
      : {
          dictionaryLabel: details?.source ?? null,
          supplementalLabels: [],
          translationLabels: [],
          translationUnknown: true,
        };
    const classified = classifyRun(dictId, transId, lookup, details, provenance, elapsedMs, null, langIds);
    return { elapsedMs, ...classified };
  } catch (e) {
    err = e;
    const elapsedMs = Date.now() - t0;
    const classified = classifyRun(dictId, transId, lookup, details, {}, elapsedMs, err, langIds);
    return { elapsedMs, ...classified };
  } finally {
    if (card?.id) {
      try {
        const me = (await graphql(ME)).me;
        await graphql(DELETE_CARD, { cardId: card.id, studentId: me.id });
      } catch {
        /* best-effort cleanup */
      }
    }
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const preflightPath = resolve(OUT, 'preflight.json');
  const preflightJson = execSync(`node "${resolve(ROOT, 'scripts/translation-matrix-preflight.mjs')}"`, {
    encoding: 'utf8',
  });
  writeFileSync(preflightPath, preflightJson);
  const preflight = JSON.parse(preflightJson);
  const restoreDict = preflight.dictActive;
  const restoreTrans = preflight.translationActive;

  await login();
  const langIds = await loadLanguageIds();
  const words = readWords();
  const expected = DICT_IDS.length * TRANS_IDS.length;
  if (words.length < expected) {
    throw new Error(`Need ${expected} words in ${WORDS_FILE}, got ${words.length}`);
  }

  const runs = [];
  let wordIdx = 0;
  const lines = [
    '# Translation provider matrix',
    '',
    `- **API:** ${API_BASE}`,
    `- **Method:** GraphQL lookupWord + addStudentWordCard (same as vocabulary UI)`,
    `- **Output:** \`${OUT}\``,
    `- **Started:** ${new Date().toISOString()}`,
    '',
    '## Results',
    '',
    '| Dictionary | Translation | Word | ms | Status | Dictionary source | Translation source(s) | Notes |',
    '|------------|-------------|------|-----|--------|-------------------|----------------------|-------|',
  ];

  for (const dictId of DICT_IDS) {
    for (const transId of TRANS_IDS) {
      const word = words[wordIdx++];
      const result = await runCombo(dictId, transId, word, preflight, langIds);
      const row = {
        dictionaryProvider: dictId,
        translationProvider: transId,
        word,
        ...result,
      };
      runs.push(row);
      const ms = result.status === 'skipped' ? '—' : String(result.elapsedMs);
      lines.push(
        `| ${dictId} | ${transId} | ${word} | ${ms} | ${result.status} | ${result.dictionarySource ?? ''} | ${result.translationSources ?? ''} | ${result.notes ?? ''} |`,
      );
      process.stdout.write(`\r${dictId} + ${transId} (${word}): ${result.status}     `);
    }
  }
  process.stdout.write('\n');

  restoreProviders(restoreDict, restoreTrans);

  const summary = {};
  for (const s of [
    'ok',
    'skipped',
    'dict_not_found',
    'translation_missing',
    'translation_fallback',
    'add_failed',
    'timeout',
  ]) {
    summary[s] = runs.filter((r) => r.status === s).length;
  }

  lines.push('', '## Restore settings', '', `- Restored dictionary=\`${restoreDict}\` translation=\`${restoreTrans}\``, '');
  lines.push('## Summary', '');
  for (const [k, v] of Object.entries(summary)) {
    if (v) lines.push(`- **${k}:** ${v}`);
  }
  lines.push('', `- **Finished:** ${new Date().toISOString()}`);

  writeFileSync(resolve(OUT, 'report.md'), lines.join('\n'));
  writeFileSync(resolve(OUT, 'report.json'), JSON.stringify({ summary, runs }, null, 2));
  console.log(`\nReport: ${resolve(OUT, 'report.md')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
