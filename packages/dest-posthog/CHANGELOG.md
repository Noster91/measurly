# @open-measure/dest-posthog

## 0.2.0

### Minor Changes

- 1549f77: Back the PostHog destination with the official `posthog-js` SDK instead of a raw `array.js` script-tag loader.
  - **Fixes dropped events:** the previous loader fetched `array.js` cold (no PostHog snippet stub) and had no queue, so any `capture()`/`identify()` fired before the script finished loading — e.g. the first page view on initial load — was silently dropped. `posthog-js` queues pre-load calls, so they're delivered.
  - **Real consent propagation:** implements `onConsentChange` → `opt_in_capturing()` / `opt_out_capturing()`, so revoking analytics consent stops all capture (including PostHog's own autocapture), not just Open Measure-routed events.
  - Adds `posthog-js` as a dependency.

## 0.1.1

### Patch Changes

- 0f1bbb1: Add README documentation to all packages
- Updated dependencies [0f1bbb1]
  - @open-measure/web@0.1.1

## 0.1.0

### Minor Changes

- cf29198: Initial release of Open Measure - unified analytics for the modern web.

  Features:
  - Core tracker with plugin architecture
  - Destinations: GA4, Meta Pixel, PostHog, GTM
  - React hooks and Next.js provider with auto page tracking
  - Consent management with category-based gating
  - Automatic event deduplication
  - CLI for scaffolding and validation
  - QA toolkit with event inspector
  - Server-side Conversions API support

### Patch Changes

- Updated dependencies [cf29198]
  - @open-measure/web@0.1.0
