import type { Tracker } from '@open-measure/web'

/**
 * The canonical page-view event name. The PostHog destination
 * (`@open-measure/dest-posthog`) maps this to `$pageview`; other destinations
 * map it to their own convention.
 */
export const PAGE_VIEW_EVENT = 'page_view'

/**
 * The subset of SvelteKit's `Navigation` / `AfterNavigate` object this helper
 * reads. Typed structurally so the package carries no dependency on the
 * SvelteKit ambient `$app/navigation` types — the real `Navigation` object
 * passed by `afterNavigate` is assignable to it.
 */
export interface PageViewNavigation {
  to?: {
    url: URL | { pathname: string; href?: string }
    route?: { id: string | null }
  } | null
  from?: {
    url: URL | { pathname: string; href?: string }
  } | null
}

/**
 * Track a single page view. Designed to be wired to SvelteKit's `afterNavigate`,
 * which only fires in the browser, so this is SSR-safe by construction. Falls
 * back to `location.pathname` when no navigation object is supplied (e.g. an
 * initial manual call).
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { afterNavigate } from '$app/navigation'
 *   import { getTracker, trackPageView } from '@open-measure/svelte'
 *
 *   const tracker = getTracker()
 *   afterNavigate((nav) => trackPageView(tracker, nav))
 * </script>
 * ```
 */
export function trackPageView(tracker: Tracker, nav?: PageViewNavigation): void {
  const path =
    nav?.to?.url.pathname ??
    (typeof location !== 'undefined' ? location.pathname : undefined)

  const params: Record<string, unknown> = {
    path,
    route: nav?.to?.route?.id ?? null,
  }

  const referrer = nav?.from?.url.pathname
  if (referrer) {
    params.referrer = referrer
  }

  tracker.track(PAGE_VIEW_EVENT, params)
}
