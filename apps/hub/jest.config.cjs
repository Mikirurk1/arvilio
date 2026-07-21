const { baseConfig, repoRoot } = require('../../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  displayName: 'hub',
  rootDir: repoRoot,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/apps/hub/src/**/*.test.ts'],
  moduleNameMapper: {
    ...(baseConfig.moduleNameMapper || {}),
    '^@/(.*)$': '<rootDir>/apps/hub/src/$1',
  },
};
