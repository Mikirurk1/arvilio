const path = require('node:path');
const nextJest = require('next/jest');
const { moduleNameMapper } = require('../../jest.paths.cjs');

const createJestConfig = nextJest({ dir: __dirname });

/** @type {import('jest').Config} */
module.exports = createJestConfig({
  displayName: 'web',
  rootDir: path.join(__dirname, '../..'),
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/apps/web/src/**/*.test.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/apps/web/jest.setup.ts'],
  collectCoverageFrom: [
    '<rootDir>/apps/web/src/lib/**/*.{ts,tsx}',
    '<rootDir>/apps/web/src/stores/**/*.{ts,tsx}',
    '<rootDir>/apps/web/src/components/ui/**/*.{ts,tsx}',
    '<rootDir>/apps/web/src/features/**/*.{ts,tsx}',
    '!<rootDir>/apps/web/src/**/*.test.{ts,tsx}',
    '<rootDir>/apps/web/src/mocks/index.ts',
    '!<rootDir>/apps/web/src/mocks/domains/**',
    '!<rootDir>/apps/web/src/mocks/content/**',
    '!<rootDir>/apps/web/src/mocks/session.ts',
    '!<rootDir>/apps/web/src/mocks/roles.ts',
  ],
  moduleNameMapper: {
    ...moduleNameMapper,
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
  },
});
