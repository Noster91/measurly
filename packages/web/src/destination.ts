import type { ConsentState, Destination, TrackedEvent } from './types'

/** Configuration for defineDestination */
export interface DestinationDefinition<TConfig> {
  name: string
  version: string
  consentCategory: keyof ConsentState
  setup(config: TConfig): DestinationImplementation
}

/** Implementation returned by the setup function */
export interface DestinationImplementation {
  init(): Promise<void>
  track(event: TrackedEvent): void
  identify?(userId: string, traits?: Record<string, unknown>): void
  onConsentChange?(consent: ConsentState): void
  shouldTrack?(event: TrackedEvent, consent: ConsentState): boolean
  mapEventName?(eventName: string): string | undefined
  mapParams?(
    eventName: string,
    params: Record<string, unknown>,
  ): Record<string, unknown> | undefined
  flush?(): Promise<void>
  destroy?(): void
}

/**
 * Factory function to create a destination plugin with sensible defaults.
 *
 * @example
 * ```ts
 * const ga4 = defineDestination<GA4Config>({
 *   name: 'ga4',
 *   version: '1.0.0',
 *   consentCategory: 'analytics',
 *   setup(config) {
 *     return {
 *       async init() { ... },
 *       track(event) { window.gtag('event', event.event_name, event.params) },
 *     }
 *   },
 * })
 * // Usage: ga4({ measurementId: 'G-XXX' })
 * ```
 */
export function defineDestination<TConfig>(
  definition: DestinationDefinition<TConfig>,
): (config: TConfig) => Destination {
  return (config: TConfig): Destination => {
    const impl = definition.setup(config)
    return {
      name: definition.name,
      version: definition.version,
      consentCategory: definition.consentCategory,
      init: impl.init.bind(impl),
      track: impl.track.bind(impl),
      identify: impl.identify?.bind(impl),
      onConsentChange: impl.onConsentChange?.bind(impl),
      shouldTrack: impl.shouldTrack?.bind(impl) ?? defaultShouldTrack(definition.consentCategory),
      mapEventName: impl.mapEventName?.bind(impl),
      mapParams: impl.mapParams?.bind(impl),
      flush: impl.flush?.bind(impl),
      destroy: impl.destroy?.bind(impl),
    }
  }
}

function defaultShouldTrack(
  consentCategory: keyof ConsentState,
): (event: TrackedEvent, consent: ConsentState) => boolean {
  return (_event: TrackedEvent, consent: ConsentState) => {
    return consent[consentCategory] === true
  }
}
