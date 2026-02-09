import { describe, it, expect } from 'vitest'
import { createDedupeEngine } from '../src/dedupe'
import type { TrackedEvent } from '../src/types'

function makeEvent(name: string, params: Record<string, unknown> = {}, timestamp = Date.now()): TrackedEvent {
  return {
    event_name: name,
    params,
    timestamp,
    event_id: `id-${Math.random()}`,
  }
}

describe('createDedupeEngine', () => {
  it('does not dedupe events without rules', () => {
    const engine = createDedupeEngine([])
    expect(engine.isDuplicate(makeEvent('page_view'))).toBe(false)
    expect(engine.isDuplicate(makeEvent('page_view'))).toBe(false)
  })

  it('dedupes events within time window', () => {
    const engine = createDedupeEngine([
      { event_name: 'purchase', window_ms: 5000 },
    ])

    const now = Date.now()
    expect(engine.isDuplicate(makeEvent('purchase', {}, now))).toBe(false)
    expect(engine.isDuplicate(makeEvent('purchase', {}, now + 100))).toBe(true)
  })

  it('allows events after time window', () => {
    const engine = createDedupeEngine([
      { event_name: 'purchase', window_ms: 100 },
    ])

    const now = Date.now()
    expect(engine.isDuplicate(makeEvent('purchase', {}, now))).toBe(false)
    expect(engine.isDuplicate(makeEvent('purchase', {}, now + 200))).toBe(false)
  })

  it('dedupes by key function', () => {
    const engine = createDedupeEngine([
      { event_name: 'add_to_cart', window_ms: 5000, key: (p) => String(p.item_id ?? '') },
    ])

    const now = Date.now()
    expect(engine.isDuplicate(makeEvent('add_to_cart', { item_id: 'a' }, now))).toBe(false)
    expect(engine.isDuplicate(makeEvent('add_to_cart', { item_id: 'a' }, now + 100))).toBe(true)
    expect(engine.isDuplicate(makeEvent('add_to_cart', { item_id: 'b' }, now + 100))).toBe(false)
  })

  it('only applies to matching event names', () => {
    const engine = createDedupeEngine([
      { event_name: 'purchase', window_ms: 5000 },
    ])

    expect(engine.isDuplicate(makeEvent('page_view'))).toBe(false)
    expect(engine.isDuplicate(makeEvent('page_view'))).toBe(false)
  })

  it('clear resets all state', () => {
    const engine = createDedupeEngine([
      { event_name: 'purchase', window_ms: 5000 },
    ])

    expect(engine.isDuplicate(makeEvent('purchase'))).toBe(false)
    expect(engine.isDuplicate(makeEvent('purchase'))).toBe(true)
    engine.clear()
    expect(engine.isDuplicate(makeEvent('purchase'))).toBe(false)
  })
})
