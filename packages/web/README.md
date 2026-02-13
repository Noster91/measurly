# @open-measure/web

Core analytics tracker with plugin architecture.

## Installation

```bash
npm install @open-measure/web
```

## Usage

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
})

// Page views
tracker.page()

// Identify users
tracker.identify('user_123', { email: 'user@example.com' })

// Consent management
tracker.consent({ analytics: true, marketing: false })
```

## Documentation

See the [full documentation](https://github.com/Noster91/measurly#readme) for more details.

## License

MIT
