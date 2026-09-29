# Randomatizer Web

Static, client-side web version of the Randomatizer Android app (github.com/jamesmyatt/randomatizer). Apache-2.0.

## Parity with the Android app

This is a companion to the Android app, not a one-off port. Keep the two in step.

- Features, behavior, limits, layout rules, colors, palette and UI strings match the Android app. Copy wording from its `app/src/main/res/values/strings.xml`.
- The only allowed differences are the platform ones listed under "Differences from the Android app" in `README.md`. Add any new one there, with the reason.
- When porting an Android change, read the Android code and tests (clone the repo for reference), port the tests to Vitest, and set `MAJOR.MINOR` to the Android version (see Versioning).
- New functionality goes into the Android app first, then gets ported here. Don't add a feature here that the Android app doesn't have, unless it is specific to the web platform. If a request would need one, say so and suggest adding it to the Android app first.
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
- `e2e/`: Playwright tests. `vite.config.ts` reads `nginx/security-headers.conf` so `vite preview` sends the same headers.
- `nginx/`, `Dockerfile`, `compose.yaml`: container. Base images are pinned by digest.
- `scripts/alpine-install.sh`: installs or updates a release in an Alpine LXC. It downloads the tarball that `.github/workflows/docker.yml` attaches to each GitHub Release (`html/` and `nginx/`). Keep the two in step. POSIX `sh`, no bash or curl.

## UI rules

Same as the Android app (see its CLAUDE.md for the full rules): monochrome (accents use `onSurface`/`surface`), history pinned to the bottom (main area capped at 60% when expanded), die size from `dieSize` only, dice color sets the face only, outline below 3:1 face vs background, warning below 3:1 face vs pips.

## Commands

`npm run lint`, `npm run check`, `npm test`, `npm run build`, `npm run test:e2e` (Playwright and axe; fails on console errors and CSP violations). CI runs them all, the E2E tests against the Docker image, and a Trivy scan of the image. Setup is in `DEVELOPING.md`.

## Versioning

- `version` in `package.json` is semver `MAJOR.MINOR.PATCH`. The app shows it in Settings.
- `MAJOR.MINOR` always matches the Android app's `MAJOR.MINOR` for the release this code is in step with. Change it only when porting that release, and reset PATCH to 0. (Android bumps MAJOR for most code changes, and MINOR only for small additions or tweaks that don't change existing behavior. See its CLAUDE.md.)
- PATCH is independent of the Android app's PATCH. Bump it for any web-only change: fixes, build, docs, and behavior specific to the web platform. Shared functionality comes from porting an Android release, not a PATCH.
- Bump the version at most once per branch/PR, relative to the base branch. Update the version line in `README.md` when `MAJOR.MINOR` changes.
- Every version bump adds `changelogs/<version>.md`, the release notes. CI fails if the file for `package.json`'s version is missing. Don't add a separate `CHANGELOG.md`.
- Pushing tag `v<MAJOR>.<MINOR>.<PATCH>` publishes the image and a GitHub Release with the static build; the tag must match `package.json`. Release steps are in `RELEASING.md`. Don't push release tags unless asked.

## Conventions

- American English in UI strings, code and docs, as in the Android app.
- Prettier formatting (`npm run format`).
- GitHub Actions are pinned to commit SHAs; Renovate updates them.
- The README is for users. Developer docs are in `DEVELOPING.md`, `CONTRIBUTING.md`, `RELEASING.md` and `SECURITY.md`, as in the Android repo.
