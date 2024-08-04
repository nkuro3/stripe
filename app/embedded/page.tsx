'use client';

import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useCallback } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function Checkout() {
  const priceId: string = 'price_1P7sTuBZECcqCgM5rnGAXOYJ'; // 開発モードのサンプル

  const count = 1; // 購入個数 これは状態管理のライブラリを使うと扱いやすい

  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session
    return fetch('/api/checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        priceId,
        quantity: count,
        isShipping: count < 4
      })
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, [priceId, count]);

  const options = { fetchClientSecret };

  return (
    <section className="px-40 text-gray-600">
      <div className="my-16">
        <h4 className="text-center">決済</h4>
      </div>
      <div id="checkout" className="mb-20">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </section>
  );
}
