#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = typeof import.meta.dirname === 'string'
  ? import.meta.dirname
  : dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function getPackageInfo(): Array<{ name: string; description: string }> {
  const packagesDir = join(ROOT, 'packages')
  const packages: Array<{ name: string; description: string }> = []

  for (const dir of readdirSync(packagesDir)) {
    const pkgPath = join(packagesDir, dir, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        packages.push({ name: pkg.name, description: pkg.description ?? '' })
      } catch {
        // skip
      }
    }
  }
  return packages
}

function generate(): string {
  const packages = getPackageInfo()

  const packageTable = packages
    .map((p) => `| \`${p.name}\` | ${p.description} |`)
    .join('\n')

  return `# Open Measure — LLM Context

> Auto-generated from source. Do not edit manually.
> Regenerate with: \`pnpm generate-context\`

## Quick Start

\`\`\`typescript
import { createTracker, presets } from '@open-measure/web'
import { ga4 } from '@open-measure/dest-ga4'

const tracker = createTracker({
  preset: presets.ecommerce,
  destinations: [ga4({ measurementId: 'G-XXX' })],
  consent: { analytics: true },
})

tracker.track('page_view', { page_title: 'Home' })
tracker.track('purchase', { transaction_id: 'tx-1', value: 99, currency: 'USD' })
tracker.identify('user-123', { plan: 'pro' })
\`\`\`

## Package Map

| Package | Description |
|---------|-------------|
${packageTable}

## Core API

### \`createTracker(options)\`
Creates a tracker instance. Options:
- \`destinations\`: Array of Destination objects
- \`preset\`: Optional preset (\`ecommerce\`, \`saas\`, \`leadgen\`)
- \`autoTrack\`: \`{ pageViews, outboundClicks, scrollDepth, formSubmissions }\`
- \`consent\`: \`{ necessary, analytics, marketing, personalization }\`
- \`debug\`: Enable console logging

Returns: \`{ track, identify, updateConsent, getConsent, flush, destroy }\`

### \`defineDestination<Config>(definition)\`
Factory to create destination plugins:
\`\`\`typescript
const myDest = defineDestination<{ apiKey: string }>({
  name: 'my-dest', version: '1.0.0', consentCategory: 'analytics',
  setup(config) {
    return {
      async init() { /* load SDK */ },
      track(event) { /* send event */ },
    }
  },
})
\`\`\`

### Destination Interface
\`\`\`typescript
interface Destination {
  name: string; version: string; consentCategory: keyof ConsentState
  init(): Promise<void>
  track(event: TrackedEvent): void
  identify?(userId: string, traits?: Record<string, unknown>): void
  shouldTrack(event: TrackedEvent, consent: ConsentState): boolean
  mapEventName?(eventName: string): string | undefined
  mapParams?(name: string, params: Record<string, unknown>): Record<string, unknown> | undefined
  flush?(): Promise<void>
  destroy?(): void
}
\`\`\`

## Presets

| Preset | Auto-Track | Key Events | Dedupe |
|--------|-----------|------------|--------|
| \`ecommerce\` | pageViews | view_item -> purchase | purchase (5s), add_to_cart (2s) |
| \`saas\` | pageViews | sign_up -> subscribe | sign_up (10s), login (5s) |
| \`leadgen\` | all | generate_lead, form_submit | generate_lead (10s) |

## CLI Commands

\`\`\`bash
open-measure init --dest ga4,meta --framework next --preset ecommerce
open-measure create-destination <name> --consent marketing
open-measure add-event <name> --params "field:type,field:type"
open-measure validate --src src/ --preset ecommerce --strict
open-measure doctor --format json
open-measure generate-context --output llm_context.md
\`\`\`

All commands support \`--dry-run\` and \`--format json\`.

## Common Patterns

### React
\`\`\`tsx
<OpenMeasureProvider destinations={[ga4(...)]} consent={{ analytics: true }}>
  <App />
</OpenMeasureProvider>

// In components:
const track = useTrack()
track('button_click', { id: 'cta' })
\`\`\`

### Next.js
\`\`\`tsx
<OpenMeasureScript destinations={[ga4(...)]} consent={{ analytics: true }}>
  {children}
</OpenMeasureScript>
\`\`\`

### Custom Destination
\`\`\`typescript
const logger = defineDestination<{}>({
  name: 'console', version: '1.0.0', consentCategory: 'necessary',
  setup() {
    return {
      async init() {},
      track(event) { console.log(event.event_name, event.params) },
    }
  },
})({})
\`\`\`

### Webhook
\`\`\`typescript
import { webhook } from '@open-measure/web'
webhook({ endpoint: 'https://api.example.com/events', batchSize: 10 })
\`\`\`

### Server-side (CAPI)
\`\`\`typescript
import { createHandler, hashEmail } from '@open-measure/capi'
const handler = createHandler({ hashFields: ['email'] })
const result = handler.process({ events: [...] })
\`\`\`

## File Structure

\`\`\`
packages/
  web/src/       types.ts, tracker.ts, destination.ts, presets.ts, auto-track.ts
  react/src/     provider.tsx (hooks + context)
  next/src/      script.tsx, use-page-tracking.ts
  dest-*/src/    index.ts (defineDestination), config.ts, mapping.ts
  cli/src/       commands/ (init, create-destination, add-event, validate, doctor)
  qa/src/        invariants.ts, inspector.ts, playwright.ts
  capi/src/      handler.ts, hash.ts
  mcp/src/       tools/ (6 MCP tools)
\`\`\`
`
}

const content = generate()
const tokens = estimateTokens(content)
const outputPath = process.argv[2] ?? join(ROOT, 'llm_context.md')

writeFileSync(outputPath, content)
console.log(`Generated ${outputPath} (~${tokens} tokens)`)

if (tokens > 4000) {
  console.warn(`Warning: ${tokens} tokens exceeds 4000 token target`)
}
