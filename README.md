# <img src="public/icon.svg" alt="" width="40"> Randomatizer Web

Minimalist self-hosted private open-source dice roller.

The web version of the [Randomatizer Android app](https://github.com/jamesmyatt/randomatizer), kept in step with it: same features, behavior, design and wording. It differs only where the platform requires (see [Differences from the Android app](#differences-from-the-android-app)).

The `MAJOR.MINOR` version matches the Android app release it is in step with. `PATCH` counts web-only changes. For example, Web 1.0.x matches Android 1.0.x.

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
- **Name**: the app is called Randomatizer Web, to tell it apart from the Android app when both are installed. Its home-screen short name stays Randomatizer.
- **Settings sheet**: a centered dialog on wide screens, with a Close button, since browsers have no system back gesture.

## Principles

- **Private**: runs entirely in the browser. No server-side code, no external requests, no ads or tracking. A strict Content-Security-Policy allows only the app's own files.
- **Open**: Apache-2.0.
- **Fair**: Web Crypto `getRandomValues` with rejection sampling, so no modulo bias.

## Install

### Docker

The image serves the static app with unprivileged nginx on port 8080.

```sh
docker run -d -p 8080:8080 --read-only --tmpfs /tmp --cap-drop ALL ghcr.io/jamesmyatt/randomatizer-web:latest
```

Or with Compose, using [compose.yaml](compose.yaml):

```sh
docker compose up -d
```

Then open http://localhost:8080. For HTTPS, see [HTTPS](#https).

Image tags: `latest`, `<major>`, `<major>.<minor>` and `<major>.<minor>.<patch>` for releases; `edge` for `main`. Images are built for `linux/amd64` and `linux/arm64`.

To build the image yourself: `docker build -t randomatizer-web .`

### Alpine LXC (without Docker)

[scripts/alpine-install.sh](scripts/alpine-install.sh) installs the latest release into an Alpine Linux container, such as a Proxmox LXC (1 CPU, 256 MB RAM and 1 GB disk is plenty). It installs nginx, downloads the release's static build and checks its SHA-256, and sets nginx up with the same config and security headers as the Docker image. Run it as root inside the container:

```sh
wget -qO- https://raw.githubusercontent.com/jamesmyatt/randomatizer-web/main/scripts/alpine-install.sh | sh
```

Then open `http://<container-ip>:8080`. For HTTPS, see [HTTPS](#https). Run the same command again to update. Set `PORT` (default `8080`, as in the Docker image) to use another port, or `VERSION` (for example `1.0.0`) to install a specific release, e.g. `... | PORT=80 sh`.

### Other servers

Any static file server works: serve the `html/` folder from a release's `randomatizer-web-<version>.tar.gz`, or the `dist/` folder from `npm run build`. The tarball's `nginx/` folder has the nginx config.

### HTTPS

Browsers only install the app and run it offline over HTTPS (or on `localhost`). Put it behind your reverse proxy, or use [Tailscale Serve](https://tailscale.com/kb/1312/serve) on the machine or container that runs it:

```sh
tailscale serve --bg 8080
```

The app is then at `https://<machine-name>.<tailnet>.ts.net` for devices on your tailnet. If you use another port, serve that port instead. In a Proxmox LXC, install Tailscale with the [community script](https://community-scripts.org/scripts/add-tailscale-lxc) and log in with `tailscale up`.

## Changelog

See [changelogs/](changelogs) or [GitHub Releases](https://github.com/jamesmyatt/randomatizer-web/releases).

## Development

See [DEVELOPING.md](DEVELOPING.md) and [CONTRIBUTING.md](CONTRIBUTING.md). To publish a release, see [RELEASING.md](RELEASING.md). To report a vulnerability, see [SECURITY.md](SECURITY.md).

## License

Apache-2.0. See [LICENSE](LICENSE).
