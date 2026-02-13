# @open-measure/next

Next.js integration for Open Measure with automatic page tracking.

## Installation

```bash
npm install @open-measure/next
```

## Usage

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

## Features

- Automatic page view tracking on route changes
- SSR-safe
- Re-exports all hooks from `@open-measure/react`

## Documentation

See the [full documentation](https://github.com/Noster91/measurly#readme) for more details.

## License

MIT
