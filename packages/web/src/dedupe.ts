import type { DedupeRule, TrackedEvent } from './types'

interface DedupeEntry {
  key: string
  timestamp: number
}

export function createDedupeEngine(rules: DedupeRule[]) {
  const seen = new Map<string, DedupeEntry[]>()

  function isDuplicate(event: TrackedEvent): boolean {
    const rule = rules.find((r) => r.event_name === event.event_name)
    if (!rule) return false

    const key = rule.key ? rule.key(event.params) : event.event_name
    const compositeKey = `${event.event_name}:${key}`
    const entries = seen.get(compositeKey) ?? []
    const now = event.timestamp

    // Clean old entries
    const valid = entries.filter((e) => now - e.timestamp < rule.window_ms)

    if (valid.length > 0) {
      return true
    }

    // Record this event
    valid.push({ key: compositeKey, timestamp: now })
    seen.set(compositeKey, valid)
    return false
  }

  function clear(): void {
    seen.clear()
  }

  return { isDuplicate, clear }
}
