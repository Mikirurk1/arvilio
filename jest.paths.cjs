const path = require('node:path');

const repoRoot = path.resolve(__dirname);

/** @param {string} relativeFromRepoRoot */
function abs(relativeFromRepoRoot) {
  return path.join(repoRoot, relativeFromRepoRoot).replace(/\\/g, '/');
}

/** Path aliases aligned with tsconfig.base.json */
const moduleNameMapper = {
  '^@tests/integration/(.*)$': abs('tests/integration/$1'),
  '^@fe/ui$': abs('packages/frontend/shared-ui/src/index.ts'),
  '^@fe/utils$': abs('packages/frontend/shared-utils/src/index.ts'),
  '^@fe/vocabulary$': abs('packages/frontend/feature-vocabulary/src/index.ts'),
  '^@fe/flashcards$': abs('packages/frontend/feature-flashcards/src/index.ts'),
  '^@fe/lessons$': abs('packages/frontend/feature-lessons/src/index.ts'),
  '^@fe/progress$': abs('packages/frontend/feature-progress/src/index.ts'),
  '^@be/graphql$': abs('packages/backend/shared/graphql/src/index.ts'),
  '^@be/storage$': abs('packages/backend/shared/storage/src/index.ts'),
  '^@be/auth$': abs('packages/backend/modules/module-auth/src/index.ts'),
  '^@be/vocabulary$': abs('packages/backend/modules/module-vocabulary/src/index.ts'),
  '^@be/platform-integration$': abs(
    'packages/backend/modules/module-vocabulary/src/application/platform-integration/index.ts',
  ),
  '^@be/flashcards$': abs('packages/backend/modules/module-flashcards/src/index.ts'),
  '^@be/speaking$': abs('packages/backend/modules/module-speaking/src/index.ts'),
  '^@be/materials$': abs('packages/backend/modules/module-materials/src/index.ts'),
  '^@be/lessons$': abs('packages/backend/modules/module-lessons/src/index.ts'),
  '^@be/progress$': abs('packages/backend/modules/module-progress/src/index.ts'),
  '^@be/assistant$': abs('packages/backend/modules/module-assistant/src/index.ts'),
  '^@be/platform-admin$': abs('packages/backend/modules/module-platform-admin/src/index.ts'),
  '^@be/mail$': abs('packages/backend/modules/module-mail/src/index.ts'),
  '^@be/billing/entitlements$': abs('packages/backend/modules/module-billing/src/entitlements.ts'),
  '^@be/billing/platform-billing$': abs(
    'packages/backend/modules/module-billing/src/platform-billing.ts',
  ),
  '^@be/billing$': abs('packages/backend/modules/module-billing/src/index.ts'),
  '^@be/notifications$': abs('packages/backend/modules/module-notifications/src/index.ts'),
  '^@be/notifications/telegram$': abs(
    'packages/backend/modules/module-notifications/src/infrastructure/telegram-bot.client.ts',
  ),
  '^@be/chat$': abs('packages/backend/modules/module-chat/src/index.ts'),
  '^@be/prisma$': abs('packages/backend/data-access/data-access-prisma/src/index.ts'),
  '^@be/tenant$': abs('packages/backend/shared/tenant/src/index.ts'),
  '^@pkg/types$': abs('packages/shared/types/src/index.ts'),
  '^@be/email-templates$': abs('packages/backend/email-templates/dist/index.js'),
};

module.exports = { repoRoot, moduleNameMapper };
