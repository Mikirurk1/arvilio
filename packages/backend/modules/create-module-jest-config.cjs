const { baseConfig, repoRoot } = require('../../../jest.config.base.cjs');

/**
 * @param {string} moduleName e.g. module-vocabulary
 * @param {string} displayName Jest project name
 */
function createModuleJestConfig(moduleName, displayName) {
  const srcRoot = `packages/backend/modules/${moduleName}/src`;
  return {
    ...baseConfig,
    displayName,
    rootDir: repoRoot,
    testEnvironment: 'node',
    testMatch: [
      `<rootDir>/${srcRoot}/**/*.spec.ts`,
      ...(process.env.RUN_INTEGRATION_TESTS === '1'
        ? [
            `<rootDir>/packages/backend/modules/${moduleName}/tests/integration/**/*.integration.spec.ts`,
          ]
        : []),
    ],
    testPathIgnorePatterns: [
      ...(baseConfig.testPathIgnorePatterns ?? []),
      ...(process.env.RUN_INTEGRATION_TESTS === '1' ? [] : ['/tests/integration/']),
    ],
    collectCoverageFrom: [
      `<rootDir>/${srcRoot}/**/*.ts`,
      `!<rootDir>/${srcRoot}/**/*.spec.ts`,
      `!<rootDir>/${srcRoot}/index.ts`,
    ],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      '/.next/',
      '/materials/',
    ],
  };
}

module.exports = { createModuleJestConfig };
