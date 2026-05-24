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
    files: ['apps/web/**/*.{ts,tsx,js,jsx}', 'packages/frontend/**/*.{ts,tsx,js,jsx}'],
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
    files: ['apps/web/src/mocks/**/*.{ts,tsx,js,jsx}'],
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
];
