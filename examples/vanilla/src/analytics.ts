import { createTracker, presets, webhook } from '@open-measure/web'
import { ga4 } from '@open-measure/dest-ga4'

// Create tracker with GA4 + webhook for custom backend
export const tracker = createTracker({
  preset: presets.ecommerce,
  destinations: [
    ga4({ measurementId: 'G-XXXXXXXXXX' }),
    webhook({ endpoint: '/api/events', batchSize: 10 }),
  ],
  autoTrack: {
    pageViews: true,
    outboundClicks: true,
  },
  consent: {
    analytics: true,
  },
  debug: true,
})

// Example: Track a purchase
tracker.track('purchase', {
  transaction_id: 'tx-12345',
  value: 99.99,
  currency: 'USD',
  items: [{ item_id: 'sku-1', item_name: 'Widget', price: 99.99 }],
})

// Example: Identify a user
tracker.identify('user-123', {
  plan: 'pro',
  signup_date: '2024-01-15',
})

// Example: Update consent (e.g., after cookie banner)
tracker.updateConsent({
  marketing: true,
  personalization: true,
})
