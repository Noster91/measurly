import { defineDestination } from '@open-measure/web'

export interface GA4Config {
  measurementId: string
  sendPageView?: boolean
  debug?: boolean
}

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>
    gtag: (...args: unknown[]) => void
  }
}

const GA4_EVENT_MAP: Record<string, string> = {
  page_view: 'page_view',
  view_item: 'view_item',
  view_item_list: 'view_item_list',
  add_to_cart: 'add_to_cart',
  remove_from_cart: 'remove_from_cart',
  view_cart: 'view_cart',
  begin_checkout: 'begin_checkout',
  add_shipping_info: 'add_shipping_info',
  add_payment_info: 'add_payment_info',
  purchase: 'purchase',
  refund: 'refund',
  sign_up: 'sign_up',
  login: 'login',
  generate_lead: 'generate_lead',
}

/**
 * Google Analytics 4 destination.
 *
 * @example
 * ```ts
 * import { ga4 } from '@open-measure/dest-ga4'
 * ga4({ measurementId: 'G-XXXXXXXXXX' })
 * ```
 */
export const ga4 = defineDestination<GA4Config>({
  name: 'ga4',
  version: '1.0.0',
  consentCategory: 'analytics',
  setup(config) {
    function loadGtag(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
          resolve()
          return
        }

        if (typeof window.gtag === 'function') {
          resolve()
          return
        }

        window.dataLayer = window.dataLayer || []
        window.gtag = function gtag() {
          // eslint-disable-next-line prefer-rest-params
          window.dataLayer.push(arguments as unknown as Record<string, unknown>)
        }
        window.gtag('js', new Date())
        window.gtag('config', config.measurementId, {
          send_page_view: config.sendPageView ?? false,
          debug_mode: config.debug ?? false,
        })

        const script = document.createElement('script')
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load gtag.js'))
        document.head.appendChild(script)
      })
    }

    return {
      async init() {
        await loadGtag()
      },
      track(event) {
        if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
        window.gtag('event', event.event_name, event.params)
      },
      identify(userId) {
        if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
        window.gtag('config', config.measurementId, { user_id: userId })
      },
      mapEventName(eventName) {
        return GA4_EVENT_MAP[eventName] ?? eventName
      },
    }
  },
})
