import { describe, it, expect } from 'vitest'
import { createHandler } from '../src/handler'
import { hashPII, hashEmail, hashPhone } from '../src/hash'
import type { TrackedEvent } from '@open-measure/web'

function makeEvent(name: string, params: Record<string, unknown> = {}): TrackedEvent {
  return {
    event_name: name,
    params,
    timestamp: Date.now(),
    event_id: 'test-id',
  }
}

describe('hash', () => {
  it('hashPII returns consistent SHA-256', () => {
    const h1 = hashPII('test@example.com')
    const h2 = hashPII('test@example.com')
    expect(h1).toBe(h2)
    expect(h1).toHaveLength(64)
  })

  it('hashPII normalizes to lowercase', () => {
    expect(hashPII('TEST@EXAMPLE.COM')).toBe(hashPII('test@example.com'))
  })

  it('hashPII trims whitespace', () => {
    expect(hashPII('  test@example.com  ')).toBe(hashPII('test@example.com'))
  })

  it('hashEmail normalizes email', () => {
    expect(hashEmail('TEST@EXAMPLE.COM')).toBe(hashEmail('test@example.com'))
  })

  it('hashPhone strips non-digits', () => {
    expect(hashPhone('+1 (555) 123-4567')).toBe(hashPhone('15551234567'))
  })
})

describe('createHandler', () => {
  it('processes events', () => {
    const handler = createHandler()
    const result = handler.process({
      events: [makeEvent('page_view'), makeEvent('purchase', { value: 99 })],
    })
    expect(result.processed).toBe(2)
    expect(result.dropped).toBe(0)
    expect(result.errors).toHaveLength(0)
  })

  it('hashes specified fields', () => {
    const handler = createHandler({ hashFields: ['email'] })
    const events = [makeEvent('purchase', { email: 'test@example.com', value: 99 })]
    const result = handler.process({ events })
    expect(result.processed).toBe(1)
  })

  it('drops events via onEvent returning null', () => {
    const handler = createHandler({
      onEvent(event) {
        if (event.event_name === 'internal') return null
        return event
      },
    })
    const result = handler.process({
      events: [makeEvent('page_view'), makeEvent('internal')],
    })
    expect(result.processed).toBe(1)
    expect(result.dropped).toBe(1)
  })

  it('handles errors gracefully', () => {
    const handler = createHandler({
      onEvent() {
        throw new Error('boom')
      },
    })
    const result = handler.process({ events: [makeEvent('page_view')] })
    expect(result.processed).toBe(0)
    expect(result.dropped).toBe(1)
    expect(result.errors).toHaveLength(1)
  })
})
