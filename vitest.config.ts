import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@w': resolve(__dirname, 'webview'),
      '@r': resolve(__dirname, 'resources'),
      'luogu-api': resolve(__dirname, 'luogu-api-docs', 'luogu-api.d.ts')
    }
  },
  test: {
    include: ['src/**/*.test.ts', 'webview/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'webview/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'webview/**/*.test.tsx',
        'src/global.d.ts',
        'src/extension.ts'
      ]
    }
  }
});
