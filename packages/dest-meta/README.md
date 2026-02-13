# @open-measure/dest-meta

Meta (Facebook) Pixel destination for Open Measure.

## Installation

```bash
npm install @open-measure/dest-meta @open-measure/web
```

## Usage

```typescript
import { createTracker } from '@open-measure/web'
import { meta } from '@open-measure/dest-meta'

const tracker = createTracker({
  destinations: [
    meta({ pixelId: '1234567890' }),
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
meta({
  pixelId: '1234567890', // Required
  debug: false,          // Enable debug mode
})
```

## Documentation

See the [full documentation](https://github.com/Noster91/measurly#readme) for more details.

## License

MIT
