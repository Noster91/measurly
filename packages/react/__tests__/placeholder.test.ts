import { describe, it, expect } from 'vitest'

describe('@open-measure/react', () => {
  it('exports OpenMeasureProvider', async () => {
    const mod = await import('../src/index')
    expect(mod.OpenMeasureProvider).toBeDefined()
  })

  it('exports useTracker', async () => {
    const mod = await import('../src/index')
    expect(mod.useTracker).toBeDefined()
  })

  it('exports useTrack', async () => {
    const mod = await import('../src/index')
    expect(mod.useTrack).toBeDefined()
  })

  it('exports useIdentify', async () => {
    const mod = await import('../src/index')
    expect(mod.useIdentify).toBeDefined()
  })

  it('re-exports web core', async () => {
    const mod = await import('../src/index')
    expect(mod.createTracker).toBeDefined()
    expect(mod.defineDestination).toBeDefined()
    expect(mod.presets).toBeDefined()
  })
})
