import { NextResponse } from 'next/server';
import { PAID_FEATURES } from '@/lib/types';
import { getCoinBySlug, markPaidExpedited, markPaidTrending } from '@/lib/data';
import {
  getAvailableProviders,
  createNowPayment,
  createStripeCheckout,
  type PaymentProvider,
} from '@/lib/payments';

export async function GET() {
  const providers = getAvailableProviders();
  return NextResponse.json({
    providers: providers.filter((p) => p !== 'demo'),
    acceptsCrypto: providers.includes('nowpayments'),
    acceptsCard: providers.includes('stripe'),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coinSlug, feature, provider: requestedProvider, payCurrency } = body;

    if (!coinSlug || !feature) {
      return NextResponse.json({ error: 'coinSlug and feature are required' }, { status: 400 });
    }

    const coin = await getCoinBySlug(coinSlug);
    if (!coin) {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }

    if (!(feature in PAID_FEATURES)) {
      return NextResponse.json({ error: 'Invalid feature' }, { status: 400 });
    }

    const available = getAvailableProviders();
    const provider: PaymentProvider = requestedProvider && available.includes(requestedProvider)
      ? requestedProvider
      : available[0];

    // NOWPayments (crypto)
    if (provider === 'nowpayments') {
      const result = await createNowPayment(feature, coinSlug, 'usd', payCurrency || 'sol');
      return NextResponse.json(result);
    }

    // Stripe (card)
    if (provider === 'stripe') {
      const result = await createStripeCheckout(feature, coinSlug);
      return NextResponse.json(result);
    }

    // Demo mode — apply features directly
    if (feature === 'expedited' || feature === 'bundle') {
      await markPaidExpedited(coinSlug);
    }
    if (feature === 'trending' || feature === 'bundle') {
      await markPaidTrending(coinSlug);
    }

    return NextResponse.json({
      provider: 'demo',
      message: 'Features applied in demo mode (no payment provider configured)',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
