'use client'

import type { ReactNode } from 'react'
import { OpenMeasureProvider } from '@open-measure/react'
import type { TrackerOptions } from '@open-measure/web'

export interface OpenMeasureScriptProps extends TrackerOptions {
  children: ReactNode
}

/**
 * Next.js wrapper that initializes Open Measure with 'use client' directive.
 * Use this in your root layout to enable tracking across your Next.js app.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { OpenMeasureScript } from '@open-measure/next'
 * import { ga4 } from '@open-measure/dest-ga4'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <OpenMeasureScript
 *           destinations={[ga4({ measurementId: 'G-XXX' })]}
 *           consent={{ analytics: true }}
 *         >
 *           {children}
 *         </OpenMeasureScript>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function OpenMeasureScript({ children, ...options }: OpenMeasureScriptProps) {
  return (
    <OpenMeasureProvider {...options}>
      {children}
    </OpenMeasureProvider>
  )
}
