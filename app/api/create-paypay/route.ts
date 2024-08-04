/* eslint-disable @typescript-eslint/no-explicit-any */
import PAYPAY from '@paypayopa/paypayopa-sdk-node';
import { NextResponse } from 'next/server';
import { v7 } from 'uuid';

export async function POST() {
  console.log('call');

  PAYPAY.Configure({
    clientId: process.env.PAYPAY_API_KEY as string,
    clientSecret: process.env.PAYPAY_SECRET as string,
    merchantId: process.env.PAYPAY_MERCHANT_ID as string,
    productionMode: false
  });

  const paymentId = v7();
  const payload = {
    merchantPaymentId: paymentId,
    amount: { amount: 3000, currency: 'JPY' },
    codeType: 'ORDER_QR',
    orderItems: null,
    redirectUrl: `http://localhost:3000/`,
    redirectType: 'WEB_LINK'
  };

  try {
    const response: any = await PAYPAY.QRCodeCreate(payload);
    return NextResponse.json({ data: response.BODY.data }, { status: response.STATUS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
