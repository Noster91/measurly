import { defineDestination } from './destination'

export interface WebhookConfig {
  endpoint: string
  headers?: Record<string, string>
  batchSize?: number
  flushInterval?: number
}

export const webhook = defineDestination<WebhookConfig>({
  name: 'webhook',
  version: '1.0.0',
  consentCategory: 'analytics',
  setup(config) {
    let queue: Record<string, unknown>[] = []
    let timer: ReturnType<typeof setInterval> | null = null
    const batchSize = config.batchSize ?? 10
    const flushInterval = config.flushInterval ?? 5000

    async function sendBatch(events: Record<string, unknown>[]): Promise<void> {
      if (events.length === 0) return

      const useBeacon =
        typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function'

      if (useBeacon) {
        navigator.sendBeacon(
          config.endpoint,
          JSON.stringify({ events }),
        )
      } else if (typeof fetch !== 'undefined') {
        await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
          body: JSON.stringify({ events }),
          keepalive: true,
        })
      }
    }

    return {
      async init() {
        if (flushInterval > 0) {
          timer = setInterval(() => {
            if (queue.length > 0) {
              const batch = queue.splice(0, batchSize)
              void sendBatch(batch)
            }
          }, flushInterval)
        }
      },
      track(event) {
        queue.push({
          event_name: event.event_name,
          params: event.params,
          timestamp: event.timestamp,
          event_id: event.event_id,
          user_id: event.user_id,
          session_id: event.session_id,
        })

        if (queue.length >= batchSize) {
          const batch = queue.splice(0, batchSize)
          void sendBatch(batch)
        }
      },
      async flush() {
        const batch = queue.splice(0)
        await sendBatch(batch)
      },
      destroy() {
        if (timer) {
          clearInterval(timer)
          timer = null
        }
        // Send remaining events
        if (queue.length > 0) {
          const batch = queue.splice(0)
          void sendBatch(batch)
        }
      },
    }
  },
})
