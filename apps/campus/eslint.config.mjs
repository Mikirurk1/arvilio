import nextEslintPluginNext from '@next/eslint-plugin-next';
import baseConfig from '../../eslint.config.mjs';

export default [
  { plugins: { '@next/next': nextEslintPluginNext } },
  ...baseConfig,
  {
    ignores: ['.next/**/*', 'public/pdfjs/**'],
  },
  // Package-cwd patterns (flat config `files` are relative to the lint cwd).
  {
    files: ['src/mocks/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
