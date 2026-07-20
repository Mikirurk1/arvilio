import path from 'node:path';

/** Root directory for binary/text fixtures used with Playwright setInputFiles. */
export const FIXTURES_DIR = path.join(__dirname);

export const FIXTURE_FILES = {
  text: path.join(FIXTURES_DIR, 'sample.txt'),
  image: path.join(FIXTURES_DIR, 'sample.png'),
  pdf: path.join(FIXTURES_DIR, 'sample.pdf'),
} as const;
