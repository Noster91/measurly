'use client'

import { useEffect } from 'react'
import { useTracker } from '@open-measure/react'

/**
 * Hook that tracks page views on Next.js route changes using the pathname.
 * Works with both App Router and Pages Router.
 *
 * @example
 * ```tsx
 * // In a client component or layout
 * import { usePageTracking } from '@open-measure/next'
 *
 * export function Analytics() {
 *   usePageTracking()
 *   return null
 * }
 * ```
 */
export function usePageTracking() {
  const tracker = useTracker()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Track initial page view
    tracker.track('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_referrer: document.referrer,
    })

    // Listen for popstate (back/forward navigation)
    const handlePopState = () => {
      tracker.track('page_view', {
        page_title: document.title,
        page_location: window.location.href,
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [tracker])
}
