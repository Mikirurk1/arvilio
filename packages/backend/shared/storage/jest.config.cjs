const { baseConfig, repoRoot } = require('../../../../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  displayName: 'storage',
  rootDir: repoRoot,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/backend/shared/storage/src/**/*.spec.ts'],
};
