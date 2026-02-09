import { describe, it, expect, vi } from 'vitest'
import { ga4 } from '../src/index'

describe('ga4 destination', () => {
  it('creates destination with correct metadata', () => {
    const dest = ga4({ measurementId: 'G-TEST123' })
    expect(dest.name).toBe('ga4')
    expect(dest.version).toBe('1.0.0')
    expect(dest.consentCategory).toBe('analytics')
  })

  it('maps standard event names', () => {
    const dest = ga4({ measurementId: 'G-TEST123' })
    expect(dest.mapEventName?.('purchase')).toBe('purchase')
    expect(dest.mapEventName?.('page_view')).toBe('page_view')
    expect(dest.mapEventName?.('custom_event')).toBe('custom_event')
  })

  it('init does not throw in Node (no window)', async () => {
    const dest = ga4({ measurementId: 'G-TEST123' })
    await expect(dest.init()).resolves.toBeUndefined()
  })

  it('track does not throw in Node (no window)', () => {
    const dest = ga4({ measurementId: 'G-TEST123' })
    expect(() =>
      dest.track({
        event_name: 'page_view',
        params: {},
        timestamp: Date.now(),
        event_id: 'test',
      }),
    ).not.toThrow()
  })

  it('identify does not throw in Node (no window)', () => {
    const dest = ga4({ measurementId: 'G-TEST123' })
    expect(() => dest.identify?.('user-1')).not.toThrow()
  })
})
