#!/usr/bin/env node
/**
 * Scaffold layered structure for a backend domain module.
 * Usage: node scripts/scaffold-be-module.mjs <domain>
 * Example: node scripts/scaffold-be-module.mjs billing
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const domain = process.argv[2];
if (!domain || !/^[a-z][a-z0-9-]*$/.test(domain)) {
  console.error('Usage: node scripts/scaffold-be-module.mjs <domain>');
  process.exit(1);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const moduleDir = path.join(repoRoot, 'packages/backend/modules', `module-${domain}`);
const src = path.join(moduleDir, 'src');
const dirs = [
  'presentation/graphql',
  'presentation/rest',
  'application',
  'domain',
  'infrastructure',
  'shared',
  'tests/integration',
];

try {
  await access(moduleDir);
  console.error(`Module already exists: ${moduleDir}`);
  process.exit(1);
} catch {
  // ok
}

const Pascal = domain
  .split('-')
  .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
  .join('');

for (const d of dirs) {
  await mkdir(path.join(src, d), { recursive: true });
}

const moduleTs = `import { Module } from '@nestjs/common';
import { PrismaModule } from '@be/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ${Pascal}Module {}
`;

await writeFile(path.join(src, `${domain}.module.ts`), moduleTs);
await writeFile(
  path.join(src, 'index.ts'),
  `export * from './${domain}.module';\n`,
);
await writeFile(
  path.join(moduleDir, 'package.json'),
  JSON.stringify(
    {
      name: `@be/${domain}`,
      version: '0.0.1',
      private: true,
      exports: { '.': './src/index.ts' },
    },
    null,
    2,
  ) + '\n',
);
await writeFile(
  path.join(moduleDir, 'jest.config.cjs'),
  `const { createModuleJestConfig } = require('../create-module-jest-config.cjs');\n\nmodule.exports = createModuleJestConfig('module-${domain}', '@be/${domain}');\n`,
);
await writeFile(
  path.join(moduleDir, 'tsconfig.json'),
  `{
  "extends": "../../../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [{ "path": "./tsconfig.lib.json" }]
}\n`,
);
await writeFile(
  path.join(moduleDir, 'tsconfig.lib.json'),
  `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "declaration": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts", "tests/**/*.ts"]
}\n`,
);

console.log(`Scaffolded module-${domain} at ${moduleDir}`);
console.log('Next: add path alias @be/' + domain + ' in tsconfig.base.json and jest.paths.cjs');
