import { writeFileSync } from 'node:fs'

type Flags = Record<string, string | boolean | undefined>

export async function generateContext(flags: Flags): Promise<void> {
  const output = typeof flags['output'] === 'string' ? flags['output'] : 'llm_context.md'
  const dryRun = flags['dry-run'] === true
  const format = flags['format']

  const content = generateLlmContext()

  if (format === 'json') {
    console.log(JSON.stringify({ output, tokenEstimate: estimateTokens(content), content }, null, 2))
    return
  }

  if (dryRun) {
    console.log(`Would write ${output} (~${estimateTokens(content)} tokens)`)
    return
  }

  writeFileSync(output, content)
  console.log(`Generated ${output} (~${estimateTokens(content)} tokens)`)
}

function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4)
}

function generateLlmContext(): string {
  return `# Open Measure — LLM Context

> Auto-generated. Do not edit manually.

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

| Package | Use When |
|---------|----------|
| \`@open-measure/web\` | Vanilla JS/TS, any framework |
| \`@open-measure/react\` | React apps (re-exports web) |
| \`@open-measure/next\` | Next.js apps (re-exports react+web) |
| \`@open-measure/dest-ga4\` | Google Analytics 4 |
| \`@open-measure/dest-meta\` | Meta Pixel |
| \`@open-measure/dest-posthog\` | PostHog |
| \`@open-measure/dest-gtm\` | Google Tag Manager |
| \`@open-measure/cli\` | CLI tools |
| \`@open-measure/qa\` | QA/testing toolkit |
| \`@open-measure/capi\` | Server-side conversion API |

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
  mapParams?(eventName: string, params: Record<string, unknown>): Record<string, unknown> | undefined
  flush?(): Promise<void>
  destroy?(): void
}
\`\`\`

## Presets

| Preset | Auto-Track | Key Events | Dedupe |
|--------|-----------|------------|--------|
| \`ecommerce\` | pageViews | view_item -> purchase funnel | purchase (5s), add_to_cart (2s) |
| \`saas\` | pageViews | sign_up -> subscribe | sign_up (10s), login (5s) |
| \`leadgen\` | pageViews, outboundClicks, scrollDepth, forms | generate_lead, form_submit | generate_lead (10s) |

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

### React with Provider
\`\`\`tsx
import { OpenMeasureProvider, useTrack } from '@open-measure/react'
import { ga4 } from '@open-measure/dest-ga4'

function App() {
  return (
    <OpenMeasureProvider destinations={[ga4({ measurementId: 'G-XXX' })]} consent={{ analytics: true }}>
      <MyComponent />
    </OpenMeasureProvider>
  )
}

function MyComponent() {
  const track = useTrack()
  return <button onClick={() => track('button_click', { id: 'cta' })}>Click</button>
}
\`\`\`

### Next.js App Router
\`\`\`tsx
// app/layout.tsx
import { OpenMeasureScript } from '@open-measure/next'
import { ga4 } from '@open-measure/dest-ga4'

export default function RootLayout({ children }) {
  return (
    <html><body>
      <OpenMeasureScript destinations={[ga4({ measurementId: 'G-XXX' })]} consent={{ analytics: true }}>
        {children}
      </OpenMeasureScript>
    </body></html>
  )
}
\`\`\`

### Custom Destination (inline)
\`\`\`typescript
import { defineDestination, createTracker } from '@open-measure/web'

const logger = defineDestination<{}>({
  name: 'console', version: '1.0.0', consentCategory: 'necessary',
  setup() {
    return {
      async init() {},
      track(event) { console.log(event.event_name, event.params) },
    }
  },
})({})

const tracker = createTracker({ destinations: [logger], consent: { necessary: true } })
\`\`\`

### Webhook Destination
\`\`\`typescript
import { createTracker, webhook } from '@open-measure/web'

const tracker = createTracker({
  destinations: [webhook({ endpoint: 'https://api.example.com/events', batchSize: 10 })],
  consent: { analytics: true },
})
\`\`\`

## File Structure

\`\`\`
packages/
  web/src/          types.ts, tracker.ts, destination.ts, presets.ts, auto-track.ts
  react/src/        provider.tsx (hooks + context)
  next/src/         script.tsx, use-page-tracking.ts
  dest-*/src/       index.ts (defineDestination), config.ts, mapping.ts
  cli/src/          commands/ (init, create-destination, add-event, validate, doctor, generate-context)
  qa/src/           invariants.ts, inspector.ts
  capi/src/         handler.ts, hash.ts
\`\`\`
`
}
