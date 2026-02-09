/**
 * Generate a unique ID using crypto.randomUUID() with a fallback
 * for environments that don't support it. Zero dependencies.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback: manually construct a v4-like UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generate a session ID (shorter, for session tracking)
 */
export function generateSessionId(): string {
  return generateId().replace(/-/g, '').slice(0, 16)
}
