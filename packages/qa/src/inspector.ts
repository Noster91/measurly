import type { Destination, TrackedEvent } from '@open-measure/web'
import { defineDestination } from '@open-measure/web'

export interface InspectorEvent {
  event: TrackedEvent
  timestamp: number
  destination: string
}

export interface Inspector {
  /** Get all captured events */
  getEvents(): InspectorEvent[]
  /** Get events filtered by name */
  getEventsByName(name: string): InspectorEvent[]
  /** Clear all captured events */
  clear(): void
  /** Get the destination to add to tracker */
  destination: Destination
}

/**
 * Creates a QA inspector that captures all tracked events for validation.
 * Use this in tests or dev mode to verify tracking behavior.
 *
 * @example
 * ```ts
 * const inspector = createInspector()
 * const tracker = createTracker({
 *   destinations: [ga4({ ... }), inspector.destination],
 *   consent: { analytics: true, necessary: true },
 * })
 *
 * tracker.track('purchase', { transaction_id: 'tx-1', value: 99 })
 * expect(inspector.getEvents()).toHaveLength(1)
 * expect(inspector.getEventsByName('purchase')).toHaveLength(1)
 * ```
 */
export function createInspector(): Inspector {
  const events: InspectorEvent[] = []

  const dest = defineDestination<Record<string, never>>({
    name: 'inspector',
    version: '1.0.0',
    consentCategory: 'necessary',
    setup() {
      return {
        async init() {},
        track(event) {
          events.push({
            event,
            timestamp: Date.now(),
            destination: 'inspector',
          })
        },
        shouldTrack() {
          return true // Always capture in inspector
        },
      }
    },
  })({})

  return {
    getEvents() {
      return [...events]
    },
    getEventsByName(name: string) {
      return events.filter((e) => e.event.event_name === name)
    },
    clear() {
      events.length = 0
    },
    destination: dest,
  }
}
