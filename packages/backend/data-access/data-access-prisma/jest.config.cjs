const { baseConfig, repoRoot } = require('../../../../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  displayName: 'data-access-prisma',
  rootDir: repoRoot,
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/packages/backend/data-access/data-access-prisma/src/**/*.spec.ts',
  ],
  collectCoverageFrom: [
    '<rootDir>/packages/backend/data-access/data-access-prisma/src/**/*.ts',
    '!<rootDir>/packages/backend/data-access/data-access-prisma/src/**/*.spec.ts',
    '!<rootDir>/packages/backend/data-access/data-access-prisma/src/index.ts',
  ],
};
