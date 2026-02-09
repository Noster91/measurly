import { createContext, useContext, useEffect, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import { createTracker } from '@open-measure/web'
import type { Tracker, TrackerOptions } from '@open-measure/web'

const TrackerContext = createContext<Tracker | null>(null)

export interface OpenMeasureProviderProps extends TrackerOptions {
  children: ReactNode
}

/**
 * Provider component that creates and manages a tracker instance.
 *
 * @example
 * ```tsx
 * <OpenMeasureProvider
 *   destinations={[ga4({ measurementId: 'G-XXX' })]}
 *   preset={presets.ecommerce}
 *   consent={{ analytics: true }}
 * >
 *   <App />
 * </OpenMeasureProvider>
 * ```
 */
export function OpenMeasureProvider({ children, ...options }: OpenMeasureProviderProps) {
  const trackerRef = useRef<Tracker | null>(null)

  if (!trackerRef.current) {
    trackerRef.current = createTracker(options)
  }

  useEffect(() => {
    return () => {
      trackerRef.current?.destroy()
      trackerRef.current = null
    }
  }, [])

  return (
    <TrackerContext.Provider value={trackerRef.current}>
      {children}
    </TrackerContext.Provider>
  )
}

/**
 * Hook to access the full tracker instance.
 */
export function useTracker(): Tracker {
  const tracker = useContext(TrackerContext)
  if (!tracker) {
    throw new Error('useTracker must be used within an OpenMeasureProvider')
  }
  return tracker
}

/**
 * Hook that returns a stable `track` function.
 *
 * @example
 * ```tsx
 * const track = useTrack()
 * track('button_click', { button_id: 'cta' })
 * ```
 */
export function useTrack() {
  const tracker = useTracker()
  return useCallback(
    (eventName: string, params?: Record<string, unknown>) => {
      tracker.track(eventName, params)
    },
    [tracker],
  )
}

/**
 * Hook that returns a stable `identify` function.
 *
 * @example
 * ```tsx
 * const identify = useIdentify()
 * identify('user-123', { plan: 'pro' })
 * ```
 */
export function useIdentify() {
  const tracker = useTracker()
  return useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      tracker.identify(userId, traits)
    },
    [tracker],
  )
}
