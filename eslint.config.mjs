import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['**/dist', '**/.next', '**/node_modules', '**/out-tsc'],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/no-unresolved': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: [
      '**/*.config.cjs',
      '**/jest*.cjs',
      '**/create-module-jest-config.cjs',
      'jest.paths.cjs',
      'apps/api/scripts/**/*.cjs',
      'scripts/**/*.cjs',
    ],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.config.mjs', '**/next.config.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },
  {
    files: ['apps/campus/**/*.{tsx,jsx}', 'apps/platform/**/*.{tsx,jsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='button']",
          message:
            'Use <Button> from @fe/ui (Campus: @/components/ui) instead of raw <button>. Use variant="bare" for custom-styled hit targets.',
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message:
            'Use <Field as="select"> or as="advancedSelect" from @fe/ui instead of raw <select>.',
        },
      ],
    },
  },
  {
    files: ['apps/campus/**/*.{ts,tsx,js,jsx}', 'packages/frontend/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@be/*', '@pkg/*'],
        },
      ],
    },
  },
  {
    files: ['apps/campus/src/mocks/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['apps/api/**/*.{ts,tsx,js,jsx}', 'packages/backend/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@fe/*'],
        },
      ],
    },
  },
  {
    files: ['packages/backend/modules/**/src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@nestjs/*', '@be/prisma'],
        },
      ],
    },
  },
  {
    files: [
      'packages/backend/modules/**/src/application/**/*.ts',
      'packages/backend/modules/**/src/presentation/**/*.ts',
    ],
    rules: {
      'max-lines': ['error', { max: 550, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['packages/backend/shared/graphql/src/graphql.types.ts'],
    rules: {
      'max-lines': 'off',
    },
  },
  {
    files: ['packages/backend/modules/**/src/domain/**/*.ts'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './',
              from: ['**/application/**', '**/presentation/**', '**/infrastructure/**'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/backend/modules/**/src/application/**/*.ts'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './',
              from: ['**/presentation/**'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/**/*.{ts,tsx}', 'packages/backend/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@be/*/src/*'],
              message: 'Import from the package root (@be/module-name), not deep paths.',
            },
          ],
        },
      ],
    },
  },
  // Multi-tenant isolation guardrails (ADR-005, G5): raw SQL bypasses the
  // tenant `$extends` scoping, and `asPlatform()` is the single audited
  // cross-tenant bypass. Exclude tests and the data-access package itself
  // (which owns the Prisma client + defines `asPlatform`). When the
  // platform-admin module lands, add its path to `ignores` (it may call
  // `asPlatform()`).
  {
    files: ['apps/api/**/*.{ts,tsx}', 'packages/backend/**/*.{ts,tsx}'],
    ignores: [
      '**/*.spec.ts',
      'tests/**',
      'packages/backend/data-access/data-access-prisma/**',
      // platform-admin is the single authorized consumer of asPlatform() (ADR-009).
      'packages/backend/modules/module-platform-admin/**',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[property.name=/^\\$(queryRaw|queryRawUnsafe|executeRaw|executeRawUnsafe)$/]",
          message:
            'Raw SQL bypasses tenant $extends scoping (G5). Use TenantPrismaService.client; for audited cross-tenant access use asPlatform() in @be/platform-admin.',
        },
        {
          selector: "CallExpression[callee.property.name='asPlatform']",
          message:
            'asPlatform() is the audited cross-tenant bypass — only @be/platform-admin (and its tests) may call it. For tenant data use the request-scoped TenantPrismaService.client.',
        },
      ],
    },
  },
];
