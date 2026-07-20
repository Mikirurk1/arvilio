const integrationEnabled = process.env.RUN_INTEGRATION_TESTS === '1';

const unitProjects = [
  '<rootDir>/packages/backend/data-access/data-access-prisma/jest.config.cjs',
  '<rootDir>/packages/backend/shared/tenant/jest.config.cjs',
  '<rootDir>/packages/backend/shared/storage/jest.config.cjs',
  '<rootDir>/packages/shared/types/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-auth/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-vocabulary/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-chat/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-lessons/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-flashcards/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-speaking/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-materials/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-notifications/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-progress/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-assistant/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-platform-admin/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-mail/jest.config.cjs',
  '<rootDir>/packages/backend/modules/module-billing/jest.config.cjs',
  '<rootDir>/apps/campus/jest.config.cjs',
  '<rootDir>/apps/hub/jest.config.cjs',
];

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    ...unitProjects,
    ...(integrationEnabled ? ['<rootDir>/jest.integration.config.cjs'] : []),
  ],
};
