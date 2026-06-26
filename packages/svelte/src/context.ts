import { getContext, onDestroy, setContext } from 'svelte'
import { createTracker } from '@open-measure/web'
import type { Tracker, TrackerOptions } from '@open-measure/web'

/**
 * Context key for the tracker instance. A symbol avoids collisions with any
 * string keys the consuming app may set in its own component context.
 */
const TRACKER_KEY = Symbol('open-measure-tracker')

function isTracker(source: Tracker | TrackerOptions): source is Tracker {
  return typeof (source as Tracker).track === 'function'
}

/**
 * Create (or adopt) a tracker and expose it to the component tree via Svelte
 * context. Call this once in the `<script>` of your root `+layout.svelte` so
 * every descendant can reach it with {@link getTracker}.
 *
 * When you pass {@link TrackerOptions}, a tracker is created with
 * {@link createTracker} and automatically destroyed when the owning component
 * unmounts. When you pass an existing {@link Tracker}, lifecycle is left to the
 * caller (nothing is destroyed for you).
 *
 * Must be called during component initialisation (top level of `<script>`),
 * the same constraint Svelte places on `setContext`/`onDestroy`.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { setTracker } from '@open-measure/svelte'
 *   import { posthog } from '@open-measure/dest-posthog'
 *   import { PUBLIC_POSTHOG_KEY, PUBLIC_POSTHOG_HOST } from '$env/static/public'
 *
 *   setTracker({
 *     destinations: PUBLIC_POSTHOG_KEY
 *       ? [posthog({ apiKey: PUBLIC_POSTHOG_KEY, apiHost: PUBLIC_POSTHOG_HOST })]
 *       : [],
 *     consent: { analytics: true },
 *   })
 *
 *   let { children } = $props()
 * </script>
 *
 * {@render children()}
 * ```
 */
export function setTracker(source: Tracker | TrackerOptions): Tracker {
  const owned = !isTracker(source)
  const tracker = owned ? createTracker(source) : source

  setContext(TRACKER_KEY, tracker)

  // Only tear down trackers we created ourselves — never one the caller owns.
  if (owned) {
    onDestroy(() => tracker.destroy())
  }

  return tracker
}

/**
 * Read the tracker from context. Throws if {@link setTracker} has not run in an
 * ancestor — that almost always means the call is outside the layout subtree.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { getTracker } from '@open-measure/svelte'
 *   const tracker = getTracker()
 * </script>
 *
 * <button onclick={() => tracker.track('cta_click', { id: 'hero' })}>Go</button>
 * ```
 */
export function getTracker(): Tracker {
  const tracker = getContext<Tracker | undefined>(TRACKER_KEY)
  if (!tracker) {
    throw new Error(
      '[open-measure] getTracker() found no tracker in context. ' +
        'Call setTracker() in an ancestor (typically your root +layout.svelte).',
    )
  }
  return tracker
}

/**
 * Like {@link getTracker} but returns `null` instead of throwing when no
 * tracker is present. Useful for optional instrumentation in shared components
 * that may render outside an instrumented layout.
 */
export function getTrackerSafe(): Tracker | null {
  return getContext<Tracker | undefined>(TRACKER_KEY) ?? null
}
