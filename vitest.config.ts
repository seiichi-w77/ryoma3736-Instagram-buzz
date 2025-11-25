/**
 * Vitest configuration
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'next.config.js',
        'postcss.config.js',
        'tailwind.config.js',
        'vitest.config.ts',
        'vitest.setup.ts',
        'examples/**',
        'lib/supabase/examples.ts',
        'components/index.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        // UI components are difficult to test without full React rendering
        'components/ui/**',
        'components/layout/**',
        // Page components require Next.js runtime
        'app/page.tsx',
        'app/layout.tsx',
        // Entry point with minimal logic
        'src/index.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 70,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
