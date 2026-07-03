#!/usr/bin/env node
/**
 * Take a screenshot of any authenticated page.
 * Usage: node scripts/screenshot.mjs <path> [output-file]
 * Example: node scripts/screenshot.mjs /materials docs/screenshots/materials.png
 */
import { chromium } from 'playwright';

const route = process.argv[2] ?? '/dashboard';
const outFile = process.argv[3] ?? `docs/screenshots/page-${Date.now()}.png`;
const email = process.env.PLAYWRIGHT_TEACHER_EMAIL ?? 'jest-teacher@soenglish.test';
const password = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'TestPass123!';
const base = process.env.APP_URL ?? 'http://localhost:4200';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);

await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

console.log('url:', page.url());
await page.screenshot({ path: outFile, fullPage: true, timeout: 15000 });
await browser.close();
console.log('saved:', outFile);
