import { describe, it, expect } from 'vitest'
import { createConsentManager } from '../src/consent'

describe('createConsentManager', () => {
  it('defaults to necessary only', () => {
    const cm = createConsentManager()
    const state = cm.get()
    expect(state.necessary).toBe(true)
    expect(state.analytics).toBe(false)
    expect(state.marketing).toBe(false)
    expect(state.personalization).toBe(false)
  })

  it('accepts initial consent', () => {
    const cm = createConsentManager({ analytics: true })
    const state = cm.get()
    expect(state.analytics).toBe(true)
    expect(state.marketing).toBe(false)
  })

  it('updates consent', () => {
    const cm = createConsentManager()
    const updated = cm.update({ marketing: true })
    expect(updated.marketing).toBe(true)
    expect(cm.get().marketing).toBe(true)
  })

  it('returns a copy, not the internal state', () => {
    const cm = createConsentManager()
    const state = cm.get()
    state.analytics = true
    expect(cm.get().analytics).toBe(false)
  })
})
