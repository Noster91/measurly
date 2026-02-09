import { describe, it, expect } from 'vitest'
import { eventSchemas } from '../src/schemas'

describe('eventSchemas', () => {
  it('contains event definitions', () => {
    expect(eventSchemas.length).toBeGreaterThan(0)
  })

  it('every schema has required fields', () => {
    for (const schema of eventSchemas) {
      expect(schema.name).toBeTruthy()
      expect(schema.category).toBeTruthy()
      expect(schema.description).toBeTruthy()
      expect(Array.isArray(schema.params)).toBe(true)
    }
  })

  it('every param has required fields', () => {
    for (const schema of eventSchemas) {
      for (const param of schema.params) {
        expect(param.name).toBeTruthy()
        expect(['string', 'number', 'boolean', 'object', 'array']).toContain(param.type)
        expect(typeof param.required).toBe('boolean')
      }
    }
  })

  it('includes core ecommerce events', () => {
    const names = eventSchemas.map((s) => s.name)
    expect(names).toContain('purchase')
    expect(names).toContain('add_to_cart')
    expect(names).toContain('view_item')
  })

  it('includes engagement events', () => {
    const names = eventSchemas.map((s) => s.name)
    expect(names).toContain('page_view')
    expect(names).toContain('scroll_depth')
    expect(names).toContain('outbound_click')
  })

  it('purchase event has required transaction_id', () => {
    const purchase = eventSchemas.find((s) => s.name === 'purchase')
    expect(purchase).toBeDefined()
    const txParam = purchase?.params.find((p) => p.name === 'transaction_id')
    expect(txParam?.required).toBe(true)
  })
})
