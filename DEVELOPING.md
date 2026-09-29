# Developing

## Setup

Needs Node.js 24 (see `.nvmrc`).

```sh
npm install
npx playwright install chromium   # once, for the end-to-end tests
```

## Commands

```sh
npm run dev        # dev server with hot reload
npm run format     # format with Prettier
npm run lint       # Prettier check and ESLint
npm run check      # type check
npm test           # unit tests (Vitest)
npm run test:e2e   # end-to-end and accessibility tests (Playwright, axe)
npm run build      # production build in dist/
npm run preview    # serve dist/ with the same security headers as nginx
```

CI runs lint, type check, unit tests and the build on each pull request and push to `main`. It also builds the Docker image, runs the end-to-end tests against it and scans it with Trivy.

## Tests

- Unit tests (`src/lib/*.test.ts`) cover the pure logic, ported from the Android app's tests. They use a seeded random source for determinism.
- End-to-end tests (`e2e/`) run in a phone-sized Chromium. They fail on any console error or Content-Security-Policy violation, and check accessibility with axe in light and dark themes. By default they build the app and test `npm run preview`. To test another server, such as the Docker image, set `BASE_URL`:

  ```sh
  docker build -t randomatizer-web . && docker run -d -p 8080:8080 randomatizer-web
  BASE_URL=http://localhost:8080 npm run test:e2e
  ```

## Stack

[Svelte 5](https://svelte.dev/), TypeScript, [Vite](https://vite.dev/), [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/), [vite-plugin-pwa](https://vite-pwa-org.netlify.app/). The container uses [nginx-unprivileged](https://github.com/nginx/docker-nginx-unprivileged).

## Dependencies

Renovate opens weekly PRs for npm packages, Docker base images and GitHub Actions. Actions and base images are pinned to digests.

## Icons

`public/icon.svg` is the Android app's icon. After changing it, regenerate the PNGs with `npm run generate-pwa-assets`.
