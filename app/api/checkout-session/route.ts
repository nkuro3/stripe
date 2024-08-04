import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // Initiate Stripe
    const apiKey = process.env.STRIPE_API_KEY as string;
    if (!apiKey) {
      return NextResponse.json({
        status: 403,
        msg: 'Failed to load Stripe API key'
      });
    }
    const stripe = new Stripe(apiKey, { apiVersion: '2024-04-10' });

    // Check Parameters
    const body = await req.json();
    if (!body.priceId || !body.quantity) {
      return NextResponse.json({
        status: 403,
        msg: 'Invalid Parameters'
      });
    }
    const { priceId, quantity, isShipping } = body;

    // Create Checkout sessions
    const origin = req.headers.get('origin') as string;

    const params: Stripe.Checkout.SessionCreateParams = {
      locale: 'ja',
      ui_mode: 'embedded', // 'embedded' | 'hosted'
      mode: 'payment', // 'payment' | 'setup' | 'subscription'
      line_items: [
        {
          price: priceId,
          quantity
        }
      ],
      shipping_options: [],
      shipping_address_collection: { allowed_countries: ['JP'] },
      // 決済完了画面などにリダイレクトさせる
      // 完了画面がちゃんとリダイレクトで遷移したか確認するために、リダイレクト先にセッションIDを渡すなどする
      return_url: `${origin}?session_id={CHECKOUT_SESSION_ID}`
    };

    if (isShipping) {
      params.shipping_options?.push({
        shipping_rate: process.env.STRIPE_SHIPPPING_RATE
      });
    }

    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ id: session.id, clientSecret: session.client_secret });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'something went wrong', ok: false }, { status: 500 });
  }
}
