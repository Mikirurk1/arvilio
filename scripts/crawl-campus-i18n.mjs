/**
 * Crawl Campus pages with Playwright storageState and dump visible chrome.
 * Usage: node scripts/crawl-campus-i18n.mjs
 *
 * Env:
 *   CAMPUS_URL (default http://localhost:4200)
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.CAMPUS_URL ?? 'http://localhost:4200';
const OUT = path.resolve('docs/tmp-i18n-playwright-crawl.json');
const AUTH_DIR = path.resolve('tests/e2e/.auth');

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/privacy',
  '/status',
  '/offer',
  '/legal/terms',
  '/legal/payment-refund',
  '/legal/contacts',
];

const STUDENT_PATHS = [
  '/dashboard',
  '/practice',
  '/practice/vocabulary',
  '/practice/quiz',
  '/practice/speaking',
  '/practice/irregular-verbs',
  '/lessons',
  '/calendar',
  '/chat',
  '/materials',
  '/payment',
  '/profile',
  '/vocabulary',
  '/quiz',
  '/onboarding',
];

const TEACHER_PATHS = [
  '/dashboard',
  '/students',
  '/students/groups',
  '/lessons',
  '/calendar',
  '/chat',
  '/materials',
  '/profile',
  '/vocabulary',
  '/quiz',
];

const ADMIN_PATHS = [
  '/dashboard',
  '/students',
  '/staff',
  '/admin',
  '/system',
  '/billing',
  '/finance',
  '/payment',
  '/profile',
];

/** Likely leftover EN chrome: has Latin letters, no Cyrillic. */
function isLikelyEnglishChrome(line) {
  if (!/[A-Za-z]/.test(line)) return false;
  if (/[А-Яа-яІіЇїЄєҐґ]/.test(line)) return false;
  if (/^https?:\/\//i.test(line)) return false;
  if (/^[0-9:./\-\s%]+$/.test(line)) return false;
  if (/^[a-f0-9-]{16,}$/i.test(line)) return false;
  return true;
}

async function collect(page, pathName) {
  await page.goto(BASE + pathName, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1100);
  const text = await page.locator('body').innerText().catch(() => '');
  const allLines = [
    ...new Set(
      text
        .split(/\n+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 3 && s.length <= 180 && /[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(s)),
    ),
  ];
  const englishLikely = allLines.filter(isLikelyEnglishChrome);
  return {
    path: pathName,
    url: page.url(),
    title: await page.title(),
    status: page.url().includes('/login') && pathName !== '/login' ? 'redirected-login' : 'ok',
    lines: allLines,
    englishLikely,
  };
}

async function crawlRole(browser, authFile, paths) {
  if (!fs.existsSync(authFile)) {
    return [{ error: `missing auth file ${authFile}` }];
  }
  const ctx = await browser.newContext({
    storageState: authFile,
    locale: 'uk-UA',
    extraHTTPHeaders: { 'Accept-Language': 'uk,en;q=0.8' },
  });
  const page = await ctx.newPage();
  const out = [];
  for (const p of paths) {
    try {
      out.push(await collect(page, p));
    } catch (e) {
      out.push({ path: p, error: String(e) });
    }
  }
  await ctx.close();
  return out;
}

const browser = await chromium.launch({ headless: true });
const results = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  public: [],
  student: [],
  teacher: [],
  admin: [],
};

{
  const ctx = await browser.newContext({
    locale: 'uk-UA',
    extraHTTPHeaders: { 'Accept-Language': 'uk,en;q=0.8' },
  });
  const page = await ctx.newPage();
  for (const p of PUBLIC_PATHS) {
    try {
      results.public.push(await collect(page, p));
    } catch (e) {
      results.public.push({ path: p, error: String(e) });
    }
  }
  await ctx.close();
}

results.student = await crawlRole(
  browser,
  path.join(AUTH_DIR, 'student.json'),
  STUDENT_PATHS,
);
results.teacher = await crawlRole(
  browser,
  path.join(AUTH_DIR, 'teacher.json'),
  TEACHER_PATHS,
);
results.admin = await crawlRole(browser, path.join(AUTH_DIR, 'admin.json'), ADMIN_PATHS);

await browser.close();
fs.writeFileSync(OUT, JSON.stringify(results, null, 2));

function summarize(rows) {
  return rows
    .map((r) => {
      if (r.error) return `${r.path || '?'}:ERR`;
      const n = (r.englishLikely || []).length;
      return `${r.path}:${n}${r.status === 'redirected-login' ? '!' : ''}`;
    })
    .join(' ');
}

console.log('wrote', OUT);
console.log('public ', summarize(results.public));
console.log('student', summarize(results.student));
console.log('teacher', summarize(results.teacher));
console.log('admin  ', summarize(results.admin));
