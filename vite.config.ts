/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

/** The nginx security headers, so `vite preview` (and the E2E tests) enforce the same CSP. */
const securityHeaders = Object.fromEntries(
  [
    ...readFileSync('nginx/security-headers.conf', 'utf8').matchAll(
      /^add_header (\S+) "([^"]*)" always;$/gm,
    ),
  ].map(([, name, value]) => [name, value]),
)

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registered in src/main.ts, which reloads the page when an update has been downloaded.
      injectRegister: false,
      manifest: {
        name: 'Randomatizer Web',
        short_name: 'Randomatizer',
        description: 'Minimalist self-hosted private open-source dice roller',
        theme_color: '#fbfbfb',
        background_color: '#fbfbfb',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Activate updates straight away (src/main.ts then reloads the page), and control the page
        // from the first visit so it works offline without a reload.
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  preview: {
    headers: securityHeaders,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
