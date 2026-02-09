import { describe, it, expect } from 'vitest'
import { generateId, generateSessionId } from '../src/id'

describe('generateId', () => {
  it('generates a string', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
  })

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })

  it('generates UUID-like format', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})

describe('generateSessionId', () => {
  it('generates a 16-character hex string', () => {
    const sid = generateSessionId()
    expect(sid).toMatch(/^[0-9a-f]{16}$/)
  })

  it('generates unique session ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateSessionId()))
    expect(ids.size).toBe(100)
  })
})
