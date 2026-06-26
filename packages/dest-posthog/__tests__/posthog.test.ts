import { describe, it, expect } from 'vitest'
import { posthog } from '../src/index'

describe('posthog destination', () => {
  it('creates destination with correct metadata', () => {
    const dest = posthog({ apiKey: 'phc_test' })
    expect(dest.name).toBe('posthog')
    expect(dest.version).toBe('1.1.0')
    expect(dest.consentCategory).toBe('analytics')
  })

  it('maps page_view to $pageview', () => {
    const dest = posthog({ apiKey: 'phc_test' })
    expect(dest.mapEventName?.('page_view')).toBe('$pageview')
  })

  it('passes through unmapped events', () => {
    const dest = posthog({ apiKey: 'phc_test' })
    expect(dest.mapEventName?.('custom_event')).toBe('custom_event')
  })

  it('init does not throw in Node', async () => {
    const dest = posthog({ apiKey: 'phc_test' })
    await expect(dest.init()).resolves.toBeUndefined()
  })

  it('track does not throw in Node', () => {
    const dest = posthog({ apiKey: 'phc_test' })
    expect(() =>
      dest.track({
        event_name: '$pageview',
        params: {},
        timestamp: Date.now(),
        event_id: 'test',
      }),
    ).not.toThrow()
  })

  it('identify does not throw in Node', () => {
    const dest = posthog({ apiKey: 'phc_test' })
    expect(() => dest.identify?.('user-1', { plan: 'pro' })).not.toThrow()
  })

  it('destroy does not throw in Node', () => {
    const dest = posthog({ apiKey: 'phc_test' })
    expect(() => dest.destroy?.()).not.toThrow()
  })

  it('onConsentChange does not throw in Node (both opt in and out)', () => {
    const dest = posthog({ apiKey: 'phc_test' })
    expect(() =>
      dest.onConsentChange?.({
        necessary: true,
        analytics: true,
        marketing: false,
        personalization: false,
      }),
    ).not.toThrow()
    expect(() =>
      dest.onConsentChange?.({
        necessary: true,
        analytics: false,
        marketing: false,
        personalization: false,
      }),
    ).not.toThrow()
  })
})
