#!/usr/bin/env node
/**
 * Set dictionary / translation providers via GraphQL (super-admin).
 * Avoids flaky System UI automation in the browser matrix script.
 *
 * Usage:
 *   node scripts/translation-matrix-providers.mjs dict <dictionary_api_dev|wiktionary|reverso>
 *   node scripts/translation-matrix-providers.mjs translation <providerId>
 *   node scripts/translation-matrix-providers.mjs restore <dictId> <translationId>
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

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

const API_BASE = (process.env.API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');
const EMAIL =
  process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL ?? 'jest-super-admin@arvilio.test';
const PASS = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

let cookieJar = '';

async function login() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Login failed (${res.status}): ${body.slice(0, 200)}`);
  }
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
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieJar,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }
  return json.data;
}

async function setDictionary(provider) {
  await graphql(
    `mutation SetDict($input: UpdateWordDictionaryProviderInput!) {
      updateWordDictionaryProvider(input: $input) { activeProvider }
    }`,
    { input: { provider } },
  );
}

async function setTranslation(activeProvider) {
  await graphql(
    `mutation SetTrans($input: UpdatePlatformIntegrationSettingsInput!) {
      updatePlatformIntegrationSettings(input: $input) {
        config { translation { activeProvider } }
      }
    }`,
    { input: { config: { translation: { activeProvider } } } },
  );
}

async function main() {
  const [, , cmd, a, b] = process.argv;
  if (!cmd) {
    console.error('Usage: dict|translation|restore <args>');
    process.exit(1);
  }
  await login();
  if (cmd === 'dict') {
    await setDictionary(a);
    process.stdout.write(a);
    return;
  }
  if (cmd === 'translation') {
    await setTranslation(a);
    process.stdout.write(a);
    return;
  }
  if (cmd === 'restore') {
    await setDictionary(a);
    await setTranslation(b);
    process.stdout.write(`${a},${b}`);
    return;
  }
  throw new Error(`Unknown command: ${cmd}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
