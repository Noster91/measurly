import type { MCPTool, MCPToolResult, MCPToolInput } from './server'

function textResult(text: string): MCPToolResult {
  return { content: [{ type: 'text', text }] }
}

const omAddTracking: MCPTool = {
  name: 'om_add_tracking',
  description: 'Generate a tracking call code snippet for a specific event',
  inputSchema: {
    type: 'object',
    properties: {
      event_name: { type: 'string', description: 'Event name to track (e.g., purchase, page_view)' },
      params: { type: 'string', description: 'Comma-separated key:value pairs for event params' },
      framework: { type: 'string', description: 'Framework context (web, react, next)', enum: ['web', 'react', 'next'] },
    },
    required: ['event_name'],
  },
  async handler(input: MCPToolInput) {
    const eventName = input.event_name as string
    const paramsStr = (input.params as string) ?? ''
    const framework = (input.framework as string) ?? 'web'

    const params = paramsStr
      ? Object.fromEntries(
          paramsStr.split(',').map((p) => {
            const [k, v] = p.trim().split(':')
            return [k, v ?? 'value']
          }),
        )
      : {}

    const paramsCode = Object.keys(params).length > 0
      ? `, ${JSON.stringify(params, null, 2)}`
      : ''

    let code: string
    if (framework === 'react') {
      code = `const track = useTrack()\ntrack('${eventName}'${paramsCode})`
    } else {
      code = `tracker.track('${eventName}'${paramsCode})`
    }

    return textResult(`\`\`\`typescript\n${code}\n\`\`\``)
  },
}

const omListEvents: MCPTool = {
  name: 'om_list_events',
  description: 'List all available spec events and their parameters',
  inputSchema: {
    type: 'object',
    properties: {
      category: { type: 'string', description: 'Filter by category', enum: ['ecommerce', 'engagement', 'lifecycle', 'custom'] },
    },
  },
  async handler(input: MCPToolInput) {
    // Import dynamically to avoid circular deps at build time
    const events = [
      { name: 'page_view', category: 'engagement', params: 'page_title, page_location, page_referrer' },
      { name: 'view_item', category: 'ecommerce', params: 'item_id, item_name, price, currency' },
      { name: 'add_to_cart', category: 'ecommerce', params: 'item_id, item_name, price, quantity' },
      { name: 'purchase', category: 'ecommerce', params: 'transaction_id*, value*, currency*, items, tax, shipping' },
      { name: 'sign_up', category: 'lifecycle', params: 'method' },
      { name: 'login', category: 'lifecycle', params: 'method' },
      { name: 'generate_lead', category: 'engagement', params: 'source, value, currency' },
      { name: 'form_submit', category: 'engagement', params: 'form_id, form_name' },
      { name: 'scroll_depth', category: 'engagement', params: 'percent*' },
      { name: 'outbound_click', category: 'engagement', params: 'link_url*, link_text' },
      { name: 'feature_used', category: 'engagement', params: 'feature_name*' },
      { name: 'subscribe', category: 'lifecycle', params: 'plan*, value, currency' },
    ]

    const category = input.category as string | undefined
    const filtered = category ? events.filter((e) => e.category === category) : events
    const lines = filtered.map((e) => `- **${e.name}** (${e.category}): ${e.params}`)
    return textResult(lines.join('\n'))
  },
}

