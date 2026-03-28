import { NextResponse } from 'next/server';
import { markPaidExpedited, markPaidTrending } from '@/lib/data';
import crypto from 'crypto';

export async function POST(request: Request) {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret) {
    return NextResponse.json({ error: 'IPN not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const receivedSig = request.headers.get('x-nowpayments-sig');

    // Verify HMAC signature
    if (receivedSig) {
      const { verify_hash, ...dataToSign } = body;
      const sorted = Object.keys(dataToSign)
        .sort()
        .reduce((acc: Record<string, unknown>, key: string) => {
          acc[key] = dataToSign[key];
          return acc;
        }, {});

      const hmac = crypto.createHmac('sha512', ipnSecret);
      hmac.update(JSON.stringify(sorted));
      const expectedSig = hmac.digest('hex');

      if (receivedSig !== expectedSig) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Check payment status
    const { payment_status, order_id } = body;

    if (payment_status === 'finished' || payment_status === 'confirmed') {
      // order_id format: coinSlug__featureKey__timestamp
      const parts = (order_id as string).split('__');
      if (parts.length >= 2) {
        const [coinSlug, featureKey] = parts;

        if (featureKey === 'expedited' || featureKey === 'bundle') {
          await markPaidExpedited(coinSlug);
        }
        if (featureKey === 'trending' || featureKey === 'bundle') {
          await markPaidTrending(coinSlug);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
