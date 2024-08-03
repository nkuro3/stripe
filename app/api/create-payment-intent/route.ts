/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const apiKey = process.env.STRIPE_API_KEY as string;
const stripe = new Stripe(apiKey, { apiVersion: '2024-04-10' });

export async function POST() {
  if (!apiKey) {
    return NextResponse.json({
      status: 403,
      msg: 'Failed to load Stripe API key'
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'jpy',
      // payment_method_types: ['card']
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true
      }
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Failed to create PaymentIntent');
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
