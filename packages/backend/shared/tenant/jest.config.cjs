const { baseConfig, repoRoot } = require('../../../../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  displayName: 'tenant',
  rootDir: repoRoot,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/backend/shared/tenant/src/**/*.spec.ts'],
};
