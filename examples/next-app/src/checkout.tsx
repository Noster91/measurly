'use client'

import { useTrack } from '@open-measure/next'

export function CheckoutPage() {
  const track = useTrack()

  const handleAddToCart = (itemId: string, price: number) => {
    track('add_to_cart', {
      item_id: itemId,
      price,
      currency: 'USD',
      quantity: 1,
    })
  }

  const handlePurchase = (transactionId: string, total: number) => {
    track('purchase', {
      transaction_id: transactionId,
      value: total,
      currency: 'USD',
    })
  }

  return (
    <div>
      <h1>Checkout</h1>
      <button onClick={() => handleAddToCart('sku-001', 49.99)}>
        Add Widget to Cart
      </button>
      <button onClick={() => handlePurchase('tx-' + Date.now(), 49.99)}>
        Complete Purchase
      </button>
    </div>
  )
}
