import type { AutoTrackConfig } from './types'

type TrackFn = (eventName: string, params?: Record<string, unknown>) => void

/**
 * Sets up auto-tracking for common user interactions.
 * Returns a cleanup function for React/SPA unmount.
 */
export function setupAutoTracking(config: AutoTrackConfig, track: TrackFn): () => void {
  const cleanups: Array<() => void> = []

  if (typeof window === 'undefined') return () => {}

  if (config.pageViews) {
    cleanups.push(trackPageViews(track))
  }

  if (config.outboundClicks) {
    cleanups.push(trackOutboundClicks(track))
  }

  if (config.scrollDepth) {
    cleanups.push(trackScrollDepth(track))
  }

  if (config.formSubmissions) {
    cleanups.push(trackFormSubmissions(track))
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup()
    }
  }
}

function trackPageViews(track: TrackFn): () => void {
  // Fire initial page view
  track('page_view', getPageViewParams())

  // Patch History API for SPA navigation
  const originalPushState = history.pushState.bind(history)
  const originalReplaceState = history.replaceState.bind(history)

  history.pushState = function (...args: Parameters<typeof history.pushState>) {
    originalPushState(...args)
    track('page_view', getPageViewParams())
  }

  history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
    originalReplaceState(...args)
    track('page_view', getPageViewParams())
  }

  const onPopState = () => {
    track('page_view', getPageViewParams())
  }
  window.addEventListener('popstate', onPopState)

  return () => {
    history.pushState = originalPushState
    history.replaceState = originalReplaceState
    window.removeEventListener('popstate', onPopState)
  }
}

function getPageViewParams(): Record<string, unknown> {
  return {
    page_title: document.title,
    page_location: location.href,
    page_referrer: document.referrer,
  }
}

function trackOutboundClicks(track: TrackFn): () => void {
  const handler = (e: MouseEvent) => {
    const anchor = (e.target as Element)?.closest?.('a')
    if (!anchor) return

    const href = anchor.href
    if (!href) return

    try {
      const url = new URL(href)
      if (url.hostname !== location.hostname) {
        track('outbound_click', {
          link_url: href,
          link_text: anchor.textContent?.trim().slice(0, 100) ?? '',
        })
      }
    } catch {
      // Invalid URL, skip
    }
  }

  document.addEventListener('click', handler, true)
  return () => document.removeEventListener('click', handler, true)
}

function trackScrollDepth(track: TrackFn): () => void {
  const thresholds = [25, 50, 75, 100]
  const fired = new Set<number>()

  const handler = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    if (scrollHeight <= 0) return

    const percent = Math.round((window.scrollY / scrollHeight) * 100)

    for (const threshold of thresholds) {
      if (percent >= threshold && !fired.has(threshold)) {
        fired.add(threshold)
        track('scroll_depth', { percent: threshold })
      }
    }
  }

  window.addEventListener('scroll', handler, { passive: true })
  return () => window.removeEventListener('scroll', handler)
}

function trackFormSubmissions(track: TrackFn): () => void {
  const handler = (e: SubmitEvent) => {
    const form = e.target as HTMLFormElement
    track('form_submit', {
      form_id: form.id || undefined,
      form_name: form.getAttribute('name') || undefined,
    })
  }

  document.addEventListener('submit', handler, true)
  return () => document.removeEventListener('submit', handler, true)
}
