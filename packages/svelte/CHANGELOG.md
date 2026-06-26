# @open-measure/svelte

## 0.2.0

### Minor Changes

- ef9444e: Add `@open-measure/svelte` — a Svelte 5 / SvelteKit integration.
  - `setTracker` / `getTracker` / `getTrackerSafe` for sharing a tracker through Svelte context with automatic teardown on unmount.
  - `trackPageView` helper for wiring SvelteKit's `afterNavigate` to a `page_view` event (SSR-safe, framework-typed structurally so the package carries no `$app/navigation` dependency).
  - Re-exports the full `@open-measure/web` surface.
