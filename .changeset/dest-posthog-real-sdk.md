---
"@open-measure/dest-posthog": minor
---

Back the PostHog destination with the official `posthog-js` SDK instead of a raw `array.js` script-tag loader.

- **Fixes dropped events:** the previous loader fetched `array.js` cold (no PostHog snippet stub) and had no queue, so any `capture()`/`identify()` fired before the script finished loading — e.g. the first page view on initial load — was silently dropped. `posthog-js` queues pre-load calls, so they're delivered.
- **Real consent propagation:** implements `onConsentChange` → `opt_in_capturing()` / `opt_out_capturing()`, so revoking analytics consent stops all capture (including PostHog's own autocapture), not just Open Measure-routed events.
- Adds `posthog-js` as a dependency.
