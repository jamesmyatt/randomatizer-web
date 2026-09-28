# <img src="public/icon.svg" alt="" width="40"> Randomatizer web

Minimalist self-hosted private open-source dice roller.

The web version of the [Randomatizer Android app](https://github.com/jamesmyatt/randomatizer), kept in step with it: same features, behavior, design and wording. It differs only where the platform requires (see [Differences from the Android app](#differences-from-the-android-app)).

Matches Android app version **1.0**.

## Features

- 2 modes:
  - **Basic**: 1–12 d6, shown as pips.
  - **Advanced**: up to 12 each of d4, d6, d8, d10, d12, d20 and d100, shown as numbers.
- Results and optional total. No modifiers.
- Optional, collapsible session history, never saved.
- Minimalist, flat, monochrome design. Light, dark or system theme. Custom dice colors, with pips that always contrast.
- Settings are saved in the browser (`localStorage`), per browser.
- Installable, and works offline once loaded (PWA).

## Differences from the Android app

- **Colors**: browsers don't expose Android's dynamic (Material You) colors, so the app uses a fixed neutral light and dark palette.
- **Settings storage**: saved in the browser's `localStorage` instead of on the device.
- **Install and offline**: a PWA instead of an APK. Offline use and installing need HTTPS or `localhost`.
- **Hosting**: self-hosted as a static site (Docker image provided).
- **Settings sheet**: a centered dialog on wide screens, with a Close button, since browsers have no system back gesture.

## Principles

- **Private**: runs entirely in the browser. No server-side code, no external requests, no ads or tracking. A strict Content-Security-Policy allows only the app's own files.
- **Open**: Apache-2.0.
- **Fair**: Web Crypto `getRandomValues` with rejection sampling, so no modulo bias.

## Self-hosting

The image serves the static app with unprivileged nginx on port 8080.

```sh
docker run -d -p 8080:8080 --read-only --tmpfs /tmp --cap-drop ALL ghcr.io/jamesmyatt/randomatizer-web:latest
```

Or with Compose, using [compose.yaml](compose.yaml):

```sh
docker compose up -d
```

Then open http://localhost:8080. Put it behind your reverse proxy for HTTPS: browsers only install the PWA and run its service worker on HTTPS or `localhost`.

Image tags: `latest`, `<major>`, `<major>.<minor>` and `<major>.<minor>.<patch>` for releases; `edge` for `main`. Images are built for `linux/amd64` and `linux/arm64`.

To build the image yourself: `docker build -t randomatizer-web .`

Any static file server works too: serve the `dist/` folder from `npm run build`.

## Development

Needs Node.js 24 (see `.nvmrc`).

```sh
npm install
npm run dev      # dev server with hot reload
npm run lint     # Prettier and ESLint (npm run format to fix)
npm run check    # type check
npm test         # unit tests
npm run build    # production build in dist/
```

Stack: [Svelte 5](https://svelte.dev/), TypeScript, [Vite](https://vite.dev/), [Vitest](https://vitest.dev/), [vite-plugin-pwa](https://vite-pwa-org.netlify.app/).

## Releases

Versions are `MAJOR.MINOR.PATCH`. Pushing a tag `v<MAJOR>.<MINOR>.<PATCH>` (matching `version` in `package.json`) publishes the image to GHCR. Renovate keeps dependencies and the SHA-pinned GitHub Actions up to date.

## License

Apache-2.0. See [LICENSE](LICENSE).
