# Measurly — Roadmap

## Phase 1: Polish & Ship (v0.1.0)

### README & Documentation
- [ ] Write `README.md` with badges, install instructions, quick start, and architecture diagram
- [ ] Add per-package `README.md` for each `dest-*` and framework package
- [ ] Add `CONTRIBUTING.md` with PR process, branch naming, changeset workflow
- [ ] Add `LICENSE` (MIT)

### MCP Server Completion
- [ ] Wire MCP server to stdio using `@modelcontextprotocol/sdk`
- [ ] Add `bin` entry so it runs as `npx open-measure-mcp`
- [ ] Test with Claude Desktop and Cursor MCP config
- [ ] Add `mcp.json` config example to README

### CLI Improvements
- [ ] `create-destination` should auto-update `pnpm-workspace.yaml` and run `pnpm install`
- [ ] `init` should detect framework from `package.json` (next, react, vue, svelte)
- [ ] `validate` should read actual `@open-measure/spec` schemas instead of hardcoded list
- [ ] Add `open-measure status` command — shows installed destinations, consent config, event counts

### Testing & CI
- [ ] Add GitHub Actions CI: build + test on PR, lint, typecheck
- [ ] Add CI step that fails if `llm_context.md` is stale (diff check after regenerate)
- [ ] Add coverage reporting (target: 80%+)
- [ ] Add Playwright E2E test against a real browser for auto-tracking + inspector
- [ ] Test React provider in jsdom with `@testing-library/react`

### QA & DX
- [ ] Add consent banner integration guide (OneTrust, Cookiebot, custom)
- [ ] Add debug overlay component for React (`<OpenMeasureDebugger />`)
- [ ] Inspector: add `waitForEvent(name, timeout)` async helper for E2E tests

---

## Phase 2: Ad Platform Destinations (v0.2.0)

### dest-google-ads — Google Ads Pixel & Conversion Tracking

**Package:** `@open-measure/dest-google-ads`

**What it does:**
- Loads `gtag.js` with the Google Ads conversion ID (`AW-XXXXXXXXX`)
- Sends conversion events via `gtag('event', 'conversion', { ... })`
- Supports enhanced conversions (hashed email/phone via `user_data`)
- Supports dynamic remarketing events (`view_item`, `add_to_cart`, `purchase`)

**Config:**
```typescript
interface GoogleAdsConfig {
  conversionId: string          // AW-XXXXXXXXX
  conversionLabel?: string      // Optional default label
  enhancedConversions?: boolean  // Enable hashed user_data
  remarketing?: boolean         // Enable dynamic remarketing events
}
```

**Event mapping:**
| Open Measure | Google Ads | Notes |
|---|---|---|
| `purchase` | `conversion` | Requires `conversionLabel`, `value`, `currency`, `transaction_id` |
| `sign_up` | `conversion` | Different label |
| `generate_lead` | `conversion` | Different label |
| `view_item` | `view_item` | Remarketing |
| `add_to_cart` | `add_to_cart` | Remarketing |
| `begin_checkout` | `begin_checkout` | Remarketing |

**Key implementation notes:**
- Google Ads shares `gtag.js` with GA4 — if `dest-ga4` already loaded it, just add a `config` call for the AW- ID, don't load a second script
- Enhanced conversions need `gtag('set', 'user_data', { sha256_email_address: ... })` — reuse `@open-measure/capi` hash utilities
- Multiple conversion labels per event: support `conversionLabels` map in config (`{ purchase: 'AW-XXX/label1', sign_up: 'AW-XXX/label2' }`)
- `consentCategory: 'marketing'`

**Files:**
```
packages/dest-google-ads/
├── src/
│   ├── index.ts        # defineDestination + gtag loading (share with GA4)
│   ├── config.ts       # GoogleAdsConfig interface
│   ├── mapping.ts      # Event name + conversion label mapping
│   └── enhanced.ts     # Enhanced conversions user_data helper
├── __tests__/
│   └── google-ads.test.ts
├── package.json, tsconfig.json, tsup.config.ts
```

---

### dest-tiktok — TikTok Ads Pixel

**Package:** `@open-measure/dest-tiktok`

**What it does:**
- Loads TikTok Pixel (`analytics.tiktok.com/i18n/pixel/events.js`)
- Initializes with `ttq.load(pixelId)` + `ttq.page()`
- Tracks standard and custom events via `ttq.track(eventName, params)`
- Supports Advanced Matching (hashed email/phone)

**Config:**
```typescript
interface TikTokConfig {
  pixelId: string
  advancedMatching?: boolean    // Enable hashed PII for matching
  autoPageView?: boolean        // Let TikTok handle page views (default: false)
}
```

