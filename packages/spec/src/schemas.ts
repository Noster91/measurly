export interface EventParamSchema {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description?: string
}

export interface EventSchema {
  name: string
  category: 'ecommerce' | 'engagement' | 'lifecycle' | 'custom'
  description: string
  params: EventParamSchema[]
}

export const eventSchemas: EventSchema[] = [
  // Ecommerce events
  {
    name: 'page_view',
    category: 'engagement',
    description: 'Fired when a page is viewed',
    params: [
      { name: 'page_title', type: 'string', required: false, description: 'Page title' },
      { name: 'page_location', type: 'string', required: false, description: 'Page URL' },
      { name: 'page_referrer', type: 'string', required: false, description: 'Referrer URL' },
    ],
  },
  {
    name: 'view_item',
    category: 'ecommerce',
    description: 'Fired when a user views an item',
    params: [
      { name: 'item_id', type: 'string', required: true, description: 'Item identifier' },
      { name: 'item_name', type: 'string', required: false, description: 'Item name' },
      { name: 'price', type: 'number', required: false, description: 'Item price' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code' },
    ],
  },
  {
    name: 'view_item_list',
    category: 'ecommerce',
    description: 'Fired when a user views a list of items',
    params: [
      { name: 'item_list_id', type: 'string', required: false, description: 'List identifier' },
      { name: 'item_list_name', type: 'string', required: false, description: 'List name' },
      { name: 'items', type: 'array', required: true, description: 'Array of items' },
    ],
  },
  {
    name: 'add_to_cart',
    category: 'ecommerce',
    description: 'Fired when a user adds an item to cart',
    params: [
      { name: 'item_id', type: 'string', required: true, description: 'Item identifier' },
      { name: 'item_name', type: 'string', required: false, description: 'Item name' },
      { name: 'price', type: 'number', required: false, description: 'Item price' },
      { name: 'quantity', type: 'number', required: false, description: 'Quantity added' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code' },
    ],
  },
  {
    name: 'remove_from_cart',
    category: 'ecommerce',
    description: 'Fired when a user removes an item from cart',
    params: [
      { name: 'item_id', type: 'string', required: true, description: 'Item identifier' },
      { name: 'item_name', type: 'string', required: false, description: 'Item name' },
      { name: 'quantity', type: 'number', required: false, description: 'Quantity removed' },
    ],
  },
  {
    name: 'view_cart',
    category: 'ecommerce',
    description: 'Fired when a user views the cart',
    params: [
      { name: 'items', type: 'array', required: false, description: 'Cart items' },
      { name: 'value', type: 'number', required: false, description: 'Total cart value' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code' },
    ],
  },
  {
    name: 'begin_checkout',
    category: 'ecommerce',
    description: 'Fired when checkout begins',
    params: [
      { name: 'value', type: 'number', required: false, description: 'Checkout value' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code' },
      { name: 'items', type: 'array', required: false, description: 'Checkout items' },
    ],
  },
  {
    name: 'add_shipping_info',
    category: 'ecommerce',
    description: 'Fired when shipping info is added',
    params: [
      { name: 'shipping_tier', type: 'string', required: false, description: 'Shipping method' },
      { name: 'value', type: 'number', required: false, description: 'Order value' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code' },
    ],
  },
  {
    name: 'add_payment_info',
    category: 'ecommerce',
    description: 'Fired when payment info is added',
    params: [
      { name: 'payment_type', type: 'string', required: false, description: 'Payment method' },
      { name: 'value', type: 'number', required: false, description: 'Order value' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code' },
    ],
  },
  {
    name: 'purchase',
    category: 'ecommerce',
    description: 'Fired when a purchase is completed',
    params: [
      { name: 'transaction_id', type: 'string', required: true, description: 'Transaction ID' },
      { name: 'value', type: 'number', required: true, description: 'Purchase value' },
      { name: 'currency', type: 'string', required: true, description: 'Currency code' },
      { name: 'items', type: 'array', required: false, description: 'Purchased items' },
      { name: 'tax', type: 'number', required: false, description: 'Tax amount' },
      { name: 'shipping', type: 'number', required: false, description: 'Shipping cost' },
    ],
  },
  {
    name: 'refund',
    category: 'ecommerce',
    description: 'Fired when a refund is issued',
    params: [
      { name: 'transaction_id', type: 'string', required: true, description: 'Transaction ID' },
      { name: 'value', type: 'number', required: false, description: 'Refund value' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code' },
    ],
  },
  // Lifecycle events
  {
    name: 'sign_up',
    category: 'lifecycle',
    description: 'Fired when a user signs up',
    params: [
      { name: 'method', type: 'string', required: false, description: 'Sign-up method' },
    ],
  },
  {
    name: 'login',
    category: 'lifecycle',
    description: 'Fired when a user logs in',
    params: [
      { name: 'method', type: 'string', required: false, description: 'Login method' },
    ],
  },
  {
    name: 'trial_started',
    category: 'lifecycle',
    description: 'Fired when a trial is started',
    params: [
      { name: 'plan', type: 'string', required: false, description: 'Trial plan name' },
    ],
  },
  {
    name: 'subscribe',
    category: 'lifecycle',
    description: 'Fired when a user subscribes',
    params: [
      { name: 'plan', type: 'string', required: true, description: 'Subscription plan' },
      { name: 'value', type: 'number', required: false, description: 'Subscription value' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code' },
    ],
  },
  // Engagement events
  {
    name: 'feature_used',
    category: 'engagement',
    description: 'Fired when a feature is used',
    params: [
      { name: 'feature_name', type: 'string', required: true, description: 'Feature name' },
    ],
  },
  {
    name: 'generate_lead',
    category: 'engagement',
    description: 'Fired when a lead is generated',
    params: [
      { name: 'source', type: 'string', required: false, description: 'Lead source' },
      { name: 'value', type: 'number', required: false, description: 'Estimated lead value' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code' },
    ],
  },
  {
    name: 'form_submit',
    category: 'engagement',
    description: 'Fired when a form is submitted (no field values for PII safety)',
    params: [
      { name: 'form_id', type: 'string', required: false, description: 'Form identifier' },
      { name: 'form_name', type: 'string', required: false, description: 'Form name' },
    ],
  },
  {
    name: 'outbound_click',
    category: 'engagement',
    description: 'Fired when an outbound link is clicked',
    params: [
      { name: 'link_url', type: 'string', required: true, description: 'Destination URL' },
      { name: 'link_text', type: 'string', required: false, description: 'Link text' },
    ],
  },
  {
    name: 'scroll_depth',
    category: 'engagement',
    description: 'Fired when scroll milestones are reached',
    params: [
      { name: 'percent', type: 'number', required: true, description: 'Scroll percentage (25/50/75/100)' },
    ],
  },
]
