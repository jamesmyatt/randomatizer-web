# <img src="public/icon.svg" alt="" width="40"> Randomatizer web

Minimalist self-hosted private open-source dice roller. A web version of the [Randomatizer Android app](https://github.com/jamesmyatt/randomatizer).

## Features

- 2 modes:
  - **Basic**: 1–12 d6, shown as pips.
  - **Advanced**: up to 12 each of d4, d6, d8, d10, d12, d20 and d100, shown as numbers.
- Results and optional total. No modifiers.
- Optional, collapsible session history, never saved.
- Minimalist, flat, monochrome design. Light, dark or system theme. Custom dice colors, with pips that always contrast.
- Settings are saved in the browser (`localStorage`), per browser.
- Installable, and works offline once loaded (PWA).

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

Image tags: `latest` and `<major>`, `<major>.<minor>`, `<version>` for releases; `edge` for `main`. Images are built for `linux/amd64` and `linux/arm64`.

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

Pushing a tag `v<major>.<minor>.<patch>` (matching `version` in `package.json`) publishes the image to GHCR. Renovate keeps dependencies and the SHA-pinned GitHub Actions up to date.

## License

Apache-2.0. See [LICENSE](LICENSE).
