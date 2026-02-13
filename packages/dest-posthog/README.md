# @open-measure/dest-posthog

PostHog destination for Open Measure.

## Installation

```bash
npm install @open-measure/dest-posthog @open-measure/web
```

## Usage

```typescript
import { createTracker } from '@open-measure/web'
import { posthog } from '@open-measure/dest-posthog'

const tracker = createTracker({
  destinations: [
    posthog({ apiKey: 'phc_XXXXXXXXXX' }),
  ],
})

tracker.track('purchase', {
  transaction_id: 'order_123',
  value: 99.99,
})
```

## Documentation

See the [full documentation](https://github.com/Noster91/measurly#readme) for more details.

## License

MIT
