# Open Measure — AI Contributor Guide

## Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages (turbo)
pnpm test             # Run all tests (vitest)
pnpm lint             # Lint all packages (eslint)
pnpm typecheck        # Type-check all packages
pnpm clean            # Remove dist/ and .turbo/

# Single package
pnpm --filter @open-measure/web build
pnpm --filter @open-measure/web test
```

## Code Conventions

- **Strict TypeScript**: `strict: true`, no `any` unless unavoidable
- **Named exports only**: No default exports
- **SSR-safe**: Always guard `window`/`document` with `typeof window !== 'undefined'`
- **Zero runtime dependencies** in `web` package (use `crypto.randomUUID()` with fallback)
- **Consistent type imports**: `import type { Foo } from './bar'`

## Architecture

```
packages/
  web/       — Core: tracker, types, Destination interface, presets, auto-tracking
  react/     — React hooks/provider (re-exports web)
  next/      — Next.js integration (re-exports react+web)
  dest-*/    — Destination plugins (ga4, meta, posthog, gtm)
  spec/      — JSON schemas (internal)
  cli/       — Non-interactive CLI
  qa/        — QA toolkit
  capi/      — Server-side API
  mcp/       — MCP server for AI tools
```

## How to Add a Destination

1. Run `npx open-measure create-destination <name>` or create manually:
2. Create `packages/dest-<name>/src/index.ts`
3. Use `defineDestination<Config>()` from `@open-measure/web`
4. Implement `init()`, `track()`, and optionally `identify()`, `flush()`
5. Add tests in `__tests__/`

## How to Add an Event

1. Add the event type to `packages/spec/src/events/<category>.ts`
2. Add the JSON schema to `packages/spec/src/schemas/`
3. Re-export from `packages/spec/src/index.ts`
4. Run `pnpm build && pnpm test` to verify

## Commit Conventions

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `test:` Adding or fixing tests
- `chore:` Build process, tooling, or auxiliary changes

## Key Files

- `packages/web/src/destination.ts` — Destination interface + `defineDestination()`
- `packages/web/src/tracker.ts` — `createTracker()` core engine
- `packages/web/src/types.ts` — All shared types
- `packages/cli/src/commands/create-destination.ts` — Scaffold generator