**Event mapping:**
| Open Measure | TikTok | Notes |
|---|---|---|
| `page_view` | `PageVisit` | |
| `view_item` | `ViewContent` | `content_id`, `content_type`, `value`, `currency` |
| `add_to_cart` | `AddToCart` | |
| `begin_checkout` | `InitiateCheckout` | |
| `add_payment_info` | `AddPaymentInfo` | |
| `purchase` | `CompletePayment` | `content_id`, `value`, `currency` |
| `sign_up` | `CompleteRegistration` | |
| `generate_lead` | `SubmitForm` | |
| `subscribe` | `Subscribe` | |

**Key implementation notes:**
- TikTok pixel uses `ttq` global — queue-based like fbq
- Advanced Matching: `ttq.identify({ email: hashedEmail, phone_number: hashedPhone })` — call on identify()
- TikTok requires `content_type` param on ecommerce events (usually `'product'`)
- Rate limit: TikTok pixel can drop events if >50/sec — dedupe is important
- `consentCategory: 'marketing'`

**Files:**
```
packages/dest-tiktok/
├── src/
│   ├── index.ts        # defineDestination + ttq loading
│   ├── config.ts       # TikTokConfig
│   └── mapping.ts      # Event + param mapping (add content_type)
├── __tests__/
│   └── tiktok.test.ts
├── package.json, tsconfig.json, tsup.config.ts
```

---

### dest-x-ads — X (Twitter) Ads Pixel

**Package:** `@open-measure/dest-x-ads`

**What it does:**
- Loads X Pixel (`static.ads-twitter.com/uwt.js`)
- Initializes with `twq('config', pixelId)`
- Tracks conversions via `twq('event', eventId, params)`
- Supports both Universal Website Tag events and custom conversion events

**Config:**
```typescript
interface XAdsConfig {
  pixelId: string               // Twitter pixel ID (e.g., 'xxxxx')
  /** Map Open Measure events to X conversion event IDs */
  conversionEvents?: Record<string, string>
}
```

**Event mapping:**
| Open Measure | X Ads | Notes |
|---|---|---|
| `page_view` | `tw-xxxxx-PageVisit` | Auto-tracked by pixel |
| `purchase` | `tw-xxxxx-Purchase` | `value`, `currency`, `num_items` |
| `sign_up` | `tw-xxxxx-SignUp` | |
| `add_to_cart` | `tw-xxxxx-AddToCart` | |
| `view_item` | `tw-xxxxx-ViewContent` | |
| `generate_lead` | `tw-xxxxx-Lead` | |
| `download` | `tw-xxxxx-Download` | |

**Key implementation notes:**
- X pixel uses `twq` global — similar queue pattern
- X uses event IDs that are pixel-specific: `tw-{pixelId}-{EventName}`
- Conversion events need to be created in X Ads Manager first — the `conversionEvents` config maps our event names to those IDs
- X pixel is lighter than Meta/TikTok — simpler implementation
- `consentCategory: 'marketing'`

**Files:**
```
packages/dest-x-ads/
├── src/
│   ├── index.ts        # defineDestination + twq loading
│   ├── config.ts       # XAdsConfig
│   └── mapping.ts      # Event mapping
├── __tests__/
│   └── x-ads.test.ts
├── package.json, tsconfig.json, tsup.config.ts
```

---

### dest-linkedin-ads — LinkedIn Insight Tag & Conversions API

**Package:** `@open-measure/dest-linkedin-ads`

**What it does:**
- Loads LinkedIn Insight Tag (`snap.licdn.com/li.lms-analytics/insight.min.js`)
- Initializes with partner ID
- Tracks conversions via `window.lintrk('track', { conversion_id: ... })`
- Supports the newer LinkedIn CAPI (server-side) for first-party data

**Config:**
```typescript
interface LinkedInAdsConfig {
  partnerId: string             // LinkedIn partner ID
  /** Map Open Measure events to LinkedIn conversion IDs */
  conversionIds?: Record<string, number>
}
```

**Event mapping:**
| Open Measure | LinkedIn | Notes |
|---|---|---|
| `page_view` | (auto by Insight Tag) | Tag handles this |
| `purchase` | `lintrk('track', { conversion_id: X })` | Needs conversion ID from LinkedIn Campaign Manager |
| `sign_up` | `lintrk('track', { conversion_id: X })` | |
| `generate_lead` | `lintrk('track', { conversion_id: X })` | Most common LinkedIn conversion |
| `subscribe` | `lintrk('track', { conversion_id: X })` | |
| `book_demo` | `lintrk('track', { conversion_id: X })` | Common B2B event |

**Key implementation notes:**
- LinkedIn doesn't have named standard events — everything is a numeric `conversion_id` created in Campaign Manager
- The `conversionIds` config is required for any event beyond page_view: `{ generate_lead: 12345, purchase: 12346 }`
- LinkedIn Insight Tag is heavy (~100KB) — consider lazy loading option
- LinkedIn CAPI (server-side): future enhancement in `@open-measure/capi` — forward events to `https://px.ads.linkedin.com/collect/v2` with hashed email
- `consentCategory: 'marketing'`

