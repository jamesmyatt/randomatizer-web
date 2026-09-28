# Randomatizer web

Static, client-side web port of the Randomatizer Android app (github.com/jamesmyatt/randomatizer). Apache-2.0.

## Hard rules

- Client-side only: no backend, no external requests, no analytics, no CDN assets. Everything is served from the app's own origin, and `nginx/security-headers.conf` enforces that with a strict CSP. Don't weaken it.
- Svelte markup must not use `style="..."` attributes (blocked by `style-src 'self'`). Use `style:prop` directives or classes.
- Roll history lives in memory only (`RollerState`). Never persist it.
- Only settings may be persisted, in `localStorage` under `randomatizer:settings`, via `lib/settings.ts`.
- All roll randomness goes through `RandomSource` / `DiceRoller` (`secureRandomSource` in production). The roll animation's random faces are cosmetic and use `Math.random`.
- `src/lib/*.ts` (except `roller.svelte.ts`) is pure logic with unit tests. Keep it free of DOM access.

## Layout

- `src/lib/`: `dice`, `random`, `history`, `color` (WCAG contrast, `dieStyle`), `settings`, `dieSize`, `palette`, `theme` (light/dark color roles), `roller.svelte.ts` (app state).
- `src/components/`: Svelte components. `src/App.svelte`: layout, theme, roll animation.
- `public/`: icons. `public/icon.svg` copies the Android app icon; regenerate the PNGs with `npm run generate-pwa-assets`.
- `nginx/`, `Dockerfile`, `compose.yaml`: container.

## UI rules

Same as the Android app: monochrome (accents use `onSurface`/`surface`), history pinned to the bottom (main area capped at 60% when expanded), die size from `dieSize` only, dice color sets the face only, outline below 3:1 face vs background, warning below 3:1 face vs pips.

## Commands

`npm run lint`, `npm run check`, `npm test`, `npm run build`. CI runs all four and a Docker smoke test.

## Conventions

- American English in UI strings, code and docs, as in the Android app.
- Prettier formatting (`npm run format`).
- GitHub Actions are pinned to commit SHAs; Renovate updates them.
