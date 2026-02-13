# @open-measure/react

React hooks and provider for Open Measure.

## Installation

```bash
npm install @open-measure/react @open-measure/web
```

## Usage

```tsx
import { OpenMeasureProvider, useTracker } from '@open-measure/react'
import { ga4 } from '@open-measure/dest-ga4'

// Wrap your app
function App() {
  return (
    <OpenMeasureProvider
      destinations={[ga4({ measurementId: 'G-XXXXXXXXXX' })]}
    >
      <MyComponent />
    </OpenMeasureProvider>
  )
}

// Use in components
function MyComponent() {
  const { track } = useTracker()

  return (
    <button onClick={() => track('button_click', { label: 'cta' })}>
      Click me
    </button>
  )
}
```

## Documentation

See the [full documentation](https://github.com/Noster91/measurly#readme) for more details.

## License

MIT
