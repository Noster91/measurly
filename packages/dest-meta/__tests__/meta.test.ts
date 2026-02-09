import { describe, it, expect } from 'vitest'
import { meta, stripPII } from '../src/index'

describe('meta destination', () => {
  it('creates destination with correct metadata', () => {
    const dest = meta({ pixelId: '123456' })
    expect(dest.name).toBe('meta')
    expect(dest.version).toBe('1.0.0')
    expect(dest.consentCategory).toBe('marketing')
  })

  it('maps standard event names to Meta format', () => {
    const dest = meta({ pixelId: '123456' })
    expect(dest.mapEventName?.('purchase')).toBe('Purchase')
    expect(dest.mapEventName?.('page_view')).toBe('PageView')
    expect(dest.mapEventName?.('add_to_cart')).toBe('AddToCart')
    expect(dest.mapEventName?.('sign_up')).toBe('CompleteRegistration')
    expect(dest.mapEventName?.('custom_event')).toBe('custom_event')
  })

  it('init does not throw in Node (no window)', async () => {
    const dest = meta({ pixelId: '123456' })
    await expect(dest.init()).resolves.toBeUndefined()
  })

  it('track does not throw in Node (no window)', () => {
    const dest = meta({ pixelId: '123456' })
    expect(() =>
      dest.track({
        event_name: 'Purchase',
        params: { value: 99 },
        timestamp: Date.now(),
        event_id: 'test',
      }),
    ).not.toThrow()
  })
})

describe('stripPII', () => {
  it('removes known PII keys', () => {
    const result = stripPII({
      email: 'test@example.com',
      phone: '123-456',
      value: 99,
      currency: 'USD',
    })
    expect(result).toEqual({ value: 99, currency: 'USD' })
  })

  it('is case-insensitive', () => {
    const result = stripPII({
      Email: 'test@example.com',
      Phone: '123-456',
    })
    expect(result).toEqual({})
  })

  it('preserves non-PII params', () => {
    const result = stripPII({
      item_id: 'abc',
      price: 29.99,
      currency: 'USD',
    })
    expect(result).toEqual({ item_id: 'abc', price: 29.99, currency: 'USD' })
  })

  it('strips password fields', () => {
    const result = stripPII({ password: 'secret123', user_type: 'admin' })
    expect(result).toEqual({ user_type: 'admin' })
  })
})
