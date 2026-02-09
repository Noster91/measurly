import { describe, it, expect } from 'vitest'

describe('@open-measure/next', () => {
  it('exports OpenMeasureScript', async () => {
    const mod = await import('../src/index')
    expect(mod.OpenMeasureScript).toBeDefined()
  })

  it('exports usePageTracking', async () => {
    const mod = await import('../src/index')
    expect(mod.usePageTracking).toBeDefined()
  })

  it('re-exports react and web core', async () => {
    const mod = await import('../src/index')
    expect(mod.createTracker).toBeDefined()
    expect(mod.OpenMeasureProvider).toBeDefined()
    expect(mod.useTracker).toBeDefined()
    expect(mod.presets).toBeDefined()
  })
})
