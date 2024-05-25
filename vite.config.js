import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: './src',
  publicDir: './public',
  build: {
    outDir: '../dist',
    assetsDir: './lib',
    emptyOutDir: true
  },
  test: {
    globals: true,
    environment: 'jsdom'
  },
});