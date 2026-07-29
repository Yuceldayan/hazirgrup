import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.expo/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'supabase/seed/seed.sql',
      'apps/web/src/styles/tokens.css',
      'apps/mobile/expo-env.d.ts',
      'apps/web/next-env.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.es2023 },
    },
    rules: {
      // Kod kalitesi (docs/DECISIONS.md ve §24 Kod Kalitesi)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message:
            'Test edilebilirlik için `new Date()` yerine bir `now` parametresi geçirin (packages/core saf tutulur).',
        },
      ],
    },
  },

  // React hook kuralları — .ts dosyalarını da kapsar.
  // Özel hook'lar (ör. apps/mobile/src/hooks/useAsync.ts) JSX içermez ve `.ts`
  // uzantılıdır; yalnızca `.tsx` kapsanırsa hem kurallar çalışmaz hem de
  // dosyadaki `eslint-disable` yorumları "rule not found" hatası verir.
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // JSX erişilebilirlik kuralları — yalnızca JSX içeren dosyalar.
  {
    files: ['apps/**/*.tsx', 'packages/**/*.tsx'],
    plugins: { 'jsx-a11y': jsxA11y },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      'jsx-a11y/no-autofocus': 'off',
    },
  },

  // Next.js sunucu tarafı: console.error/warn serbest, Date serbest (RSC gerçek zaman kullanır)
  {
    files: ['apps/web/**/*.{ts,tsx}', 'apps/mobile/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },

  // Scriptler ve config dosyaları
  {
    files: ['scripts/**/*.ts', '*.config.{ts,mjs,js}', '**/*.config.{ts,mjs,js}'],
    rules: {
      'no-console': 'off',
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Testler
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', 'e2e/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
);
