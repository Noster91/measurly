# Contributing to Open Measure

Thanks for your interest in contributing to Open Measure!

## Development Setup

```bash
# Clone the repository
git clone https://github.com/open-measure/open-measure.git
cd open-measure

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Project Structure

```
packages/
  web/           # Core tracker engine
  react/         # React hooks and provider
  next/          # Next.js integration
  dest-ga4/      # Google Analytics 4 destination
  dest-meta/     # Meta Pixel destination
  dest-posthog/  # PostHog destination
  dest-gtm/      # GTM dataLayer adapter
  cli/           # CLI tool
  qa/            # QA toolkit
  capi/          # Server-side Conversions API
  spec/          # JSON schemas
  mcp/           # MCP server for AI tools
```

## Making Changes

1. Create a branch from `main`
2. Make your changes
3. Run `pnpm build && pnpm test && pnpm lint`
4. Add a changeset: `pnpm changeset`
5. Submit a pull request

## Changesets

We use [changesets](https://github.com/changesets/changesets) for versioning. When you make a change that should be released:

```bash
pnpm changeset
```

Select the packages affected and describe your changes. Commit the generated `.changeset/*.md` file with your PR.

## Code Conventions

- **TypeScript strict mode** — No `any` unless absolutely necessary
- **Named exports only** — No default exports
- **SSR-safe** — Guard `window`/`document` with `typeof window !== 'undefined'`
- **Type imports** — Use `import type { Foo }` for type-only imports

## Adding a New Destination

```bash
npx open-measure create-destination my-platform
```

Or manually:

1. Create `packages/dest-<name>/`
2. Use `defineDestination<Config>()` from `@open-measure/web`
3. Implement `init()`, `track()`, and optionally `identify()`, `flush()`
4. Add tests in `__tests__/`
5. Export from `src/index.ts`

## Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `test:` Adding or fixing tests
- `chore:` Build process, tooling, or auxiliary changes

## Questions?

Open an issue on GitHub.
