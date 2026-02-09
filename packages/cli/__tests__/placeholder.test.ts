import { describe, it, expect } from 'vitest'
import { parseArgs } from '../src/args'

describe('parseArgs', () => {
  it('parses command name', () => {
    const result = parseArgs(['init'])
    expect(result.command).toBe('init')
  })

  it('parses flags with values', () => {
    const result = parseArgs(['init', '--dest', 'ga4,meta', '--framework', 'next'])
    expect(result.command).toBe('init')
    expect(result.flags['dest']).toBe('ga4,meta')
    expect(result.flags['framework']).toBe('next')
  })

  it('parses boolean flags', () => {
    const result = parseArgs(['validate', '--strict', '--dry-run'])
    expect(result.command).toBe('validate')
    expect(result.flags['strict']).toBe(true)
    expect(result.flags['dry-run']).toBe(true)
  })

  it('parses flags with = syntax', () => {
    const result = parseArgs(['init', '--dest=ga4,meta'])
    expect(result.flags['dest']).toBe('ga4,meta')
  })

  it('handles positional args', () => {
    const result = parseArgs(['create-destination', 'linkedin-ads', '--consent', 'marketing'])
    expect(result.command).toBe('create-destination')
    expect(result.positional).toEqual(['linkedin-ads'])
    expect(result.flags['consent']).toBe('marketing')
  })

  it('handles empty args', () => {
    const result = parseArgs([])
    expect(result.command).toBeUndefined()
    expect(result.flags).toEqual({})
  })

  it('handles --help flag', () => {
    const result = parseArgs(['--help'])
    expect(result.flags['help']).toBe(true)
    expect(result.command).toBeUndefined()
  })

  it('handles --version flag', () => {
    const result = parseArgs(['--version'])
    expect(result.flags['version']).toBe(true)
  })
})

describe('CLI commands', () => {
  it('exports init', async () => {
    const { init } = await import('../src/commands/init')
    expect(init).toBeDefined()
  })

  it('exports createDestination', async () => {
    const { createDestination } = await import('../src/commands/create-destination')
    expect(createDestination).toBeDefined()
  })

  it('exports addEvent', async () => {
    const { addEvent } = await import('../src/commands/add-event')
    expect(addEvent).toBeDefined()
  })

  it('exports validate', async () => {
    const { validate } = await import('../src/commands/validate')
    expect(validate).toBeDefined()
  })

  it('exports doctor', async () => {
    const { doctor } = await import('../src/commands/doctor')
    expect(doctor).toBeDefined()
  })

  it('exports generateContext', async () => {
    const { generateContext } = await import('../src/commands/generate-context')
    expect(generateContext).toBeDefined()
  })
})
