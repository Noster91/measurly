import { OpenMeasureScript, presets } from '@open-measure/next'
import { ga4 } from '@open-measure/dest-ga4'
import { posthog } from '@open-measure/dest-posthog'
import type { ReactNode } from 'react'

const destinations = [
  ga4({ measurementId: 'G-XXXXXXXXXX' }),
  posthog({ apiKey: 'phc_YOUR_KEY', apiHost: 'https://us.i.posthog.com' }),
]

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OpenMeasureScript
          destinations={destinations}
          preset={presets.ecommerce}
          autoTrack={{ pageViews: true, scrollDepth: true }}
          consent={{ analytics: true }}
        >
          {children}
        </OpenMeasureScript>
      </body>
    </html>
  )
}