const omValidate: MCPTool = {
  name: 'om_validate',
  description: 'Validate tracking implementation against the spec',
  inputSchema: {
    type: 'object',
    properties: {
      code: { type: 'string', description: 'Code to validate' },
      preset: { type: 'string', description: 'Preset to validate against', enum: ['ecommerce', 'saas', 'leadgen'] },
    },
    required: ['code'],
  },
  async handler(input: MCPToolInput) {
    const code = input.code as string
    const trackCalls = code.match(/\.track\s*\(\s*['"]([^'"]+)['"]/g) ?? []
    const events = trackCalls.map((m) => {
      const match = m.match(/['"]([^'"]+)['"]/)
      return match?.[1] ?? ''
    })

    const issues: string[] = []

    // Check for common issues
    if (code.includes('window.') && !code.includes('typeof window')) {
      issues.push('Warning: Direct window access without SSR guard')
    }

    if (events.includes('purchase')) {
      if (!code.includes('transaction_id')) {
        issues.push('Error: purchase event should include transaction_id')
      }
    }

    if (issues.length === 0) {
      return textResult(`Validation passed. Found ${events.length} tracking calls: ${events.join(', ')}`)
    }

    return textResult(`Found ${issues.length} issue(s):\n${issues.map((i) => `- ${i}`).join('\n')}\n\nTracked events: ${events.join(', ')}`)
  },
}

const omListDestinations: MCPTool = {
  name: 'om_list_destinations',
  description: 'List available and installed destination plugins',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async handler() {
    const destinations = [
      { name: 'ga4', package: '@open-measure/dest-ga4', description: 'Google Analytics 4' },
      { name: 'meta', package: '@open-measure/dest-meta', description: 'Meta Pixel with PII detection' },
      { name: 'posthog', package: '@open-measure/dest-posthog', description: 'PostHog analytics' },
      { name: 'gtm', package: '@open-measure/dest-gtm', description: 'Google Tag Manager dataLayer' },
      { name: 'webhook', package: '@open-measure/web (built-in)', description: 'Custom webhook endpoint' },
    ]

    const lines = destinations.map((d) => `- **${d.name}** (\`${d.package}\`): ${d.description}`)
    return textResult(lines.join('\n'))
  },
}

const omAddDestination: MCPTool = {
  name: 'om_add_destination',
  description: 'Generate code to add a destination to the tracker configuration',
  inputSchema: {
    type: 'object',
    properties: {
      destination: { type: 'string', description: 'Destination name (ga4, meta, posthog, gtm, webhook)' },
      config: { type: 'string', description: 'JSON config for the destination' },
    },
    required: ['destination'],
  },
  async handler(input: MCPToolInput) {
    const dest = input.destination as string
    const configStr = input.config as string | undefined

    const configs: Record<string, string> = {
      ga4: `ga4({ measurementId: 'G-XXXXXXXXXX' })`,
      meta: `meta({ pixelId: 'YOUR_PIXEL_ID' })`,
      posthog: `posthog({ apiKey: 'phc_YOUR_KEY' })`,
      gtm: `gtm({ containerId: 'GTM-XXXXXX' })`,
      webhook: `webhook({ endpoint: 'https://api.example.com/events' })`,
    }

    const configCode = configStr ?? configs[dest] ?? `${dest}({ /* config */ })`

    const importLine = dest === 'webhook'
      ? `import { webhook } from '@open-measure/web'`
      : `import { ${dest} } from '@open-measure/dest-${dest}'`

    return textResult(`Add this import:\n\`\`\`typescript\n${importLine}\n\`\`\`\n\nAdd to destinations array:\n\`\`\`typescript\n${configCode}\n\`\`\``)
  },
}

const omInit: MCPTool = {
  name: 'om_init',
  description: 'Generate initialization code for Open Measure in a project',
  inputSchema: {
    type: 'object',
    properties: {
      framework: { type: 'string', description: 'Target framework', enum: ['web', 'react', 'next'] },
      destinations: { type: 'string', description: 'Comma-separated destination names (ga4,meta,posthog)' },
      preset: { type: 'string', description: 'Preset to use', enum: ['ecommerce', 'saas', 'leadgen'] },
    },
  },
  async handler(input: MCPToolInput) {
    const framework = (input.framework as string) ?? 'web'
    const destStr = (input.destinations as string) ?? 'ga4'
    const preset = input.preset as string | undefined
    const dests = destStr.split(',').map((d) => d.trim())

    const imports = dests
      .filter((d) => d !== 'webhook')
      .map((d) => `import { ${d} } from '@open-measure/dest-${d}'`)
      .join('\n')

    const pkgImport = framework === 'next'
      ? '@open-measure/next'
      : framework === 'react'
        ? '@open-measure/react'
        : '@open-measure/web'

    const presetImport = preset ? ', presets' : ''
    const presetLine = preset ? `  preset: presets.${preset},\n` : ''

    const destLines = dests.map((d) => {
      const configs: Record<string, string> = {
        ga4: `    ga4({ measurementId: 'G-XXXXXXXXXX' }),`,
        meta: `    meta({ pixelId: 'YOUR_PIXEL_ID' }),`,
        posthog: `    posthog({ apiKey: 'phc_YOUR_KEY' }),`,
        gtm: `    gtm({ containerId: 'GTM-XXXXXX' }),`,
        webhook: `    webhook({ endpoint: 'https://api.example.com/events' }),`,
      }
      return configs[d] ?? `    ${d}({ /* config */ }),`
    }).join('\n')

    const code = `import { createTracker${presetImport} } from '${pkgImport}'
${imports}

const tracker = createTracker({
${presetLine}  destinations: [
${destLines}
  ],
  autoTrack: { pageViews: true },
  consent: { analytics: true },
})

export { tracker }`

    const installCmd = `npm install ${pkgImport} ${dests.filter((d) => d !== 'webhook').map((d) => `@open-measure/dest-${d}`).join(' ')}`

    return textResult(`Install:\n\`\`\`bash\n${installCmd}\n\`\`\`\n\nCode:\n\`\`\`typescript\n${code}\n\`\`\``)
  },
}

export const tools: MCPTool[] = [
  omAddTracking,
  omListEvents,
  omValidate,
  omListDestinations,
  omAddDestination,
  omInit,
]
