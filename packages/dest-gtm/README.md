# @open-measure/dest-gtm

Google Tag Manager dataLayer destination for Open Measure.

## Installation

```bash
npm install @open-measure/dest-gtm @open-measure/web
```

## Usage

```typescript
import { createTracker } from '@open-measure/web'
import { gtm } from '@open-measure/dest-gtm'

const tracker = createTracker({
  destinations: [
    gtm({ containerId: 'GTM-XXXXXX' }),
  ],
})

// Events are pushed to dataLayer as om_<event_name>
tracker.track('purchase', {
  transaction_id: 'order_123',
  value: 99.99,
})
// Pushes: { event: 'om_purchase', om_transaction_id: 'order_123', ... }
```

## Documentation

See the [full documentation](https://github.com/Noster91/measurly#readme) for more details.

## License

MIT
