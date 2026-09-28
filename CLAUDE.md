# Randomatizer web

Static, client-side web version of the Randomatizer Android app (github.com/jamesmyatt/randomatizer). Apache-2.0.

## Parity with the Android app

This is a companion to the Android app, not a one-off port. Keep the two in step.

- Features, behavior, limits, layout rules, colors, palette and UI strings match the Android app. Copy wording from its `app/src/main/res/values/strings.xml`.
- The only allowed differences are the platform ones listed under "Differences from the Android app" in `README.md`. Add any new one there, with the reason.
- When porting an Android change, read the Android code and tests (clone the repo for reference), port the tests to Vitest, and update "Matches Android app version" in `README.md`.
- If a change here would also make sense in the Android app, say so rather than letting the apps drift apart.
- Keep the module structure mirroring the Android packages: `dice/` → `lib/dice.ts` and `lib/random.ts`, `history/` → `lib/history.ts`, `color/` → `lib/color.ts`, `settings/AppSettings.kt` → `lib/settings.ts`, `ui/DieSize.kt` → `lib/dieSize.ts`, `ui/Palette.kt` → `lib/palette.ts`, `RollerViewModel` → `lib/roller.svelte.ts`.

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

Same as the Android app (see its CLAUDE.md for the full rules): monochrome (accents use `onSurface`/`surface`), history pinned to the bottom (main area capped at 60% when expanded), die size from `dieSize` only, dice color sets the face only, outline below 3:1 face vs background, warning below 3:1 face vs pips.

## Commands

`npm run lint`, `npm run check`, `npm test`, `npm run build`. CI runs all four and a Docker smoke test.

## Versioning

- `version` in `package.json` is `MAJOR.MINOR.PATCH`, the same scheme as the Android app. The app shows it in Settings.
- Most code changes bump MAJOR and reset MINOR and PATCH to 0. Bump PATCH only for small fixes, docs or build-only changes.
- Bump the version at most once per branch/PR, relative to the base branch (use a MAJOR bump if any change on the branch needs one).
- Pushing tag `v<MAJOR>.<MINOR>.<PATCH>` publishes the image; the tag must match `package.json`. Don't push release tags unless asked.

## Conventions

- American English in UI strings, code and docs, as in the Android app.
- Prettier formatting (`npm run format`).
- GitHub Actions are pinned to commit SHAs; Renovate updates them.
