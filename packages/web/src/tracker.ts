import type { Tracker, TrackerOptions, TrackedEvent, AutoTrackConfig, DedupeRule } from './types'
import { createConsentManager } from './consent'
import { createDedupeEngine } from './dedupe'
import { createLogger } from './logger'
import { generateId, generateSessionId } from './id'
import { setupAutoTracking } from './auto-track'

/**
 * Create a tracker instance that orchestrates destinations, consent, and dedupe.
 *
 * @example
 * ```ts
 * const tracker = createTracker({
 *   preset: presets.ecommerce,
 *   destinations: [
 *     ga4({ measurementId: 'G-XXX' }),
 *     meta({ pixelId: '123' }),
 *   ],
 *   autoTrack: { pageViews: true },
 *   consent: { analytics: true },
 * })
 * ```
 */
export function createTracker(options: TrackerOptions): Tracker {
  const {
    destinations,
    preset,
    consent: initialConsent,
    debug = false,
  } = options

  const logger = createLogger(debug)

  // Merge preset config with user config
  const autoTrack: AutoTrackConfig = {
    ...preset?.autoTrack,
    ...options.autoTrack,
  }

  const dedupeRules: DedupeRule[] = [
    ...(preset?.dedupeRules ?? []),
    ...(options.dedupeRules ?? []),
  ]

  const consentManager = createConsentManager(initialConsent)
  const dedupe = createDedupeEngine(dedupeRules)
  const sessionId = generateSessionId()

  let userId: string | undefined
  let userTraits: Record<string, unknown> | undefined
  let destroyed = false
  let autoTrackCleanup: (() => void) | null = null

  // Initialize all destinations
  void (async () => {
    for (const dest of destinations) {
      try {
        await dest.init()
      } catch (err) {
        logger.error(`Failed to initialize destination "${dest.name}"`, err)
      }
    }

    // Setup auto-tracking after destinations are initialized
    if (Object.values(autoTrack).some(Boolean)) {
      autoTrackCleanup = setupAutoTracking(autoTrack, track)
    }
  })()

  function track(eventName: string, params: Record<string, unknown> = {}): void {
    if (destroyed) return

    const event: TrackedEvent = {
      event_name: eventName,
      params,
      timestamp: Date.now(),
      event_id: generateId(),
      user_id: userId,
      session_id: sessionId,
    }

    // Dedupe check
    if (dedupe.isDuplicate(event)) {
      logger.warn(`Deduplicated event: ${eventName}`)
      return
    }

    const consent = consentManager.get()
    const trackedTo: string[] = []

    for (const dest of destinations) {
      if (!dest.shouldTrack(event, consent)) continue

      // Apply event name mapping
      const mappedName = dest.mapEventName?.(eventName) ?? eventName
      const mappedParams = dest.mapParams?.(eventName, params) ?? params

      const mappedEvent: TrackedEvent = {
        ...event,
        event_name: mappedName,
        params: mappedParams,
      }

      try {
        dest.track(mappedEvent)
        trackedTo.push(dest.name)
      } catch (err) {
        logger.error(`Error tracking to "${dest.name}"`, err)
      }
    }

    logger.event(event, trackedTo)
  }

  function identify(id: string, traits?: Record<string, unknown>): void {
    if (destroyed) return
    userId = id
    userTraits = traits

    for (const dest of destinations) {
      try {
        dest.identify?.(id, traits)
      } catch (err) {
        logger.error(`Error identifying to "${dest.name}"`, err)
      }
    }
  }

  function updateConsent(updates: Parameters<typeof consentManager.update>[0]): void {
    if (destroyed) return
    const newConsent = consentManager.update(updates)

    for (const dest of destinations) {
      try {
        dest.onConsentChange?.(newConsent)
      } catch (err) {
        logger.error(`Error updating consent for "${dest.name}"`, err)
      }
    }
  }

  async function flush(): Promise<void> {
    const results = destinations.map(async (dest) => {
      try {
        await dest.flush?.()
      } catch (err) {
        logger.error(`Error flushing "${dest.name}"`, err)
      }
    })
    await Promise.all(results)
  }

  function destroy(): void {
    if (destroyed) return
    destroyed = true

    autoTrackCleanup?.()
    autoTrackCleanup = null
    dedupe.clear()

    for (const dest of destinations) {
      try {
        dest.destroy?.()
      } catch (err) {
        logger.error(`Error destroying "${dest.name}"`, err)
      }
    }
  }

  // Suppress unused variable warnings — these are used for debugging
  void userTraits

  return {
    track,
    identify,
    updateConsent,
    getConsent: consentManager.get,
    flush,
    destroy,
  }
}
