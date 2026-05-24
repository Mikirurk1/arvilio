const { repoRoot, moduleNameMapper } = require('./jest.paths.cjs');

/** @type {import('jest').Config} */
const baseConfig = {
  rootDir: repoRoot,
  moduleNameMapper,
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', decorators: true, tsx: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
          target: 'es2021',
        },
        module: { type: 'commonjs' },
      },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.next/', '/materials/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/materials/',
    '/mocks/',
    '\\.spec\\.ts$',
    '\\.test\\.(ts|tsx)$',
  ],
  coverageReporters: ['text', 'text-summary', 'lcov'],
};

module.exports = { baseConfig, repoRoot };
