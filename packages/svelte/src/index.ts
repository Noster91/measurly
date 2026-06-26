// Re-export everything from @open-measure/web
export * from '@open-measure/web'

// Svelte-specific exports
export { setTracker, getTracker, getTrackerSafe } from './context'
export { trackPageView, PAGE_VIEW_EVENT } from './page-views'
export type { PageViewNavigation } from './page-views'
