#!/usr/bin/env node
/**
 * Preflight for translation-matrix browser QA.
 * Logs in as super-admin and reads active providers + paid API key status.
 *
 * Usage: node scripts/translation-matrix-preflight.mjs
 * Env: API_URL (default http://localhost:3000/api), PLAYWRIGHT_* emails/password,
 *      or DEEPL_AUTH_KEY / GOOGLE_TRANSLATE_API_KEY / AZURE_TRANSLATOR_KEY in .env
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
  process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL ?? 'jest-super-admin@soenglish.test';
const PASS = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';

const GQL = `
  query TranslationMatrixPreflight {
    wordDictionarySettings { activeProvider }
    translationSettings { activeProvider }
    platformIntegrationSettings {
      secretStatuses {
        deeplAuthKey { configured source }
        googleTranslateApiKey { configured source }
        azureTranslatorKey { configured source }
      }
    }
  }
`;

function envKeyConfigured(name) {
  const v = process.env[name]?.trim();
  return Boolean(v);
}

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
  return setCookie.map((c) => c.split(';')[0]).join('; ');
}

async function graphql(cookie) {
  const res = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({ query: GQL }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }
  return json.data;
}

function paidFromStatuses(statuses) {
  return {
    deepl:
      Boolean(statuses?.deeplAuthKey?.configured) || envKeyConfigured('DEEPL_AUTH_KEY'),
    google:
      Boolean(statuses?.googleTranslateApiKey?.configured) ||
      envKeyConfigured('GOOGLE_TRANSLATE_API_KEY'),
    microsoft:
      Boolean(statuses?.azureTranslatorKey?.configured) ||
      envKeyConfigured('AZURE_TRANSLATOR_KEY'),
  };
}

async function main() {
  const cookie = await login();
  const data = await graphql(cookie);
  const statuses = data.platformIntegrationSettings?.secretStatuses;
  const paidConfigured = paidFromStatuses(statuses);

  const out = {
    apiBase: API_BASE,
    loginEmail: EMAIL,
    dictActive: data.wordDictionarySettings?.activeProvider ?? null,
    translationActive: data.translationSettings?.activeProvider ?? null,
    paidConfigured,
    libreTranslateUrlConfigured: Boolean(process.env.LIBRETRANSLATE_URL?.trim()),
  };
  process.stdout.write(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
