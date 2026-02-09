import type { Preset } from './types'

export const ecommerce: Preset = {
  name: 'ecommerce',
  description: 'Optimized for e-commerce funnels: view_item through purchase',
  autoTrack: {
    pageViews: true,
    outboundClicks: false,
    scrollDepth: false,
    formSubmissions: false,
  },
  dedupeRules: [
    { event_name: 'purchase', window_ms: 5000, key: (p) => String(p.transaction_id ?? '') },
    { event_name: 'add_to_cart', window_ms: 2000, key: (p) => String(p.item_id ?? '') },
    { event_name: 'begin_checkout', window_ms: 3000 },
  ],
  expectedEvents: [
    'page_view',
    'view_item',
    'view_item_list',
    'add_to_cart',
    'remove_from_cart',
    'view_cart',
    'begin_checkout',
    'add_shipping_info',
    'add_payment_info',
    'purchase',
    'refund',
  ],
}

export const saas: Preset = {
  name: 'saas',
  description: 'Optimized for SaaS metrics: sign-up through subscription',
  autoTrack: {
    pageViews: true,
    outboundClicks: false,
    scrollDepth: false,
    formSubmissions: false,
  },
  dedupeRules: [
    { event_name: 'sign_up', window_ms: 10000 },
    { event_name: 'login', window_ms: 5000 },
    { event_name: 'subscribe', window_ms: 10000 },
  ],
  expectedEvents: [
    'page_view',
    'sign_up',
    'login',
    'trial_started',
    'feature_used',
    'subscribe',
    'upgrade',
    'downgrade',
    'churn',
  ],
}

export const leadgen: Preset = {
  name: 'leadgen',
  description: 'Optimized for lead generation: form submissions and engagement',
  autoTrack: {
    pageViews: true,
    outboundClicks: true,
    scrollDepth: true,
    formSubmissions: true,
  },
  dedupeRules: [
    { event_name: 'generate_lead', window_ms: 10000 },
    { event_name: 'form_submit', window_ms: 5000, key: (p) => String(p.form_id ?? '') },
  ],
  expectedEvents: [
    'page_view',
    'generate_lead',
    'form_submit',
    'outbound_click',
    'scroll_depth',
    'contact_request',
    'download',
    'book_demo',
  ],
}

export const presets = { ecommerce, saas, leadgen } as const
