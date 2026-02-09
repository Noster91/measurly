import { defineDestination } from '@open-measure/web'

export interface GTMConfig {
  containerId?: string
  /** 'mirror' pushes to existing dataLayer. 'authoritative' manages the dataLayer. */
  mode?: 'mirror' | 'authoritative'
}

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>
  }
}

/**
 * GTM dataLayer destination.
 *
 * In 'mirror' mode (default), it pushes events to an existing dataLayer.
 * In 'authoritative' mode, it fully manages the dataLayer.
 *
 * @example
 * ```ts
 * import { gtm } from '@open-measure/dest-gtm'
 * gtm({ containerId: 'GTM-XXXXXX' })
 * ```
 */
export const gtm = defineDestination<GTMConfig>({
  name: 'gtm',
  version: '1.0.0',
  consentCategory: 'analytics',
  setup(config) {
    const mode = config.mode ?? 'mirror'

    function loadGTM(): Promise<void> {
      return new Promise((resolve) => {
        if (typeof window === 'undefined') {
          resolve()
          return
        }

        window.dataLayer = window.dataLayer || []

        if (mode === 'authoritative' && config.containerId) {
          // Load GTM snippet
          window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js',
          })

          const script = document.createElement('script')
          script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.containerId)}`
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => resolve()
          document.head.appendChild(script)
        } else {
          resolve()
        }
      })
    }

    return {
      async init() {
        await loadGTM()
      },
      track(event) {
        if (typeof window === 'undefined') return
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: event.event_name,
          ...event.params,
          open_measure_event_id: event.event_id,
          open_measure_timestamp: event.timestamp,
        })
      },
      identify(userId, traits) {
        if (typeof window === 'undefined') return
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: 'identify',
          user_id: userId,
          ...traits,
        })
      },
    }
  },
})
