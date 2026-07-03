const { baseConfig, repoRoot } = require('../../../jest.config.base.cjs');

const srcRoot = 'packages/shared/types/src';

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  displayName: 'shared-types',
  rootDir: repoRoot,
  testEnvironment: 'node',
  testMatch: [`<rootDir>/${srcRoot}/**/*.{test,spec}.ts`],
  collectCoverageFrom: [
    `<rootDir>/${srcRoot}/**/*.ts`,
    `!<rootDir>/${srcRoot}/**/*.{test,spec}.ts`,
    `!<rootDir>/${srcRoot}/index.ts`,
  ],
};
