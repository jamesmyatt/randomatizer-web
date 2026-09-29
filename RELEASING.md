# Releasing

`.github/workflows/docker.yml` publishes a release when a `v<MAJOR>.<MINOR>.<PATCH>` tag is pushed:

- Docker images on GHCR: `ghcr.io/jamesmyatt/randomatizer-web:<version>`, `:<major>.<minor>`, `:<major>` and `:latest`, for `linux/amd64` and `linux/arm64`.
- A GitHub Release with the changelog as its notes and `randomatizer-web-<version>.tar.gz` (the static build and nginx config, used by `scripts/alpine-install.sh`) with its SHA-256 checksum.

`.github/workflows/pages.yml` also publishes the release to GitHub Pages at https://jamesmyatt.github.io/randomatizer-web/, after running the end-to-end tests against that build.

Every push to `main` also publishes the `:edge` image.

## One-time setup

After the first image is published: your GitHub profile → **Packages** → **randomatizer-web** → **Package settings** → **Change visibility** → **Public**. New packages are private, even from a public repository.

For GitHub Pages:

1. Settings → **Pages** → **Build and deployment** → **Source**: **GitHub Actions**.
2. Settings → **Environments** → **github-pages** → **Deployment branches and tags** → **Add deployment branch or tag rule** → **Ref type: Tag**, name pattern `v*.*.*`. By default only `main` may deploy, so tag deploys are rejected.
3. To publish the current release without a new tag: Actions → **Pages** → **Run workflow** → **Use workflow from**: the release tag, e.g. `v1.0.0`.

## Each release

1. Make sure `package.json` has the right version and `changelogs/<version>.md` exists. The changelog becomes the release notes. See `CLAUDE.md` for how to choose the version.
2. Create the tag `v<MAJOR>.<MINOR>.<PATCH>` on `main`, either way:
   - With git: `git tag v1.0.0 && git push origin v1.0.0`.
   - On GitHub: Releases → **Draft a new release** → type `v1.0.0` under **Choose a tag** → **Create new tag on publish**, target `main` → **Publish release**. Leave the title and notes empty; the workflow sets the title to the tag and the notes to the changelog. A saved draft doesn't create the tag, so nothing runs until you publish.

The workflows fail if the tag doesn't match the version, the changelog is missing, or the build fails.
