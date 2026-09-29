# Releasing

`.github/workflows/docker.yml` publishes a release when a `v<MAJOR>.<MINOR>.<PATCH>` tag is pushed:

- Docker images on GHCR: `ghcr.io/jamesmyatt/randomatizer-web:<version>`, `:<major>.<minor>`, `:<major>` and `:latest`, for `linux/amd64` and `linux/arm64`.
- A GitHub Release with the changelog as its notes and `randomatizer-web-<version>.tar.gz` (the static build and nginx config, used by `scripts/alpine-install.sh`) with its SHA-256 checksum.

Every push to `main` also publishes the `:edge` image.

## One-time setup

After the first image is published: your GitHub profile → **Packages** → **randomatizer-web** → **Package settings** → **Change visibility** → **Public**. New packages are private, even from a public repository.

## Each release

1. Make sure `package.json` has the right version and `changelogs/<version>.md` exists. The changelog becomes the release notes. See `CLAUDE.md` for how to choose the version.
2. Create the tag `v<MAJOR>.<MINOR>.<PATCH>` on `main`, either way:
   - With git: `git tag v1.0.0 && git push origin v1.0.0`.
   - On GitHub: Releases → **Draft a new release** → type `v1.0.0` under **Choose a tag** → **Create new tag on publish**, target `main` → **Publish release**. Leave the notes empty; the workflow replaces them with the changelog. A saved draft doesn't create the tag, so nothing runs until you publish.

The workflow fails if the tag doesn't match the version, the changelog is missing, or the build fails.
