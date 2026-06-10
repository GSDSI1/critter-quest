import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Critter Quest',
        short_name: 'CritterQuest',
        description: 'A creature-collecting RPG adventure',
        theme_color: '#0f0f1a',
        background_color: '#0f0f1a',
        display: 'standalone',
        icons: [{ src: 'pwa-192.png', sizes: '192x192', type: 'image/png' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,webmanifest,png,wav}'],
        globIgnores: ['**/critters/**'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/critters\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'critter-sprites',
              expiration: { maxEntries: 320, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  base: './',
  server: { port: 5180, host: '127.0.0.1', strictPort: true, open: false },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) return 'phaser';
          if (id.includes('/src/data/')) return 'game-data';
        },
      },
    },
  },
});
