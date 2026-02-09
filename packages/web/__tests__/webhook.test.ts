import { describe, it, expect, vi, beforeEach } from 'vitest'
import { webhook } from '../src/webhook'
import type { TrackedEvent } from '../src/types'

function makeEvent(name = 'test_event'): TrackedEvent {
  return {
    event_name: name,
    params: { key: 'value' },
    timestamp: Date.now(),
    event_id: 'test-id',
  }
}

describe('webhook destination', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a destination with correct metadata', () => {
    const dest = webhook({ endpoint: 'https://example.com/events' })
    expect(dest.name).toBe('webhook')
    expect(dest.version).toBe('1.0.0')
    expect(dest.consentCategory).toBe('analytics')
  })

  it('queues events on track', () => {
    const dest = webhook({ endpoint: 'https://example.com/events', flushInterval: 0 })
    // Track should not throw
    dest.track(makeEvent())
    dest.track(makeEvent())
  })

  it('flushes events using fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal('fetch', fetchMock)

    const dest = webhook({ endpoint: 'https://example.com/events', flushInterval: 0 })
    dest.track(makeEvent())
    await dest.flush?.()

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://example.com/events')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body)
    expect(body.events).toHaveLength(1)
    expect(body.events[0].event_name).toBe('test_event')

    vi.unstubAllGlobals()
  })

  it('auto-flushes when batch size is reached', () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal('fetch', fetchMock)

    const dest = webhook({
      endpoint: 'https://example.com/events',
      batchSize: 2,
      flushInterval: 0,
    })

    dest.track(makeEvent())
    expect(fetchMock).not.toHaveBeenCalled()

    dest.track(makeEvent())
    expect(fetchMock).toHaveBeenCalledOnce()

    vi.unstubAllGlobals()
  })

  it('includes custom headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal('fetch', fetchMock)

    const dest = webhook({
      endpoint: 'https://example.com/events',
      headers: { 'X-API-Key': 'secret' },
      flushInterval: 0,
    })
    dest.track(makeEvent())
    await dest.flush?.()

    const options = fetchMock.mock.calls[0]![1]
    expect(options.headers['X-API-Key']).toBe('secret')

    vi.unstubAllGlobals()
  })

  it('destroy sends remaining events', () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal('fetch', fetchMock)

    const dest = webhook({ endpoint: 'https://example.com/events', flushInterval: 0 })
    dest.track(makeEvent())
    dest.destroy?.()

    expect(fetchMock).toHaveBeenCalledOnce()

    vi.unstubAllGlobals()
  })
})
