import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/*/src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
      exclude: ['packages/*/src/**/*.{test,spec}.{ts,tsx}', 'packages/*/src/**/index.ts'],
    },
  },
})
