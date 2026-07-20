#!/usr/bin/env node
/**
 * Translation matrix via agent-browser:
 * - Provider switch: GraphQL (translation-matrix-providers.mjs)
 * - Add word: browser session on /vocabulary (fetch /api/graphql — same as UI)
 * - Verify: Word details modal (Data sources footer)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { resolveWordEnrichmentProvenance } = await import('@pkg/types');
const OUT = resolve(ROOT, process.env.TRANSLATION_MATRIX_OUT ?? 'tmp/translation-matrix');
const WORDS_FILE = resolve(ROOT, 'scripts/translation-matrix-words.txt');
const BASE = (process.env.AGENT_BROWSER_BASE_URL ?? 'http://localhost:4200').replace(/\/$/, '');
const AB = process.env.AGENT_BROWSER_BIN ?? 'agent-browser';
const SUPER = process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL ?? 'jest-super-admin@arvilio.test';
const PASS = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';
const AB_TIMEOUT_MS = Number(process.env.AB_CMD_TIMEOUT_MS ?? 60_000);

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

function ab(...args) {
  const result = spawnSync(AB, args, {
    encoding: 'utf8',
    cwd: ROOT,
    timeout: AB_TIMEOUT_MS,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `exit ${result.status}`).slice(0, 800));
  }
  return (result.stdout ?? '').trim();
}

function abEval(asyncFnBody) {
  const script = `(async () => { ${asyncFnBody} })()`;
  return ab('eval', script);
}

function setProviders(dictId, transId) {
  execSync(`node "${resolve(ROOT, 'scripts/translation-matrix-providers.mjs')}" dict ${dictId}`, {
    stdio: 'pipe',
  });
  execSync(`node "${resolve(ROOT, 'scripts/translation-matrix-providers.mjs')}" translation ${transId}`, {
    stdio: 'pipe',
  });
}

function restoreProviders(dictId, transId) {
  execSync(`node "${resolve(ROOT, 'scripts/translation-matrix-providers.mjs')}" restore ${dictId} ${transId}`, {
    stdio: 'pipe',
  });
}

function readWords() {
  const words = [];
  for (const line of readFileSync(WORDS_FILE, 'utf8').split('\n')) {
    const t = line.replace(/#.*$/, '').trim();
    if (t) words.push(t);
  }
  return words;
}

function parseAbJson(raw) {
  const s = raw.trim();
  try {
    let d = JSON.parse(s);
    if (typeof d === 'string') d = JSON.parse(d);
    return d;
  } catch {
    return { parseError: s.slice(0, 500) };
  }
}

function loadPreflight() {
  return JSON.parse(
    execSync(`node "${resolve(ROOT, 'scripts/translation-matrix-preflight.mjs')}"`, { encoding: 'utf8' }),
  );
}

async function loadLanguageIds() {
  const API_BASE = (process.env.API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SUPER, password: PASS }),
  });
  if (!res.ok) throw new Error(`Login failed (${res.status})`);
  const cookies = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
  const gql = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({ query: '{ languages { id code } }' }),
  });
  const json = await gql.json();
  const langs = json.data?.languages ?? [];
  return {
    englishLanguageId: langs.find((l) => l.code === 'en')?.id ?? null,
    nativeLanguageId: langs.find((l) => l.code === 'uk')?.id ?? null,
  };
}

function browserLogin() {
  ab('close', '--all');
  ab('open', `${BASE}/login`);
  ab('wait', '1000');
  const email = JSON.stringify(SUPER);
  const password = JSON.stringify(PASS);
  const ok = abEval(`
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ${email}, password: ${password} }),
    });
    return JSON.stringify({ ok: res.ok, status: res.status });
  `);
  const login = parseAbJson(ok);
  if (!login.ok) throw new Error(`Browser login failed: ${JSON.stringify(login)}`);
  ab('open', `${BASE}/dashboard`);
  ab('wait', '1500');
}

function hasNativeGloss(definitions, englishId, nativeId) {
  return definitions.some((d) => {
    if (nativeId && d.languageId !== nativeId) return false;
    if (!nativeId && englishId && d.languageId === englishId) return false;
    const ok = (v) => v?.trim() && v.trim() !== '—' && v.trim() !== '-';
    return ok(d.text) || ok(d.lemmaText);
  });
}

function classify(dictId, transId, lookup, details, ui, elapsedMs, err) {
  if (err) {
    return { status: 'add_failed', notes: err, elapsedMs, dictionarySource: '', translationSources: '' };
  }
  if (!lookup?.foundInDictionary) {
    return {
      status: 'dict_not_found',
      notes: 'lookupWord: foundInDictionary=false',
      elapsedMs,
      dictionarySource: '',
      translationSources: '',
    };
  }
  const provenance = resolveWordEnrichmentProvenance(details?.source, details?.sourcePayloadJson);
  const dictSource = provenance.dictionaryLabel ?? ui?.dictionarySource ?? '';
  const transSources = provenance.translationLabels.join(', ') || ui?.translationSources || '';
  const gloss =
    ui?.hasNativeGloss ||
    hasNativeGloss(details?.definitions ?? [], lookup?.englishLanguageId, lookup?.nativeLanguageId);

  if ((provenance.translationUnknown || !transSources) && !gloss) {
    return {
      status: 'translation_missing',
      notes: 'No native gloss / translation not in provenance',
      elapsedMs,
      dictionarySource: dictSource,
      translationSources: transSources,
    };
  }
  const exp = TRANSLATION_LABELS[transId] ?? transId;
  if (transSources && !transSources.includes(exp.split(' ')[0]) && !transSources.includes(exp)) {
    return {
      status: 'translation_fallback',
      notes: `Selected ${exp}; provenance: ${transSources}`,
      elapsedMs,
      dictionarySource: dictSource,
      translationSources: transSources,
    };
  }
  const extra = [];
  if (ui?.error) extra.push(`UI: ${ui.error}`);
  if (ui?.scrapeError) extra.push(`UI scrape: ${ui.scrapeError}`);
  return {
    status: 'ok',
    notes: [lookup.foundInDb ? 'Word already in global DB' : '', ...extra].filter(Boolean).join('; '),
    elapsedMs,
    dictionarySource: dictSource,
    translationSources: transSources,
  };
}

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
  ab('open', `${BASE}/vocabulary`);
  ab('wait', '2000');

  const wordLit = JSON.stringify(word);
  const enLit = JSON.stringify(langIds.englishLanguageId);
  const nativeLit = JSON.stringify(langIds.nativeLanguageId);

  let apiResult;
  try {
    const raw = abEval(`
      const word = ${wordLit};
      const t0 = performance.now();
      const gql = async (query, variables) => {
        const res = await fetch('/api/graphql', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables }),
        });
        const json = await res.json();
        if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
        return json.data;
      };
      const LOOKUP = 'query LookupWord($text: String!) { lookupWord(text: $text) { foundInDb foundInDictionary word { id } preview { id } } }';
      const ADD = 'mutation Add($input: CreateStudentWordCardInput!) { addStudentWordCard(input: $input) { id word { id text source } } }';
      const DETAILS = 'query WordDetails($id: ID!) { wordDetails(id: $id) { id text source sourcePayloadJson definitions { text lemmaText languageId } } }';
      const lookup = (await gql(LOOKUP, { text: word })).lookupWord;
      lookup.englishLanguageId = ${enLit};
      lookup.nativeLanguageId = ${nativeLit};
      if (!lookup.foundInDictionary) {
        return JSON.stringify({
          elapsedMs: Math.round(performance.now() - t0),
          lookup,
          details: null,
          cardId: null,
        });
      }
      const card = (await gql(ADD, { input: { text: word, status: 'new' } })).addStudentWordCard;
      const details = (await gql(DETAILS, { id: card.word.id })).wordDetails;
      const elapsedMs = Math.round(performance.now() - t0);
      return JSON.stringify({ elapsedMs, lookup, details, cardId: card.id });
    `);
    apiResult = parseAbJson(raw);
  } catch (e) {
    return classify(dictId, transId, null, null, null, 0, e.message);
  }

  if (!apiResult.lookup?.foundInDictionary) {
    return classify(dictId, transId, apiResult.lookup, null, null, apiResult.elapsedMs ?? 0, null);
  }

  ab('open', `${BASE}/vocabulary`);
  ab('wait', '3000');

  let ui = {};
  try {
    const uiRaw = abEval(`
      const target = ${wordLit}.toLowerCase();
      const card = [...document.querySelectorAll('[class*="wordCard"]')].find((c) => {
        const w = c.querySelector('[class*="wcWord"]');
        return w?.textContent?.trim().toLowerCase() === target;
      });
      if (!card) return JSON.stringify({ error: 'card not in list after add — reload may be needed' });
      card.querySelector('button[aria-label="All information"]')?.click();
      await new Promise((r) => setTimeout(r, 2500));
      const provenance = document.querySelector('[aria-label="Word data sources"]');
      const provText = provenance?.innerText?.replace(/\\s+/g, ' ').trim() || '';
      let dictionarySource = '';
      let translationSources = '';
      const dm = provText.match(/Dictionary\\s+(.+?)(?:\\s+Related|\\s+Translation|$)/);
      if (dm) dictionarySource = dm[1].trim();
      const tm = provText.match(/Translation\\s+(.+)$/);
      if (tm) translationSources = tm[1].trim();
      const transH = [...(document.querySelector('[role="dialog"]')?.querySelectorAll('h3') || [])].find(
        (h) => h.textContent?.trim() === 'Translation',
      );
      let hasNativeGloss = false;
      if (transH) {
        const t = transH.closest('section')?.innerText || '';
        hasNativeGloss = t.length > 30 && !/Not stored for this entry/i.test(t);
      }
      document.querySelector('[role="dialog"] button[aria-label="Close"]')?.click();
      return JSON.stringify({ dictionarySource, translationSources, hasNativeGloss, provText });
    `);
    ui = parseAbJson(uiRaw);
    if (ui.error) {
      try {
        ab('screenshot', resolve(OUT, `screenshots/${dictId}__${transId}.png`));
      } catch {
        /* ignore */
      }
    }
  } catch (e) {
    ui = { scrapeError: e.message };
  }

  if (apiResult.cardId) {
    try {
      abEval(`
        const meRes = await fetch('/api/graphql', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'query { me { id } }' }),
        });
        const me = (await meRes.json()).data.me.id;
        await fetch('/api/graphql', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'mutation($cardId: ID!, $studentId: ID!) { deleteStudentWordCard(cardId: $cardId, studentId: $studentId) }',
            variables: { cardId: ${JSON.stringify(apiResult.cardId)}, studentId: me },
          }),
        });
        return true;
      `);
    } catch {
      /* best-effort */
    }
  }

  return classify(
    dictId,
    transId,
    apiResult.lookup,
    apiResult.details,
    ui,
    apiResult.elapsedMs ?? 0,
    null,
  );
}

