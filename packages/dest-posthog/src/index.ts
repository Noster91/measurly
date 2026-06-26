import { defineDestination } from '@open-measure/web'
import posthogJs from 'posthog-js'

export interface PostHogConfig {
  /** PostHog project API key — the write-only public key, e.g. `phc_…`. */
  apiKey: string
  /** PostHog host. Defaults to US Cloud (`https://us.i.posthog.com`). */
  apiHost?: string
  /** Enable PostHog autocapture (clicks/inputs). Defaults to `false`. */
  autocapture?: boolean
}

const POSTHOG_EVENT_MAP: Record<string, string> = {
  page_view: '$pageview',
  sign_up: 'sign_up',
  login: 'login',
  feature_used: 'feature_used',
}

const isBrowser = (): boolean => typeof window !== 'undefined'

/**
 * PostHog destination.
 *
 * Backed by the official `posthog-js` SDK. The SDK loads asynchronously and
 * **queues `capture()` / `identify()` calls made before it finishes loading**,
 * so events fired during the initial page load are not dropped — unlike a raw
 * `array.js` script-tag loader, which silently drops anything captured before
 * `onload`.
 *
 * @example
 * ```ts
 * import { posthog } from '@open-measure/dest-posthog'
 * posthog({ apiKey: 'phc_XXX', apiHost: 'https://us.i.posthog.com' })
 * ```
 */
export const posthog = defineDestination<PostHogConfig>({
  name: 'posthog',
  version: '1.1.0',
  consentCategory: 'analytics',
  setup(config) {
    let initialized = false

    return {
      async init() {
        if (!isBrowser() || initialized) return
        posthogJs.init(config.apiKey, {
          api_host: config.apiHost ?? 'https://us.i.posthog.com',
          autocapture: config.autocapture ?? false,
          // Open Measure emits page views explicitly via the `page_view`
          // event (mapped to `$pageview` below), so disable SDK auto-pageviews.
          capture_pageview: false,
        })
        initialized = true
      },
      track(event) {
        if (!isBrowser()) return
        posthogJs.capture(event.event_name, event.params)
      },
      identify(userId, traits) {
        if (!isBrowser()) return
        posthogJs.identify(userId, traits)
      },
      // Propagate consent to the SDK so revoking analytics consent stops ALL
      // capture (including PostHog's own autocapture), not just Open Measure's
      // routed events.
      onConsentChange(consent) {
        if (!isBrowser()) return
        if (consent.analytics) posthogJs.opt_in_capturing()
        else posthogJs.opt_out_capturing()
      },
      mapEventName(eventName) {
        return POSTHOG_EVENT_MAP[eventName] ?? eventName
      },
      destroy() {
        if (!isBrowser()) return
        posthogJs.reset()
      },
    }
  },
})
