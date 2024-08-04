'use client';

import { Elements, PaymentElement, useStripe, useElements, AddressElement } from '@stripe/react-stripe-js';
import { Appearance, loadStripe, StripePaymentElementOptions } from '@stripe/stripe-js';
import { useState, useEffect } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const Home = () => {
  const [clientSecret, setClientSecret] = useState('');
  console.log(clientSecret);

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('API Response:', data);
        setClientSecret(data.clientSecret);
      });
  }, []);

  const appearance: Appearance = {
    theme: 'stripe'
  };

  // StripeElementsOptions externalPaymentMethodTypesが型にないのでlintエラーが出る
  const options = {
    clientSecret,
    externalPaymentMethodTypes: ['external_paypay'],
    appearance
  };

  return (
    <>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <Form />
        </Elements>
      )}
    </>
  );
};

const Form = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    if (paymentMethod === PaymentMethod.PAYPAY) {
      const response = await fetch('/api/create-paypay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: null
      });
      const { data } = await response.json();
      console.log(data.url);
      window.location.href = data.url;
    } else {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: 'http://localhost:3000'
        }
      });

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message);
      } else {
        setMessage('An unexpected error occurred.');
      }
    }

    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
    defaultValues: {
      billingDetails: {
        address: {
          country: 'JP'
        }
      }
    },
    paymentMethodOrder: [PaymentMethod.CARD, PaymentMethod.PAYPAY]
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement
        id="payment-element"
        options={paymentElementOptions}
        onChange={(e) => {
          console.log(e);
          setPaymentMethod(e?.value?.type);
        }}
      />
      {paymentMethod === PaymentMethod.CARD && (
        <AddressElement
          options={{
            mode: 'billing',
            allowedCountries: ['JP'] // 日本のみに制限する場合
          }}
        />
      )}
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">{isLoading ? <div className="spinner" id="spinner"></div> : 'Pay now'}</span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
};

export const PaymentMethod = {
  CARD: 'card',
  PAYPAY: 'external_paypay'
};

export type PaymentMethod = typeof PaymentMethod;

export default Home;
