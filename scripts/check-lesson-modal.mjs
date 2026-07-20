#!/usr/bin/env node
import { chromium } from 'playwright';

const base = 'http://localhost:4200';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
await page.fill('input[type="email"]', 'jest-teacher@arvilio.test');
await page.fill('input[type="password"]', 'TestPass123!');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);

await page.goto(`${base}/calendar`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

// click schedule a lesson button
const btns = await page.getByRole('button').all();
for (const btn of btns) {
  const text = await btn.textContent();
  if (text?.includes('Schedule') || text?.includes('lesson') || text?.includes('Lesson')) {
    console.log('found btn:', text?.trim());
  }
}

// try clicking it
await page.getByText('Schedule a lesson').first().click().catch(() => {});
await page.waitForTimeout(800);
await page.screenshot({ path: 'docs/screenshots/modal-open.png', fullPage: false });

// click save without title
await page.getByText('Save lesson').first().click().catch(() => {});
await page.waitForTimeout(500);
await page.screenshot({ path: 'docs/screenshots/modal-after-save.png', fullPage: false });

const errors = await page.$$eval('[aria-invalid="true"]', els => els.map(el => ({ tag: el.tagName, cls: el.className })));
console.log('aria-invalid:', JSON.stringify(errors));
const alerts = await page.$$eval('[role="alert"]', els => els.map(el => el.textContent?.trim()));
console.log('alerts:', JSON.stringify(alerts));

await browser.close();
