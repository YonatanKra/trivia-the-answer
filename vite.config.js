import { defineConfig } from 'vitest/config'

console.log("Build: ", `'${process.env.GOOGLE_API_KEY}'`);
console.log(process.env.GOOGLE_API_KEY);
export default defineConfig({
  define: {
    GOOGLE_API_KEY: `'${process.env.GOOGLE_API_KEY}'`
  },
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