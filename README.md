# Open Measure

[![CI](https://github.com/open-measure/open-measure/actions/workflows/ci.yml/badge.svg)](https://github.com/open-measure/open-measure/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@open-measure/web.svg)](https://www.npmjs.com/package/@open-measure/web)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Unified analytics for the modern web. One API for GA4, Meta Pixel, PostHog, and more.

## Features

- **Single API** — Track once, send everywhere
- **Consent-first** — Built-in consent management with category-based gating
- **Deduplication** — Automatic event deduplication prevents double-counting
- **Type-safe** — Full TypeScript support with strict mode
- **SSR-ready** — Works with Next.js, Remix, Astro, and any SSR framework
- **Zero config** — Sensible defaults, customize when needed
- **Tree-shakeable** — Only ship what you use

## Quick Start

```bash
npm install @open-measure/web
```

```typescript
import { createTracker } from '@open-measure/web'
import { ga4 } from '@open-measure/dest-ga4'
import { meta } from '@open-measure/dest-meta'

const tracker = createTracker({
  destinations: [
    ga4({ measurementId: 'G-XXXXXXXXXX' }),
    meta({ pixelId: '1234567890' }),
  ],
})

// Track events
tracker.track('purchase', {
  transaction_id: 'order_123',
  value: 99.99,
  currency: 'USD',
  items: [{ item_id: 'SKU-1', item_name: 'Product', quantity: 1 }],
})

// Page views
tracker.page()

// User identification
tracker.identify('user_123', { email: 'user@example.com' })

// Consent management
tracker.consent({ analytics: true, marketing: false })
```

## React / Next.js

```bash
npm install @open-measure/next
```

```tsx
// app/layout.tsx
import { OpenMeasureProvider } from '@open-measure/next'
import { ga4 } from '@open-measure/dest-ga4'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <OpenMeasureProvider
          destinations={[ga4({ measurementId: 'G-XXXXXXXXXX' })]}
        >
          {children}
        </OpenMeasureProvider>
      </body>
    </html>
  )
}
```

```tsx
// components/checkout.tsx
'use client'
import { useTracker } from '@open-measure/next'

export function CheckoutButton({ orderId, total }) {
  const { track } = useTracker()

  const handlePurchase = () => {
    track('purchase', {
      transaction_id: orderId,
      value: total,
      currency: 'USD',
    })
  }

  return <button onClick={handlePurchase}>Complete Purchase</button>
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Application                        │
├─────────────────────────────────────────────────────────────┤
│   @open-measure/next    │   @open-measure/react             │
│   (Next.js provider)    │   (React hooks)                   │
├─────────────────────────┴───────────────────────────────────┤
│                      @open-measure/web                       │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │ Tracker  │  │ Consent  │  │  Dedupe  │  │  Queue   │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      Destinations                            │
│   ┌────────┐  ┌────────┐  ┌─────────┐  ┌────────┐          │
│   │  GA4   │  │  Meta  │  │ PostHog │  │  GTM   │  ...     │
│   └────────┘  └────────┘  └─────────┘  └────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Packages

| Package | Description |
|---------|-------------|
| [`@open-measure/web`](./packages/web) | Core tracker engine |
| [`@open-measure/react`](./packages/react) | React hooks and provider |
| [`@open-measure/next`](./packages/next) | Next.js integration with auto page tracking |
| [`@open-measure/svelte`](./packages/svelte) | Svelte 5 / SvelteKit integration with page tracking |
| [`@open-measure/dest-ga4`](./packages/dest-ga4) | Google Analytics 4 destination |
| [`@open-measure/dest-meta`](./packages/dest-meta) | Meta Pixel destination |
| [`@open-measure/dest-posthog`](./packages/dest-posthog) | PostHog destination |
| [`@open-measure/dest-gtm`](./packages/dest-gtm) | Google Tag Manager dataLayer adapter |
| [`@open-measure/cli`](./packages/cli) | CLI for scaffolding and validation |
| [`@open-measure/qa`](./packages/qa) | QA toolkit with event inspector |
| [`@open-measure/capi`](./packages/capi) | Server-side Conversions API |

## Consent Management

Open Measure uses category-based consent:

```typescript
// Categories: necessary, analytics, marketing, personalization
tracker.consent({
  necessary: true,    // Always true
  analytics: true,    // GA4, PostHog
  marketing: false,   // Meta, TikTok, Google Ads
})

// Destinations only fire when their category is consented
// GA4 requires analytics, Meta requires marketing
```

## Event Deduplication

Automatic deduplication prevents double-counting:

```typescript
// Same transaction_id within 5 minutes = deduplicated
tracker.track('purchase', { transaction_id: 'order_123', value: 99 })
tracker.track('purchase', { transaction_id: 'order_123', value: 99 }) // Ignored
```

## CLI

```bash
# Initialize Open Measure in your project
npx open-measure init

# Validate tracking implementation
npx open-measure validate --src ./src

# Health check
npx open-measure doctor

# Scaffold a new destination
npx open-measure create-destination my-platform
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](./LICENSE)
