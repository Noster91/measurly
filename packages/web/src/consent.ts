import type { ConsentState } from './types'

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
}

export function createConsentManager(initial?: Partial<ConsentState>) {
  let state: ConsentState = { ...DEFAULT_CONSENT, ...initial }

  return {
    get(): ConsentState {
      return { ...state }
    },
    update(updates: Partial<ConsentState>): ConsentState {
      state = { ...state, ...updates }
      return { ...state }
    },
  }
}
