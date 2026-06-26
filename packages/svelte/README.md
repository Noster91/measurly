# @open-measure/svelte

Svelte 5 and SvelteKit integration for Open Measure.

## Installation

```bash
npm install @open-measure/svelte @open-measure/web
# plus the destination(s) you use, e.g.
npm install @open-measure/dest-posthog
```

## Usage

### 1. Create the tracker in your root layout

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { afterNavigate } from '$app/navigation'
  import { setTracker, trackPageView } from '@open-measure/svelte'
  import { posthog } from '@open-measure/dest-posthog'
  import { PUBLIC_POSTHOG_KEY, PUBLIC_POSTHOG_HOST } from '$env/static/public'

  // No key configured (dev, CI, or a brand without analytics) -> no destinations,
  // so every track()/identify() call is a safe no-op.
  const tracker = setTracker({
    destinations: PUBLIC_POSTHOG_KEY
      ? [posthog({ apiKey: PUBLIC_POSTHOG_KEY, apiHost: PUBLIC_POSTHOG_HOST })]
      : [],
    consent: { analytics: true },
  })

  // SvelteKit client navigations don't emit a pageview on their own.
  afterNavigate((nav) => trackPageView(tracker, nav))

  let { children } = $props()
</script>

{@render children()}
```

`setTracker` stores the tracker in Svelte context and destroys it automatically
when the layout unmounts. The tracker is SSR-safe: destinations guard `window`
internally, so nothing runs during server rendering.

### 2. Track from any component

```svelte
<script lang="ts">
  import { getTracker } from '@open-measure/svelte'
  const tracker = getTracker()
</script>

<button onclick={() => tracker.track('booking_submitted', { resource_type: 'meeting_room' })}>
  Book
</button>
```

Use `getTrackerSafe()` instead of `getTracker()` in shared components that may
render outside an instrumented layout — it returns `null` rather than throwing.

### 3. Identify on login, and pause during impersonation

```ts
const tracker = getTracker()

// On login:
tracker.identify(member.id, { role: member.role, plan: member.planType })

// While an admin impersonates a member, keep that traffic out of funnels:
tracker.updateConsent({ analytics: false }) // pause
tracker.updateConsent({ analytics: true })  // resume after exiting impersonation
```

## API

| Export | Description |
| --- | --- |
| `setTracker(options \| tracker)` | Create or adopt a tracker and put it in context. Owned trackers are destroyed on unmount. Returns the tracker. |
| `getTracker()` | Read the tracker from context. Throws if none was set. |
| `getTrackerSafe()` | Read the tracker from context, or `null` if none was set. |
| `trackPageView(tracker, nav?)` | Emit a `page_view` event. Wire to `afterNavigate`. Falls back to `location.pathname`. |
| `PAGE_VIEW_EVENT` | The `page_view` event-name constant. |
| `PageViewNavigation` | Structural type for the navigation object `trackPageView` reads. |

Everything from [`@open-measure/web`](../web) is re-exported (`createTracker`,
`presets`, types, etc.).

## Documentation

See the [Open Measure README](../../README.md) for the full picture.
