import { describe, it, expect } from 'vitest'
import { gtm } from '../src/index'

describe('gtm destination', () => {
  it('creates destination with correct metadata', () => {
    const dest = gtm({})
    expect(dest.name).toBe('gtm')
    expect(dest.version).toBe('1.0.0')
    expect(dest.consentCategory).toBe('analytics')
  })

  it('init does not throw in Node', async () => {
    const dest = gtm({})
    await expect(dest.init()).resolves.toBeUndefined()
  })

  it('track does not throw in Node', () => {
    const dest = gtm({})
    expect(() =>
      dest.track({
        event_name: 'page_view',
        params: { page_title: 'Home' },
        timestamp: Date.now(),
        event_id: 'test',
      }),
    ).not.toThrow()
  })

  it('identify does not throw in Node', () => {
    const dest = gtm({})
    expect(() => dest.identify?.('user-1', { plan: 'pro' })).not.toThrow()
  })

  it('creates destination with containerId', () => {
    const dest = gtm({ containerId: 'GTM-TEST' })
    expect(dest.name).toBe('gtm')
  })

  it('creates destination with authoritative mode', () => {
    const dest = gtm({ containerId: 'GTM-TEST', mode: 'authoritative' })
    expect(dest.name).toBe('gtm')
  })
})
