import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Run axe WCAG AA scan on current page and assert 0 violations. */
export async function expectNoA11yViolations(page: Page, options?: { disableRules?: string[] }) {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);
  if (options?.disableRules?.length) {
    builder.disableRules(options.disableRules);
  }
  const results = await builder.analyze();
  expect(results.violations).toEqual([]);
}

/** Take a named screenshot into tests/e2e/screenshots/<name>.png */
export async function shot(page: Page, name: string) {
  await page.screenshot({
    path: `tests/e2e/screenshots/${name}.png`,
    fullPage: false,
    // Don't inject `caret-color: transparent`: when the shot lands mid-hydration,
    // React reports a hydration mismatch and consoleGuard fails the test.
    caret: 'initial',
  });
}

/**
 * Assert the Arvi mascot is rendered, optionally in a specific pose.
 * Anchored on `[data-mascot]` / `[data-mascot-pose]` from components/mascot/Mascot.tsx.
 */
export async function expectArvi(page: Page, pose?: string) {
  const locator = pose
    ? page.locator(`[data-mascot][data-mascot-pose="${pose}"]`)
    : page.locator('[data-mascot]');
  await expect(locator.first()).toBeVisible({ timeout: 10_000 });
}

/** Assert no console errors (attach to page before navigation). */
export function consoleGuard(page: Page): () => void {
  const errors: string[] = [];
  const handler = (msg: import('@playwright/test').ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text());
  };
  page.on('console', handler);
  return () => {
    page.off('console', handler);
    if (errors.length) {
      throw new Error(`Console errors:\n${errors.join('\n')}`);
    }
  };
}
