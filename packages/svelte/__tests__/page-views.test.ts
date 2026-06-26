import { describe, it, expect, vi } from 'vitest'
import type { Tracker } from '@open-measure/web'
import { trackPageView, PAGE_VIEW_EVENT } from '../src/page-views'

function mockTracker(): Tracker {
  return {
    track: vi.fn(),
    identify: vi.fn(),
    updateConsent: vi.fn(),
    getConsent: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
  } as unknown as Tracker
}

describe('trackPageView', () => {
  it('emits the canonical page_view event with path and route from navigation', () => {
    const tracker = mockTracker()

    trackPageView(tracker, {
      to: { url: { pathname: '/bookings' }, route: { id: '/(app)/bookings' } },
    })

    expect(tracker.track).toHaveBeenCalledWith(PAGE_VIEW_EVENT, {
      path: '/bookings',
      route: '/(app)/bookings',
    })
  })

  it('includes the referrer path when a `from` location is present', () => {
    const tracker = mockTracker()

    trackPageView(tracker, {
      to: { url: { pathname: '/bookings/123' }, route: { id: '/(app)/bookings/[id]' } },
      from: { url: { pathname: '/bookings' } },
    })

    expect(tracker.track).toHaveBeenCalledWith(PAGE_VIEW_EVENT, {
      path: '/bookings/123',
      route: '/(app)/bookings/[id]',
      referrer: '/bookings',
    })
  })

  it('omits referrer when there is no previous location (e.g. first load)', () => {
    const tracker = mockTracker()

    trackPageView(tracker, {
      to: { url: { pathname: '/dashboard' }, route: { id: '/(app)/dashboard' } },
      from: null,
    })

    expect(tracker.track).toHaveBeenCalledWith(PAGE_VIEW_EVENT, {
      path: '/dashboard',
      route: '/(app)/dashboard',
    })
  })

  it('defaults route to null when navigation has no route id', () => {
    const tracker = mockTracker()

    trackPageView(tracker, { to: { url: { pathname: '/perks' } } })

    expect(tracker.track).toHaveBeenCalledWith(PAGE_VIEW_EVENT, {
      path: '/perks',
      route: null,
    })
  })

  it('falls back to location.pathname when called without a navigation object', () => {
    const tracker = mockTracker()
    vi.stubGlobal('location', { pathname: '/carnet' } as Location)

    trackPageView(tracker)

    expect(tracker.track).toHaveBeenCalledWith(PAGE_VIEW_EVENT, {
      path: '/carnet',
      route: null,
    })

    vi.unstubAllGlobals()
  })
})
