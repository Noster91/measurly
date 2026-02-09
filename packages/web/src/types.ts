/** Consent categories for GDPR/CCPA compliance */
export interface ConsentState {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  personalization: boolean
}

/** A tracked analytics event */
export interface TrackedEvent {
  event_name: string
  params: Record<string, unknown>
  timestamp: number
  event_id: string
  user_id?: string
  session_id?: string
}

/** Configuration for auto-tracking features */
export interface AutoTrackConfig {
  pageViews?: boolean
  outboundClicks?: boolean
  scrollDepth?: boolean
  formSubmissions?: boolean
}

/** Dedupe rule to prevent duplicate event tracking */
export interface DedupeRule {
  event_name: string
  /** Time window in milliseconds */
  window_ms: number
  /** Key function to generate a dedup key from event params */
  key?: (params: Record<string, unknown>) => string
}

/** Preset configuration for common verticals */
export interface Preset {
  name: string
  description: string
  autoTrack: AutoTrackConfig
  dedupeRules: DedupeRule[]
  expectedEvents: string[]
}

/** Options for createTracker */
export interface TrackerOptions {
  destinations: Destination[]
  preset?: Preset
  autoTrack?: AutoTrackConfig
  consent?: Partial<ConsentState>
  debug?: boolean
  dedupeRules?: DedupeRule[]
}

/** Public tracker API */
export interface Tracker {
  track(eventName: string, params?: Record<string, unknown>): void
  identify(userId: string, traits?: Record<string, unknown>): void
  updateConsent(consent: Partial<ConsentState>): void
  getConsent(): ConsentState
  flush(): Promise<void>
  destroy(): void
}

/** Destination interface — every analytics platform implements this */
export interface Destination {
  readonly name: string
  readonly version: string
  readonly consentCategory: keyof ConsentState
  init(): Promise<void>
  track(event: TrackedEvent): void
  identify?(userId: string, traits?: Record<string, unknown>): void
  onConsentChange?(consent: ConsentState): void
  shouldTrack(event: TrackedEvent, consent: ConsentState): boolean
  mapEventName?(eventName: string): string | undefined
  mapParams?(
    eventName: string,
    params: Record<string, unknown>,
  ): Record<string, unknown> | undefined
  flush?(): Promise<void>
  destroy?(): void
}
