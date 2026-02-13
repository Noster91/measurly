# @open-measure/dest-ga4

Google Analytics 4 destination for Open Measure.

## Installation

```bash
npm install @open-measure/dest-ga4 @open-measure/web
```

## Usage

```typescript
import { createTracker } from '@open-measure/web'
import { ga4 } from '@open-measure/dest-ga4'

const tracker = createTracker({
  destinations: [
    ga4({ measurementId: 'G-XXXXXXXXXX' }),
  ],
})

tracker.track('purchase', {
  transaction_id: 'order_123',
  value: 99.99,
  currency: 'USD',
})
```

## Configuration

```typescript
ga4({
  measurementId: 'G-XXXXXXXXXX', // Required
  debug: false,                   // Enable debug mode
})
```

## Documentation

See the [full documentation](https://github.com/Noster91/measurly#readme) for more details.

## License

MIT
