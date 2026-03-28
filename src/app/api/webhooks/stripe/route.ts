import { NextResponse } from 'next/server';
import { markPaidExpedited, markPaidTrending } from '@/lib/data';
import crypto from 'crypto';

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify Stripe signature
    const parts = signature.split(',');
    const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
    const sig = parts.find((p) => p.startsWith('v1='))?.slice(3);

    if (!timestamp || !sig) {
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 401 });
    }

    const signedPayload = `${timestamp}.${payload}`;
    const expected = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const coinSlug = session.metadata?.coin_slug;
      const featureKey = session.metadata?.feature;

      if (coinSlug && featureKey) {
        if (featureKey === 'expedited' || featureKey === 'bundle') {
          await markPaidExpedited(coinSlug);
        }
        if (featureKey === 'trending' || featureKey === 'bundle') {
          await markPaidTrending(coinSlug);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
