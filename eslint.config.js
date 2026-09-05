// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

/**
 * ESLint flat configuration.
 * Enforces recommended JS + TypeScript rules, and requires braces on all
 * control statements via `curly: "all"`.
 */
module.exports = tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      // Content code artifacts are display data, not project source.
      'src/contents/**/*.js',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      curly: ['error', 'all'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        module: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      curly: ['error', 'all'],
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // Test files run under Jest.
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
);
