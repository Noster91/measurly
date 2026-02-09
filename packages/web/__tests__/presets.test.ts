import { describe, it, expect } from 'vitest'
import { presets, ecommerce, saas, leadgen } from '../src/presets'

describe('presets', () => {
  it('exports all three presets', () => {
    expect(presets.ecommerce).toBe(ecommerce)
    expect(presets.saas).toBe(saas)
    expect(presets.leadgen).toBe(leadgen)
  })

  it('ecommerce has correct structure', () => {
    expect(ecommerce.name).toBe('ecommerce')
    expect(ecommerce.autoTrack.pageViews).toBe(true)
    expect(ecommerce.dedupeRules.length).toBeGreaterThan(0)
    expect(ecommerce.expectedEvents).toContain('purchase')
    expect(ecommerce.expectedEvents).toContain('add_to_cart')
  })

  it('saas has correct structure', () => {
    expect(saas.name).toBe('saas')
    expect(saas.autoTrack.pageViews).toBe(true)
    expect(saas.expectedEvents).toContain('sign_up')
    expect(saas.expectedEvents).toContain('subscribe')
  })

  it('leadgen has correct structure', () => {
    expect(leadgen.name).toBe('leadgen')
    expect(leadgen.autoTrack.pageViews).toBe(true)
    expect(leadgen.autoTrack.outboundClicks).toBe(true)
    expect(leadgen.autoTrack.scrollDepth).toBe(true)
    expect(leadgen.autoTrack.formSubmissions).toBe(true)
    expect(leadgen.expectedEvents).toContain('generate_lead')
  })

  it('ecommerce dedupe rules have key functions', () => {
    const purchaseRule = ecommerce.dedupeRules.find((r) => r.event_name === 'purchase')
    expect(purchaseRule).toBeDefined()
    expect(purchaseRule?.key).toBeDefined()
    expect(purchaseRule?.key?.({ transaction_id: 'tx-123' })).toBe('tx-123')
  })
})