**Files:**
```
packages/dest-linkedin-ads/
├── src/
│   ├── index.ts        # defineDestination + Insight Tag loading
│   ├── config.ts       # LinkedInAdsConfig
│   └── mapping.ts      # Conversion ID mapping
├── __tests__/
│   └── linkedin-ads.test.ts
├── package.json, tsconfig.json, tsup.config.ts
```

---

## Phase 3: Server-Side Conversions API (v0.3.0)

Most ad platforms now push for server-side event forwarding (better match rates, immune to ad blockers). Extend `@open-measure/capi` to support:

- [ ] **Google Ads Enhanced Conversions API** — Forward hashed user_data + conversion events server-side
- [ ] **Meta Conversions API (CAPI)** — Forward events to `graph.facebook.com/v18.0/{pixelId}/events` with hashed PII + `event_source_url` + `fbc`/`fbp` cookies
- [ ] **TikTok Events API** — Forward to `business-api.tiktok.com/open_api/v1.3/event/track/`
- [ ] **LinkedIn CAPI** — Forward to `px.ads.linkedin.com/collect/v2`

Architecture:
```typescript
// In @open-measure/capi
import { createServerForwarder } from '@open-measure/capi'

const forwarder = createServerForwarder({
  destinations: [
    { type: 'meta-capi', pixelId: '...', accessToken: '...' },
    { type: 'google-ads-ec', conversionId: 'AW-...', apiKey: '...' },
    { type: 'tiktok-events-api', pixelId: '...', accessToken: '...' },
  ],
  hashFields: ['email', 'phone'],
})

// In API route
const result = await forwarder.forward(request)
```

---

## Phase 4: Events Framework (v0.4.0)

### Typed Event Builders
Instead of raw strings, provide type-safe event builder functions:

```typescript
import { events } from '@open-measure/web'

tracker.track(events.purchase({
  transaction_id: 'tx-1',  // required — TS error if missing
  value: 99.99,            // required
  currency: 'USD',         // required
  items: [{ item_id: 'sku-1', price: 99.99 }],
}))

tracker.track(events.addToCart({
  item_id: 'sku-1',       // required
  price: 49.99,
}))
```

- [ ] Generate typed event functions from `@open-measure/spec` schemas
- [ ] Required params enforced at compile time
- [ ] Optional params with autocomplete
- [ ] Custom event type: `events.custom('webinar_signup', { id: string, title: string })`

### Event Validation Middleware
- [ ] Runtime validation option: `createTracker({ validateEvents: true })` — warns on missing required params
- [ ] Strict mode: throws instead of warns (for testing)

### Funnel Tracking
- [ ] Define funnels in presets: `ecommerce.funnels.purchase = ['view_item', 'add_to_cart', 'begin_checkout', 'purchase']`
- [ ] Track funnel progress per session
- [ ] Warn on funnel step skips (e.g., purchase without begin_checkout)
- [ ] Expose `tracker.getFunnelState()` for QA

---

## Phase 5: Ecosystem (v1.0.0)

- [ ] Vue.js package (`@open-measure/vue`) — composables + plugin
- [ ] Svelte package (`@open-measure/svelte`) — stores + component
- [ ] Astro integration (`@open-measure/astro`)
- [ ] Consent banner component library (headless, works with any CMP)
- [ ] Dashboard: simple self-hosted analytics viewer using webhook destination
- [ ] `npx create-open-measure` — interactive project scaffolding
- [ ] npm publish all packages under `@open-measure/*` scope

---

## Quick Reference: Adding a New Ad Destination

Every ad destination follows the same pattern. Use the CLI:

```bash
npx open-measure create-destination tiktok --consent marketing
```

Then fill in 3 things:
1. **`src/index.ts`** — Load the platform's script tag, call their track function
2. **`src/config.ts`** — Platform-specific config (pixel ID, conversion IDs, etc.)
3. **`src/mapping.ts`** — Map Open Measure event names to platform event names

The `defineDestination()` factory handles everything else: consent gating, SSR safety, init/destroy lifecycle.

---

## Priority Order

1. **Phase 1** — Ship it. README, CI, license. Without this, nobody uses it.
2. **Phase 2: Google Ads + Meta CAPI** — These two cover 80% of ad spend. Do them first.
3. **Phase 2: TikTok** — Growing fast, especially for ecommerce.
4. **Phase 2: LinkedIn** — B2B/SaaS use case.
5. **Phase 2: X Ads** — Lower priority, smaller market share.
6. **Phase 3** — Server-side forwarding. This is where the real business value is (match rates, ad blocker immunity).
7. **Phase 4** — Typed events. DX improvement, not blocking.
8. **Phase 5** — Ecosystem expansion. Only after the core is battle-tested.
