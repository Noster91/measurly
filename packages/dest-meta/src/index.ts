import { defineDestination } from '@open-measure/web'

export interface MetaConfig {
  pixelId: string
  autoConfig?: boolean
}

interface FbqFunction {
  (...args: unknown[]): void
  loaded?: boolean
  version?: string
  queue?: unknown[]
}

declare global {
  interface Window {
    fbq?: FbqFunction
    _fbq?: FbqFunction
  }
}

const PII_KEYS = new Set([
  'email', 'e-mail', 'phone', 'telephone', 'ssn', 'social_security',
  'credit_card', 'card_number', 'password', 'passwd', 'secret',
  'first_name', 'last_name', 'full_name', 'address', 'zip', 'postal',
])

function stripPII(params: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (!PII_KEYS.has(key.toLowerCase())) {
      clean[key] = value
    }
  }
  return clean
}

const META_EVENT_MAP: Record<string, string> = {
  page_view: 'PageView',
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  add_payment_info: 'AddPaymentInfo',
  purchase: 'Purchase',
  sign_up: 'CompleteRegistration',
  generate_lead: 'Lead',
  form_submit: 'SubmitApplication',
}

/**
 * Meta Pixel destination with automatic PII detection and stripping.
 *
 * @example
 * ```ts
 * import { meta } from '@open-measure/dest-meta'
 * meta({ pixelId: '123456789' })
 * ```
 */
export const meta = defineDestination<MetaConfig>({
  name: 'meta',
  version: '1.0.0',
  consentCategory: 'marketing',
  setup(config) {
    function loadPixel(): Promise<void> {
      return new Promise((resolve) => {
        if (typeof window === 'undefined') {
          resolve()
          return
        }

        if (window.fbq) {
          resolve()
          return
        }

        const queue: unknown[] = []
        const fbq: FbqFunction = Object.assign(
          (...args: unknown[]) => {
            queue.push(args)
          },
          { loaded: true, version: '2.0', queue },
        )
        window.fbq = fbq
        window._fbq = fbq

        fbq('init', config.pixelId)
        if (config.autoConfig !== false) {
          fbq('set', 'autoConfig', 'true', config.pixelId)
        }

        const script = document.createElement('script')
        script.src = 'https://connect.facebook.net/en_US/fbevents.js'
        script.async = true
        script.onload = () => resolve()
        // Resolve even on error to not block other destinations
        script.onerror = () => resolve()
        document.head.appendChild(script)
      })
    }

    return {
      async init() {
        await loadPixel()
      },
      track(event) {
        if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
        const params = stripPII(event.params)
        window.fbq('track', event.event_name, params)
      },
      mapEventName(eventName) {
        return META_EVENT_MAP[eventName] ?? eventName
      },
      mapParams(_eventName, params) {
        return stripPII(params)
      },
    }
  },
})

export { stripPII }
