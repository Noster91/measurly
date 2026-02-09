import { defineDestination } from '@open-measure/web'

export interface PostHogConfig {
  apiKey: string
  apiHost?: string
  autocapture?: boolean
}

declare global {
  interface Window {
    posthog: {
      init: (apiKey: string, config: Record<string, unknown>) => void
      capture: (eventName: string, properties?: Record<string, unknown>) => void
      identify: (userId: string, properties?: Record<string, unknown>) => void
      reset: () => void
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any
    }
  }
}

const POSTHOG_EVENT_MAP: Record<string, string> = {
  page_view: '$pageview',
  sign_up: 'sign_up',
  login: 'login',
  feature_used: 'feature_used',
}

/**
 * PostHog destination.
 *
 * @example
 * ```ts
 * import { posthog } from '@open-measure/dest-posthog'
 * posthog({ apiKey: 'phc_XXX', apiHost: 'https://app.posthog.com' })
 * ```
 */
export const posthog = defineDestination<PostHogConfig>({
  name: 'posthog',
  version: '1.0.0',
  consentCategory: 'analytics',
  setup(config) {
    function loadPostHog(): Promise<void> {
      return new Promise((resolve) => {
        if (typeof window === 'undefined') {
          resolve()
          return
        }

        if (window.posthog) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = 'https://us-assets.i.posthog.com/static/array.js'
        script.async = true
        script.onload = () => {
          window.posthog.init(config.apiKey, {
            api_host: config.apiHost ?? 'https://us.i.posthog.com',
            autocapture: config.autocapture ?? false,
            capture_pageview: false,
          })
          resolve()
        }
        script.onerror = () => resolve()
        document.head.appendChild(script)
      })
    }

    return {
      async init() {
        await loadPostHog()
      },
      track(event) {
        if (typeof window === 'undefined' || !window.posthog?.capture) return
        window.posthog.capture(event.event_name, event.params)
      },
      identify(userId, traits) {
        if (typeof window === 'undefined' || !window.posthog?.identify) return
        window.posthog.identify(userId, traits)
      },
      mapEventName(eventName) {
        return POSTHOG_EVENT_MAP[eventName] ?? eventName
      },
      destroy() {
        if (typeof window !== 'undefined' && window.posthog?.reset) {
          window.posthog.reset()
        }
      },
    }
  },
})