async function main() {
  try {
    execSync(`command -v ${AB}`, { stdio: 'pipe' });
  } catch {
    throw new Error('agent-browser not found. Install: npm i -g agent-browser && agent-browser install');
  }

  mkdirSync(resolve(OUT, 'screenshots'), { recursive: true });
  const preflight = loadPreflight();
  const langIds = await loadLanguageIds();
  const words = readWords();
  const expected = DICT_IDS.length * TRANS_IDS.length;
  if (words.length < expected) {
    throw new Error(`Need ${expected} words in ${WORDS_FILE}, got ${words.length}`);
  }

  browserLogin();

  const runs = [];
  const lines = [
    '# Translation provider matrix (agent-browser)',
    '',
    `- **Base:** ${BASE}`,
    `- **Method:** agent-browser session + /vocabulary GraphQL fetch + Word details modal`,
    `- **Output:** \`${OUT}\``,
    `- **Started:** ${new Date().toISOString()}`,
    '',
    '## Results',
    '',
    '| Dictionary | Translation | Word | ms | Status | Dictionary source | Translation source(s) | Notes |',
    '|------------|-------------|------|-----|--------|-------------------|----------------------|-------|',
  ];

  let i = 0;
  for (const dictId of DICT_IDS) {
    for (const transId of TRANS_IDS) {
      const word = words[i++];
      process.stdout.write(`\r${dictId} + ${transId} (${word})...`);
      const result = await runCombo(dictId, transId, word, preflight, langIds);
      runs.push({ dictionaryProvider: dictId, translationProvider: transId, word, ...result });
      const ms = result.status === 'skipped' ? '—' : String(result.elapsedMs);
      lines.push(
        `| ${dictId} | ${transId} | ${word} | ${ms} | ${result.status} | ${result.dictionarySource ?? ''} | ${result.translationSources ?? ''} | ${result.notes ?? ''} |`,
      );
    }
  }
  process.stdout.write('\n');

  restoreProviders(preflight.dictActive, preflight.translationActive);
  ab('close', '--all');

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

  lines.push('', '## Restore settings', '', `- Restored \`${preflight.dictActive}\` + \`${preflight.translationActive}\``, '', '## Summary', '');
  for (const [k, v] of Object.entries(summary)) {
    if (v) lines.push(`- **${k}:** ${v}`);
  }
  lines.push('', `- **Finished:** ${new Date().toISOString()}`);

  writeFileSync(resolve(OUT, 'report.md'), lines.join('\n'));
  writeFileSync(resolve(OUT, 'report.json'), JSON.stringify({ summary, runs }, null, 2));
  console.log(`\nReport: ${resolve(OUT, 'report.md')}`);
}

main().catch((e) => {
  console.error(e);
  try {
    ab('close', '--all');
  } catch {
    /* ignore */
  }
  process.exit(1);
});
