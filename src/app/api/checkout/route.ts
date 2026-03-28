import { NextResponse } from 'next/server';
import { PAID_FEATURES } from '@/lib/types';
import { getCoinBySlug, markPaidExpedited, markPaidTrending } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coinSlug, feature } = body;

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

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      // No Stripe configured — apply features directly (demo mode)
      if (feature === 'expedited' || feature === 'bundle') {
        await markPaidExpedited(coinSlug);
      }
      if (feature === 'trending' || feature === 'bundle') {
        await markPaidTrending(coinSlug);
      }

      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Features applied in demo mode (no Stripe configured)',
      });
    }

    // With Stripe configured, create a checkout session
    // This is a placeholder — integrate real Stripe SDK here
    const feat = PAID_FEATURES[feature as keyof typeof PAID_FEATURES];
    return NextResponse.json({
      checkoutUrl: null,
      message: `Stripe checkout for ${feat.label} ($${feat.price}) — configure STRIPE_SECRET_KEY to enable payments`,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
