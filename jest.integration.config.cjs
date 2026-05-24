const { moduleNameMapper, repoRoot } = require('./jest.paths.cjs');

/** @type {import('jest').Config} */
module.exports = {
  displayName: 'api-integration',
  rootDir: repoRoot,
  testEnvironment: 'node',
  moduleNameMapper,
  testMatch: [
    '<rootDir>/apps/api/src/**/*.integration.spec.ts',
    '<rootDir>/tests/integration/**/*.integration.spec.ts',
    '<rootDir>/packages/backend/modules/**/tests/integration/**/*.integration.spec.ts',
  ],
  testTimeout: 60_000,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tests/integration/tsconfig.json',
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.next/', '/materials/'],
};
