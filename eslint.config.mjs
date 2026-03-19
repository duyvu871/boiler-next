import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import pluginQuery from '@tanstack/eslint-plugin-query';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...pluginQuery.configs['flat/recommended'],
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'generated/**',
  ]),
]);

export default eslintConfig;
