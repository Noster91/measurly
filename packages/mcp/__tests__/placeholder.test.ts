import { describe, it, expect } from 'vitest'
import { createMCPServer } from '../src/server'
import { tools } from '../src/tools'

describe('MCP server', () => {
  it('lists all 6 tools', () => {
    const server = createMCPServer(tools)
    const listed = server.listTools()
    expect(listed).toHaveLength(6)
  })

  it('lists tool names', () => {
    const server = createMCPServer(tools)
    const names = server.listTools().map((t) => t.name)
    expect(names).toContain('om_add_tracking')
    expect(names).toContain('om_list_events')
    expect(names).toContain('om_validate')
    expect(names).toContain('om_list_destinations')
    expect(names).toContain('om_add_destination')
    expect(names).toContain('om_init')
  })

  it('handles unknown tool', async () => {
    const server = createMCPServer(tools)
    const result = await server.callTool('unknown_tool', {})
    expect(result.isError).toBe(true)
    expect(result.content[0]!.text).toContain('Unknown tool')
  })
})

describe('MCP tools', () => {
  const server = createMCPServer(tools)

  it('om_add_tracking generates code', async () => {
    const result = await server.callTool('om_add_tracking', { event_name: 'purchase' })
    expect(result.content[0]!.text).toContain('purchase')
    expect(result.content[0]!.text).toContain('track')
  })

  it('om_add_tracking with react framework', async () => {
    const result = await server.callTool('om_add_tracking', { event_name: 'page_view', framework: 'react' })
    expect(result.content[0]!.text).toContain('useTrack')
  })

  it('om_list_events returns events', async () => {
    const result = await server.callTool('om_list_events', {})
    expect(result.content[0]!.text).toContain('purchase')
    expect(result.content[0]!.text).toContain('page_view')
  })

  it('om_list_events filters by category', async () => {
    const result = await server.callTool('om_list_events', { category: 'ecommerce' })
    expect(result.content[0]!.text).toContain('purchase')
    expect(result.content[0]!.text).not.toContain('login')
  })

  it('om_validate checks code', async () => {
    const result = await server.callTool('om_validate', { code: `tracker.track('page_view')` })
    expect(result.content[0]!.text).toContain('page_view')
  })

  it('om_validate catches SSR issues', async () => {
    const result = await server.callTool('om_validate', {
      code: `window.location.href\ntracker.track('page_view')`,
    })
    expect(result.content[0]!.text).toContain('SSR')
  })

  it('om_list_destinations returns destinations', async () => {
    const result = await server.callTool('om_list_destinations', {})
    expect(result.content[0]!.text).toContain('ga4')
    expect(result.content[0]!.text).toContain('meta')
    expect(result.content[0]!.text).toContain('posthog')
    expect(result.content[0]!.text).toContain('gtm')
    expect(result.content[0]!.text).toContain('webhook')
  })

  it('om_add_destination generates code', async () => {
    const result = await server.callTool('om_add_destination', { destination: 'ga4' })
    expect(result.content[0]!.text).toContain('import')
    expect(result.content[0]!.text).toContain('ga4')
  })

  it('om_init generates full setup', async () => {
    const result = await server.callTool('om_init', {
      framework: 'next',
      destinations: 'ga4,meta',
      preset: 'ecommerce',
    })
    expect(result.content[0]!.text).toContain('@open-measure/next')
    expect(result.content[0]!.text).toContain('ga4')
    expect(result.content[0]!.text).toContain('meta')
    expect(result.content[0]!.text).toContain('ecommerce')
  })
})
