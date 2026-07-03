#!/usr/bin/env node
import { chromium } from 'playwright';

const base = 'http://localhost:4200';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
await page.fill('input[type="email"]', 'jest-teacher@soenglish.test');
await page.fill('input[type="password"]', 'TestPass123!');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);

await page.goto(`${base}/materials`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

await page.getByText('Add material').first().click();
await page.waitForTimeout(800);

// click Create material without title
await page.getByRole('button', { name: /create material/i }).click();
await page.waitForTimeout(600);

await page.screenshot({ path: 'docs/screenshots/material-validation.png', fullPage: false });

const errors = await page.$$eval('[aria-invalid="true"]', els => els.map(el => ({ tag: el.tagName, cls: el.className.substring(0,50) })));
console.log('aria-invalid:', JSON.stringify(errors));
const alerts = await page.$$eval('[role="alert"]', els => els.map(el => el.textContent?.trim()));
console.log('alerts:', JSON.stringify(alerts));

await browser.close();
