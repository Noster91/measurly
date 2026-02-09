// Types
export type {
  ConsentState,
  TrackedEvent,
  AutoTrackConfig,
  DedupeRule,
  Preset,
  TrackerOptions,
  Tracker,
  Destination,
} from './types'

// Destination
export { defineDestination } from './destination'
export type { DestinationDefinition, DestinationImplementation } from './destination'

// Tracker
export { createTracker } from './tracker'

// ID generation
export { generateId, generateSessionId } from './id'

// Presets
export { presets, ecommerce, saas, leadgen } from './presets'

// Auto-tracking
export { setupAutoTracking } from './auto-track'

// Built-in destinations
export { webhook } from './webhook'
export type { WebhookConfig } from './webhook'

// Consent
export { createConsentManager } from './consent'

// Logger
export { createLogger } from './logger'
export type { Logger } from './logger'
