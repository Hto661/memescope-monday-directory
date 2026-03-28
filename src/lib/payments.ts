import { PAID_FEATURES } from './types';

export type PaymentProvider = 'nowpayments' | 'stripe' | 'demo';

export interface PaymentResult {
  provider: PaymentProvider;
  checkoutUrl?: string;
  invoiceId?: string;
  message?: string;
}

// ── Detect available providers ──

export function getAvailableProviders(): PaymentProvider[] {
  const providers: PaymentProvider[] = [];
  if (process.env.NOWPAYMENTS_API_KEY) providers.push('nowpayments');
  if (process.env.STRIPE_SECRET_KEY) providers.push('stripe');
  providers.push('demo'); // always available as fallback
  return providers;
}

export function getPreferredProvider(): PaymentProvider {
  if (process.env.NOWPAYMENTS_API_KEY) return 'nowpayments';
  if (process.env.STRIPE_SECRET_KEY) return 'stripe';
  return 'demo';
}

// ── NOWPayments ──

const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1';

export async function createNowPayment(
  featureKey: string,
  coinSlug: string,
  priceCurrency: string = 'usd',
  payCurrency: string = 'sol',
): Promise<PaymentResult> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error('NOWPayments not configured');

  const feat = PAID_FEATURES[featureKey as keyof typeof PAID_FEATURES];
  if (!feat) throw new Error('Invalid feature');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memescope.monday.directory';

  // Create invoice via NOWPayments API
  const res = await fetch(`${NOWPAYMENTS_API}/invoice`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_amount: feat.price,
      price_currency: priceCurrency,
      pay_currency: payCurrency,
      order_id: `${coinSlug}__${featureKey}__${Date.now()}`,
      order_description: `${feat.label} for ${coinSlug} on Memescope Monday`,
      ipn_callback_url: `${baseUrl}/api/webhooks/nowpayments`,
      success_url: `${baseUrl}/coins/${coinSlug}?payment=success`,
      cancel_url: `${baseUrl}/coins/${coinSlug}?payment=cancelled`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`NOWPayments error: ${body}`);
  }

  const data = await res.json();

  return {
    provider: 'nowpayments',
    checkoutUrl: data.invoice_url,
    invoiceId: data.id?.toString(),
  };
}

export async function verifyNowPaymentIPN(body: any, ipnSecret: string): Promise<boolean> {
  // NOWPayments sends HMAC-SHA512 signature in x-nowpayments-sig header
  // The body is sorted by keys, then HMAC'd with the IPN secret
  const crypto = await import('crypto');

  const sorted = Object.keys(body)
    .sort()
    .reduce((acc: any, key: string) => {
      acc[key] = body[key];
      return acc;
    }, {});

  const hmac = crypto.createHmac('sha512', ipnSecret);
  hmac.update(JSON.stringify(sorted));
  const signature = hmac.digest('hex');

  return signature === body.verify_hash;
}

// ── Stripe ──

export async function createStripeCheckout(
  featureKey: string,
  coinSlug: string,
): Promise<PaymentResult> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) throw new Error('Stripe not configured');

  const feat = PAID_FEATURES[featureKey as keyof typeof PAID_FEATURES];
  if (!feat) throw new Error('Invalid feature');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memescope.monday.directory';

  // Create Stripe Checkout Session via API (no SDK needed)
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'mode': 'payment',
      'success_url': `${baseUrl}/coins/${coinSlug}?payment=success`,
      'cancel_url': `${baseUrl}/coins/${coinSlug}?payment=cancelled`,
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': `${feat.label} — Memescope Monday`,
      'line_items[0][price_data][product_data][description]': feat.description,
      'line_items[0][price_data][unit_amount]': (feat.price * 100).toString(),
      'line_items[0][quantity]': '1',
      'metadata[coin_slug]': coinSlug,
      'metadata[feature]': featureKey,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Stripe error: ${body}`);
  }

  const session = await res.json();

  return {
    provider: 'stripe',
    checkoutUrl: session.url,
    invoiceId: session.id,
  };
}

// ── Stripe webhook signature verification ──

export async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const crypto = await import('crypto');

  const parts = signature.split(',');
  const timestamp = parts.find((p: string) => p.startsWith('t='))?.slice(2);
  const sig = parts.find((p: string) => p.startsWith('v1='))?.slice(3);

  if (!timestamp || !sig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
