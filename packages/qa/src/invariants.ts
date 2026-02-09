import type { TrackedEvent } from '@open-measure/web'

export interface Invariant {
  name: string
  description: string
  check(event: TrackedEvent, history: TrackedEvent[]): InvariantResult
}

export interface InvariantResult {
  pass: boolean
  message: string
}

/**
 * Creates an invariant engine that validates events against a set of rules.
 *
 * @example
 * ```ts
 * const engine = createInvariantEngine([
 *   purchaseHasTransactionId,
 *   noEmptyEventNames,
 * ])
 * engine.validate(event)  // throws if any invariant fails
 * ```
 */
export function createInvariantEngine(invariants: Invariant[]) {
  const history: TrackedEvent[] = []

  function validate(event: TrackedEvent): InvariantResult[] {
    const results: InvariantResult[] = []

    for (const invariant of invariants) {
      const result = invariant.check(event, history)
      results.push(result)
    }

    history.push(event)
    return results
  }

  function validateStrict(event: TrackedEvent): void {
    const results = validate(event)
    const failures = results.filter((r) => !r.pass)
    if (failures.length > 0) {
      throw new Error(
        `Invariant violations:\n${failures.map((f) => `  - ${f.message}`).join('\n')}`,
      )
    }
  }

  function clear(): void {
    history.length = 0
  }

  return { validate, validateStrict, clear }
}

// Built-in invariants
export const noEmptyEventNames: Invariant = {
  name: 'no-empty-event-names',
  description: 'Event names must not be empty',
  check(event) {
    return {
      pass: event.event_name.length > 0,
      message: event.event_name.length > 0
        ? 'Event name is not empty'
        : 'Event name is empty',
    }
  },
}

export const purchaseHasTransactionId: Invariant = {
  name: 'purchase-has-transaction-id',
  description: 'Purchase events must have a transaction_id',
  check(event) {
    if (event.event_name !== 'purchase') {
      return { pass: true, message: 'Not a purchase event' }
    }
    const hasTxId = typeof event.params.transaction_id === 'string' && event.params.transaction_id.length > 0
    return {
      pass: hasTxId,
      message: hasTxId
        ? 'Purchase has transaction_id'
        : 'Purchase event missing transaction_id',
    }
  },
}

export const purchaseHasValue: Invariant = {
  name: 'purchase-has-value',
  description: 'Purchase events must have a numeric value',
  check(event) {
    if (event.event_name !== 'purchase') {
      return { pass: true, message: 'Not a purchase event' }
    }
    const hasValue = typeof event.params.value === 'number'
    return {
      pass: hasValue,
      message: hasValue
        ? 'Purchase has value'
        : 'Purchase event missing numeric value',
    }
  },
}

export const noConsecutiveDuplicates: Invariant = {
  name: 'no-consecutive-duplicates',
  description: 'Same event should not fire twice in a row with identical params',
  check(event, history) {
    const last = history[history.length - 1]
    if (!last) return { pass: true, message: 'First event' }
    if (last.event_name !== event.event_name) {
      return { pass: true, message: 'Different event names' }
    }
    const same = JSON.stringify(last.params) === JSON.stringify(event.params)
    return {
      pass: !same,
      message: same
        ? `Consecutive duplicate: ${event.event_name}`
        : 'Params differ from previous event',
    }
  },
}
