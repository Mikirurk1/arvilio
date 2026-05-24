#!/usr/bin/env node
/**
 * One-time fix after squashing incremental migrations into 20260501000000_baseline.
 * Run only if migrate dev fails with P3006 / "User does not exist" on shadow DB
 * and `_prisma_migrations` still lists the old 20260517* / 20260518* / 20260519* names.
 *
 * Does NOT change application tables — only the migration history table.
 */
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const schema = path.join(
  'packages/backend/data-access/data-access-prisma/prisma/schema.prisma',
);
const baseline = '20260501000000_baseline';

function run(cmd, args, input) {
  const result = spawnSync(cmd, args, {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('[prisma-rebaseline] Clearing _prisma_migrations…');
run('npx', ['prisma', 'db', 'execute', '--stdin', '--schema', schema], 'DELETE FROM "_prisma_migrations";\n');

console.log(`[prisma-rebaseline] Marking ${baseline} as applied…`);
run('npx', ['prisma', 'migrate', 'resolve', '--applied', baseline, '--schema', schema]);

console.log('[prisma-rebaseline] Done. Run: npm run prisma:migrate:dev');
