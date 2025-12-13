import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

import eslintPluginReadableTailwind from 'eslint-plugin-readable-tailwind';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  {
    files: ['*.ts', '*.tsx'],
  },
  {
    ignores: ['**/.next/**/*', 'next-env.d.ts'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['**/*.{jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'readable-tailwind': eslintPluginReadableTailwind,
    },
    rules: {
      ...eslintPluginReadableTailwind.configs.warning.rules,
      ...eslintPluginReadableTailwind.configs.error.rules,
      'readable-tailwind/multiline': ['warn', { printWidth: 120 }],
    },
  },
  eslintConfigPrettier,
);
