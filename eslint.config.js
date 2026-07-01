import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

/**
 * Flat config (ESLint 10).
 *
 * We deliberately do NOT extend the Airbnb shared config. The official
 * `eslint-config-airbnb` is unmaintained for flat config (its TypeScript variant is
 * archived), and the community flat port pulls in a large stylistic surface that
 * Prettier already owns. Instead we layer a curated set of Airbnb's high-value
 * correctness/consistency rules on top of typescript-eslint's recommended config, and
 * add `simple-import-sort` for deterministic import/export order.
 *
 * Formatting is Prettier's responsibility, so no stylistic/whitespace rules live here.
 */
export default tseslint.config(
  { ignores: ['dist', 'sample/dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: {
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // React hooks correctness
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Deterministic import/export order (auto-fixable)
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Airbnb-style correctness & consistency
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }], // warnOnce() legitimately uses console.warn
      'no-param-reassign': ['error', { props: false }],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'object-shorthand': ['error', 'always'],

      // TypeScript hygiene (Airbnb-TS spirit)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-shadow': 'off', // superseded by the type-aware version below
      '@typescript-eslint/no-shadow': 'error',
    },
  },
);
