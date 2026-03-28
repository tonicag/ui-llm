# Publishing @seam-ui packages to npm

## Prerequisites

1. **npm account** — Create one at https://www.npmjs.com/signup
2. **npm org** — Create the `@seam-ui` organization at https://www.npmjs.com/org/create (free for public packages)
3. **Login** — Run `npm login` in your terminal
4. **2FA** — Enable 2FA on your npm account (recommended)

## First-time setup

### 1. Create the npm organization

Go to https://www.npmjs.com/org/create and create `seam-ui`. Add any collaborators.

### 2. Verify package names

Each package.json should have the scoped name:

```
@seam-ui/core
@seam-ui/react
@seam-ui/playwright
```

### 3. Set public access

Scoped packages are private by default. Add to each publishable package.json:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

This is already the recommended approach. Run this to add it to all packages:

```bash
# packages/core/package.json
# packages/react/package.json
# packages/playwright/package.json
```

## Publishing workflow

### Option A: Manual publish

```bash
# 1. Build everything
pnpm build

# 2. Bump versions (keep all packages in sync)
pnpm -r exec -- npm version patch
# or: minor, major, prepatch, preminor, premajor

# 3. Publish all packages (in dependency order)
pnpm --filter @seam-ui/core publish --access public
pnpm --filter @seam-ui/react publish --access public
pnpm --filter @seam-ui/playwright publish --access public

# 4. Push tags
git add -A
git commit -m "release: v0.1.1"
git tag v0.1.1
git push && git push --tags
```

### Option B: Changesets (recommended for ongoing development)

Changesets automates versioning, changelogs, and publishing.

#### Setup

```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```

Edit `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [["@seam-ui/core", "@seam-ui/react", "@seam-ui/playwright"]],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@seam-ui/example", "@seam-ui/landing"]
}
```

The `"fixed"` array keeps all packages on the same version.

#### Daily workflow

```bash
# 1. After making changes, create a changeset
pnpm changeset
# Select packages, choose bump type, write a summary

# 2. When ready to release
pnpm changeset version   # bumps versions, updates changelogs
pnpm build               # rebuild with new versions
pnpm changeset publish   # publishes to npm

# 3. Push
git add -A
git commit -m "release: v0.2.0"
git push && git push --tags
```

### Option C: GitHub Actions (CI/CD)

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          version: pnpm changeset version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Set `NPM_TOKEN` in your repo's Settings > Secrets:
1. Go to https://www.npmjs.com/settings/your-username/tokens
2. Create an "Automation" token
3. Add it as `NPM_TOKEN` in GitHub repo secrets

## Pre-publish checklist

- [ ] All packages build: `pnpm build`
- [ ] Tests pass (if applicable)
- [ ] Version numbers are correct and consistent
- [ ] `"files"` array in each package.json includes only what should be published
- [ ] `"publishConfig": { "access": "public" }` is set on each package
- [ ] CHANGELOG is updated (automatic with changesets)
- [ ] Git working tree is clean

## Verifying a publish

```bash
# Check what would be published (dry run)
pnpm --filter @seam-ui/core publish --dry-run

# Check the published package
npm info @seam-ui/core
npm info @seam-ui/react
npm info @seam-ui/playwright
```

## Version strategy

All three library packages (`core`, `react`, `playwright`) share the same version number via changesets' `"fixed"` config. This keeps things simple for users — they always install the same version of all packages.

The `example` and `landing` packages are private and not published.
