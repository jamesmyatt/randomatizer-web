import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Regenerate the icons in public/ with `npm run generate-pwa-assets` after changing public/icon.svg.
export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/icon.svg'],
})
