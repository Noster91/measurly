# @open-measure/qa

QA toolkit for Open Measure - event inspector and validation.

## Installation

```bash
npm install @open-measure/qa
```

## Usage

```typescript
import { createInspector } from '@open-measure/qa'
import { createTracker } from '@open-measure/web'

// Create inspector
const inspector = createInspector()

// Add to tracker
const tracker = createTracker({
  destinations: [inspector.destination],
})

// Track events
tracker.track('purchase', { transaction_id: 'tx-1', value: 99 })

// Inspect captured events
console.log(inspector.getEvents())
console.log(inspector.getEventsByName('purchase'))

// Clear for next test
inspector.clear()
```

## Documentation

See the [full documentation](https://github.com/Noster91/measurly#readme) for more details.

## License

MIT
