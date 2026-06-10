import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5180, host: '127.0.0.1', strictPort: true, open: false },
  build: { outDir: 'dist', assetsDir: 'assets' },
});
