import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTracker } from '../src/tracker'
import type { Destination, TrackedEvent, ConsentState } from '../src/types'

function createMockDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    name: overrides.name ?? 'mock',
    version: '1.0.0',
    consentCategory: 'analytics',
    init: vi.fn().mockResolvedValue(undefined),
    track: vi.fn(),
    shouldTrack: vi.fn().mockReturnValue(true),
    ...overrides,
  }
}

describe('createTracker', () => {
  it('creates a tracker without crashing', () => {
    const tracker = createTracker({ destinations: [] })
    expect(tracker).toBeDefined()
    expect(tracker.track).toBeDefined()
    expect(tracker.identify).toBeDefined()
    expect(tracker.updateConsent).toBeDefined()
    expect(tracker.getConsent).toBeDefined()
    expect(tracker.flush).toBeDefined()
    expect(tracker.destroy).toBeDefined()
  })

  it('works with empty destinations in Node', () => {
    const tracker = createTracker({ destinations: [], consent: { analytics: true } })
    // Should not throw
    tracker.track('page_view', { page_title: 'Test' })
    tracker.destroy()
  })

  it('tracks events to destinations that allow it', () => {
    const dest = createMockDestination()
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    tracker.track('page_view', { page_title: 'Home' })

    expect(dest.track).toHaveBeenCalledOnce()
    const event = (dest.track as ReturnType<typeof vi.fn>).mock.calls[0]![0] as TrackedEvent
    expect(event.event_name).toBe('page_view')
    expect(event.params.page_title).toBe('Home')
    tracker.destroy()
  })

  it('respects shouldTrack returning false', () => {
    const dest = createMockDestination({
      shouldTrack: vi.fn().mockReturnValue(false),
    })
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    tracker.track('page_view')
    expect(dest.track).not.toHaveBeenCalled()
    tracker.destroy()
  })

  it('does not track after destroy', () => {
    const dest = createMockDestination()
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    tracker.destroy()
    tracker.track('page_view')
    expect(dest.track).not.toHaveBeenCalled()
  })

  it('applies mapEventName from destination', () => {
    const dest = createMockDestination({
      mapEventName: vi.fn().mockReturnValue('PageView'),
    })
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    tracker.track('page_view')
    const event = (dest.track as ReturnType<typeof vi.fn>).mock.calls[0]![0] as TrackedEvent
    expect(event.event_name).toBe('PageView')
    tracker.destroy()
  })

  it('applies mapParams from destination', () => {
    const dest = createMockDestination({
      mapParams: vi.fn().mockReturnValue({ mapped: true }),
    })
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    tracker.track('page_view', { original: true })
    const event = (dest.track as ReturnType<typeof vi.fn>).mock.calls[0]![0] as TrackedEvent
    expect(event.params).toEqual({ mapped: true })
    tracker.destroy()
  })

  it('calls identify on destinations', () => {
    const identifyFn = vi.fn()
    const dest = createMockDestination({ identify: identifyFn })
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    tracker.identify('user-1', { email: 'test@example.com' })
    expect(identifyFn).toHaveBeenCalledWith('user-1', { email: 'test@example.com' })
    tracker.destroy()
  })

  it('sets userId after identify', () => {
    const dest = createMockDestination()
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    tracker.identify('user-1')
    tracker.track('page_view')

    const event = (dest.track as ReturnType<typeof vi.fn>).mock.calls[0]![0] as TrackedEvent
    expect(event.user_id).toBe('user-1')
    tracker.destroy()
  })

  it('manages consent state', () => {
    const tracker = createTracker({
      destinations: [],
      consent: { analytics: true, marketing: false },
    })

    const initial = tracker.getConsent()
    expect(initial.analytics).toBe(true)
    expect(initial.marketing).toBe(false)

    tracker.updateConsent({ marketing: true })
    const updated = tracker.getConsent()
    expect(updated.marketing).toBe(true)
    tracker.destroy()
  })

  it('notifies destinations of consent changes', () => {
    const onConsentChange = vi.fn()
    const dest = createMockDestination({ onConsentChange })
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    tracker.updateConsent({ marketing: true })
    expect(onConsentChange).toHaveBeenCalledOnce()
    const consent = onConsentChange.mock.calls[0]![0] as ConsentState
    expect(consent.marketing).toBe(true)
    tracker.destroy()
  })

  it('flushes all destinations', async () => {
    const flush1 = vi.fn().mockResolvedValue(undefined)
    const flush2 = vi.fn().mockResolvedValue(undefined)
    const dest1 = createMockDestination({ name: 'd1', flush: flush1 })
    const dest2 = createMockDestination({ name: 'd2', flush: flush2 })
    const tracker = createTracker({
      destinations: [dest1, dest2],
      consent: { analytics: true },
    })

    await tracker.flush()
    expect(flush1).toHaveBeenCalledOnce()
    expect(flush2).toHaveBeenCalledOnce()
    tracker.destroy()
  })

  it('calls destroy on destinations', () => {
    const destroyFn = vi.fn()
    const dest = createMockDestination({ destroy: destroyFn })
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    tracker.destroy()
    expect(destroyFn).toHaveBeenCalledOnce()
  })

  it('each event gets a unique id and session id', () => {
    const dest = createMockDestination()
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    tracker.track('event_1')
    tracker.track('event_2')

    const event1 = (dest.track as ReturnType<typeof vi.fn>).mock.calls[0]![0] as TrackedEvent
    const event2 = (dest.track as ReturnType<typeof vi.fn>).mock.calls[1]![0] as TrackedEvent
    expect(event1.event_id).not.toBe(event2.event_id)
    expect(event1.session_id).toBe(event2.session_id) // Same session
    tracker.destroy()
  })

  it('tracks to multiple destinations', () => {
    const dest1 = createMockDestination({ name: 'd1' })
    const dest2 = createMockDestination({ name: 'd2' })
    const tracker = createTracker({
      destinations: [dest1, dest2],
      consent: { analytics: true },
    })

    tracker.track('page_view')
    expect(dest1.track).toHaveBeenCalledOnce()
    expect(dest2.track).toHaveBeenCalledOnce()
    tracker.destroy()
  })

  it('handles destination init errors gracefully', async () => {
    const dest = createMockDestination({
      init: vi.fn().mockRejectedValue(new Error('init failed')),
    })
    // Should not throw
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })
    // Wait for init to complete
    await new Promise((r) => setTimeout(r, 10))
    tracker.destroy()
  })

  it('handles destination track errors gracefully', () => {
    const dest = createMockDestination({
      track: vi.fn().mockImplementation(() => {
        throw new Error('track failed')
      }),
    })
    const tracker = createTracker({
      destinations: [dest],
      consent: { analytics: true },
    })

    // Should not throw
    tracker.track('page_view')
    tracker.destroy()
  })
})
