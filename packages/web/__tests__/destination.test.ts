import { describe, it, expect, vi } from 'vitest'
import { defineDestination } from '../src/destination'
import type { ConsentState, TrackedEvent } from '../src/types'

const mockEvent: TrackedEvent = {
  event_name: 'page_view',
  params: { page_title: 'Home' },
  timestamp: Date.now(),
  event_id: 'test-id',
}

const defaultConsent: ConsentState = {
  necessary: true,
  analytics: true,
  marketing: false,
  personalization: false,
}

describe('defineDestination', () => {
  it('creates a destination factory function', () => {
    const myDest = defineDestination<{ apiKey: string }>({
      name: 'test',
      version: '1.0.0',
      consentCategory: 'analytics',
      setup(config) {
        return {
          async init() {},
          track(event) {
            void event
            void config.apiKey
          },
        }
      },
    })

    const dest = myDest({ apiKey: 'abc' })
    expect(dest.name).toBe('test')
    expect(dest.version).toBe('1.0.0')
    expect(dest.consentCategory).toBe('analytics')
  })

  it('provides default shouldTrack based on consentCategory', () => {
    const dest = defineDestination<{}>({
      name: 'test',
      version: '1.0.0',
      consentCategory: 'marketing',
      setup() {
        return {
          async init() {},
          track() {},
        }
      },
    })({})

    expect(dest.shouldTrack(mockEvent, defaultConsent)).toBe(false)
    expect(dest.shouldTrack(mockEvent, { ...defaultConsent, marketing: true })).toBe(true)
  })

  it('allows custom shouldTrack override', () => {
    const dest = defineDestination<{}>({
      name: 'test',
      version: '1.0.0',
      consentCategory: 'analytics',
      setup() {
        return {
          async init() {},
          track() {},
          shouldTrack(event) {
            return event.event_name !== 'internal_event'
          },
        }
      },
    })({})

    expect(dest.shouldTrack(mockEvent, defaultConsent)).toBe(true)
    expect(
      dest.shouldTrack(
        { ...mockEvent, event_name: 'internal_event' },
        defaultConsent,
      ),
    ).toBe(false)
  })

  it('calls init on the destination', async () => {
    const initFn = vi.fn()
    const dest = defineDestination<{}>({
      name: 'test',
      version: '1.0.0',
      consentCategory: 'analytics',
      setup() {
        return {
          init: initFn,
          track() {},
        }
      },
    })({})

    await dest.init()
    expect(initFn).toHaveBeenCalledOnce()
  })

  it('calls track on the destination', () => {
    const trackFn = vi.fn()
    const dest = defineDestination<{}>({
      name: 'test',
      version: '1.0.0',
      consentCategory: 'analytics',
      setup() {
        return {
          async init() {},
          track: trackFn,
        }
      },
    })({})

    dest.track(mockEvent)
    expect(trackFn).toHaveBeenCalledWith(mockEvent)
  })

  it('supports optional identify', () => {
    const identifyFn = vi.fn()
    const dest = defineDestination<{}>({
      name: 'test',
      version: '1.0.0',
      consentCategory: 'analytics',
      setup() {
        return {
          async init() {},
          track() {},
          identify: identifyFn,
        }
      },
    })({})

    dest.identify?.('user-1', { email: 'test@example.com' })
    expect(identifyFn).toHaveBeenCalledWith('user-1', { email: 'test@example.com' })
  })

  it('supports optional mapEventName and mapParams', () => {
    const dest = defineDestination<{}>({
      name: 'test',
      version: '1.0.0',
      consentCategory: 'analytics',
      setup() {
        return {
          async init() {},
          track() {},
          mapEventName(name) {
            return name === 'purchase' ? 'Purchase' : name
          },
          mapParams(_name, params) {
            return { ...params, mapped: true }
          },
        }
      },
    })({})

    expect(dest.mapEventName?.('purchase')).toBe('Purchase')
    expect(dest.mapEventName?.('page_view')).toBe('page_view')
    expect(dest.mapParams?.('test', { foo: 'bar' })).toEqual({ foo: 'bar', mapped: true })
  })

  it('supports optional flush and destroy', async () => {
    const flushFn = vi.fn().mockResolvedValue(undefined)
    const destroyFn = vi.fn()

    const dest = defineDestination<{}>({
      name: 'test',
      version: '1.0.0',
      consentCategory: 'analytics',
      setup() {
        return {
          async init() {},
          track() {},
          flush: flushFn,
          destroy: destroyFn,
        }
      },
    })({})

    await dest.flush?.()
    dest.destroy?.()
    expect(flushFn).toHaveBeenCalledOnce()
    expect(destroyFn).toHaveBeenCalledOnce()
  })
})
