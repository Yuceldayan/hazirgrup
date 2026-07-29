import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@hazirgrup/types': r('./packages/types/src/index.ts'),
      '@hazirgrup/ui': r('./packages/ui/src/index.ts'),
      '@hazirgrup/core': r('./packages/core/src/index.ts'),
      '@hazirgrup/validation': r('./packages/validation/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/**/src/**/*.test.ts',
      'apps/**/src/**/*.test.ts',
      'tests/**/*.test.ts',
      'scripts/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/__tests__/**', '**/index.ts', 'packages/*/src/seed/**'],
    },
    reporters: ['default'],
  },
});
