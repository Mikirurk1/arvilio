const path = require('node:path');
const nextJest = require('next/jest');
const { moduleNameMapper } = require('../../jest.paths.cjs');

const createJestConfig = nextJest({ dir: __dirname });

/** @type {import('jest').Config} */
module.exports = createJestConfig({
  displayName: 'campus',
  rootDir: path.join(__dirname, '../..'),
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/apps/campus/src/**/*.test.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/apps/campus/jest.setup.ts'],
  collectCoverageFrom: [
    '<rootDir>/apps/campus/src/lib/**/*.{ts,tsx}',
    '<rootDir>/apps/campus/src/stores/**/*.{ts,tsx}',
    '<rootDir>/apps/campus/src/components/ui/**/*.{ts,tsx}',
    '<rootDir>/apps/campus/src/features/**/*.{ts,tsx}',
    '!<rootDir>/apps/campus/src/**/*.test.{ts,tsx}',
    '<rootDir>/apps/campus/src/mocks/index.ts',
    '!<rootDir>/apps/campus/src/mocks/domains/**',
    '!<rootDir>/apps/campus/src/mocks/content/**',
    '!<rootDir>/apps/campus/src/mocks/session.ts',
    '!<rootDir>/apps/campus/src/mocks/roles.ts',
  ],
  moduleNameMapper: {
    ...moduleNameMapper,
    '^@/(.*)$': '<rootDir>/apps/campus/src/$1',
  },
});
