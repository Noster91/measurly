import { describe, it, expect } from 'vitest'
import {
  createInvariantEngine,
  noEmptyEventNames,
  purchaseHasTransactionId,
  purchaseHasValue,
  noConsecutiveDuplicates,
} from '../src/invariants'
import { createInspector } from '../src/inspector'
import { createPlaywrightHelper } from '../src/playwright'
import type { TrackedEvent } from '@open-measure/web'

function makeEvent(name: string, params: Record<string, unknown> = {}): TrackedEvent {
  return {
    event_name: name,
    params,
    timestamp: Date.now(),
    event_id: 'test-id',
  }
}

describe('invariantEngine', () => {
  it('validates events against invariants', () => {
    const engine = createInvariantEngine([noEmptyEventNames])
    const results = engine.validate(makeEvent('page_view'))
    expect(results).toHaveLength(1)
    expect(results[0]!.pass).toBe(true)
  })

  it('detects empty event names', () => {
    const engine = createInvariantEngine([noEmptyEventNames])
    const results = engine.validate(makeEvent(''))
    expect(results[0]!.pass).toBe(false)
  })

  it('validateStrict throws on failure', () => {
    const engine = createInvariantEngine([noEmptyEventNames])
    expect(() => engine.validateStrict(makeEvent(''))).toThrow('Invariant violations')
  })

  it('validateStrict does not throw on pass', () => {
    const engine = createInvariantEngine([noEmptyEventNames])
    expect(() => engine.validateStrict(makeEvent('page_view'))).not.toThrow()
  })

  it('checks purchase has transaction_id', () => {
    const engine = createInvariantEngine([purchaseHasTransactionId])
    const fail = engine.validate(makeEvent('purchase', {}))
    expect(fail[0]!.pass).toBe(false)

    const pass = engine.validate(makeEvent('purchase', { transaction_id: 'tx-1' }))
    expect(pass[0]!.pass).toBe(true)
  })

  it('checks purchase has value', () => {
    const engine = createInvariantEngine([purchaseHasValue])
    const fail = engine.validate(makeEvent('purchase', {}))
    expect(fail[0]!.pass).toBe(false)

    const pass = engine.validate(makeEvent('purchase', { value: 99 }))
    expect(pass[0]!.pass).toBe(true)
  })

  it('detects consecutive duplicates', () => {
    const engine = createInvariantEngine([noConsecutiveDuplicates])

    engine.validate(makeEvent('page_view', { page: 'home' }))
    const results = engine.validate(makeEvent('page_view', { page: 'home' }))
    expect(results[0]!.pass).toBe(false)
  })

  it('allows consecutive events with different params', () => {
    const engine = createInvariantEngine([noConsecutiveDuplicates])

    engine.validate(makeEvent('page_view', { page: 'home' }))
    const results = engine.validate(makeEvent('page_view', { page: 'about' }))
    expect(results[0]!.pass).toBe(true)
  })

  it('clear resets history', () => {
    const engine = createInvariantEngine([noConsecutiveDuplicates])
    engine.validate(makeEvent('page_view', { page: 'home' }))
    engine.clear()
    const results = engine.validate(makeEvent('page_view', { page: 'home' }))
    expect(results[0]!.pass).toBe(true) // First event after clear
  })
})

describe('inspector', () => {
  it('creates an inspector with a destination', () => {
    const inspector = createInspector()
    expect(inspector.destination).toBeDefined()
    expect(inspector.destination.name).toBe('inspector')
  })

  it('captures tracked events', () => {
    const inspector = createInspector()
    inspector.destination.track(makeEvent('page_view'))
    inspector.destination.track(makeEvent('purchase', { value: 99 }))
    expect(inspector.getEvents()).toHaveLength(2)
  })

  it('filters events by name', () => {
    const inspector = createInspector()
    inspector.destination.track(makeEvent('page_view'))
    inspector.destination.track(makeEvent('purchase'))
    inspector.destination.track(makeEvent('page_view'))
    expect(inspector.getEventsByName('page_view')).toHaveLength(2)
    expect(inspector.getEventsByName('purchase')).toHaveLength(1)
  })

  it('clear removes all events', () => {
    const inspector = createInspector()
    inspector.destination.track(makeEvent('page_view'))
    inspector.clear()
    expect(inspector.getEvents()).toHaveLength(0)
  })
})

describe('playwrightHelper', () => {
  it('creates a helper with script methods', () => {
    const helper = createPlaywrightHelper()
    expect(helper.getInterceptScript()).toBeTruthy()
    expect(helper.getCollectScript()).toBeTruthy()
  })

  it('intercept script contains dataLayer monitoring', () => {
    const helper = createPlaywrightHelper()
    const script = helper.getInterceptScript()
    expect(script).toContain('dataLayer')
    expect(script).toContain('__om_captured_events')
  })

  it('collect script returns the events array', () => {
    const helper = createPlaywrightHelper()
    expect(helper.getCollectScript()).toContain('__om_captured_events')
  })
})
