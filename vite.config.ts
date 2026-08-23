import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
// `base` is '/' for local dev/preview and commercial root-domain hosting, and is
// set to the repo sub-path (e.g. '/World-Explorer/') for the GitHub Pages preview
// via the PAGES_BASE env var in the deploy workflow.
const base = process.env.PAGES_BASE || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'World Explorer',
        short_name: 'Explorer',
        description: 'A child-friendly geography game. Explore the world, discover countries, earn your passport.',
        theme_color: '#1d6fb8',
        background_color: '#f4f9ff',
        display: 'standalone',
        orientation: 'any',
        // Relative so the installed PWA works under any base path (root or sub-path).
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the whole shell plus content: JS/CSS/HTML, the 194 flag SVGs,
        // icons, fonts and the generated JSON (country/geometry/question data), so
        // core non-map games AND the map work fully offline (PRD §20).
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        // The lazy-loaded 50m geometry chunk is ~1.3 MB; lift Workbox's 2 MiB
        // default so it (and any future large content chunk) is precached, not skipped.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Serve index.html for client-side routes when offline. Base-aware so it
        // resolves under both root and the GitHub Pages sub-path.
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
