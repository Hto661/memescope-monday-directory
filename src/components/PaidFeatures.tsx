'use client';

import { useState, useEffect } from 'react';
import { PAID_FEATURES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PaidFeaturesProps {
  coinSlug?: string;
  onSelect?: (feature: string | null) => void;
  mode: 'submit' | 'standalone';
}

type ProviderOption = 'nowpayments' | 'stripe';

const CRYPTO_OPTIONS = [
  { id: 'sol', label: 'SOL', icon: '◎' },
  { id: 'usdcsol', label: 'USDC (SOL)', icon: '💲' },
  { id: 'btc', label: 'BTC', icon: '₿' },
  { id: 'eth', label: 'ETH', icon: 'Ξ' },
  { id: 'bnb', label: 'BNB', icon: '🟡' },
  { id: 'usdt', label: 'USDT', icon: '💵' },
];

export function PaidFeatures({ coinSlug, onSelect, mode }: PaidFeaturesProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [payMethod, setPayMethod] = useState<ProviderOption | null>(null);
  const [payCurrency, setPayCurrency] = useState('sol');
  const [availableProviders, setAvailableProviders] = useState<ProviderOption[]>([]);

  // Fetch available payment providers
  useEffect(() => {
    if (mode !== 'standalone') return;
    fetch('/api/checkout')
      .then((res) => res.json())
      .then((data) => {
        const providers: ProviderOption[] = [];
        if (data.acceptsCrypto) providers.push('nowpayments');
        if (data.acceptsCard) providers.push('stripe');
        setAvailableProviders(providers);
        if (providers.length > 0) setPayMethod(providers[0]);
      })
      .catch(() => {});
  }, [mode]);

  const handleSelect = (key: string) => {
    const newVal = selected === key ? null : key;
    setSelected(newVal);
    onSelect?.(newVal);
  };

  const handleCheckout = async () => {
    if (!selected || !coinSlug) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coinSlug,
          feature: selected,
          provider: payMethod ?? 'demo',
          payCurrency: payMethod === 'nowpayments' ? payCurrency : undefined,
        }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.provider === 'demo') {
        alert('Features applied! (Demo mode — no payment provider configured)');
        window.location.reload();
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const features = Object.entries(PAID_FEATURES) as [string, typeof PAID_FEATURES[keyof typeof PAID_FEATURES]][];

  return (
    <div className="space-y-3">
      <div className="card p-5 bg-gradient-to-br from-navy-50 to-indigo-50 border-navy-200">
        <h3 className="font-bold text-navy-900 text-sm mb-1">Boost Your Listing</h3>
        <p className="text-xs text-navy-500 mb-4">
          Get more visibility for your coin. Pay with crypto or card.
        </p>

        {/* Feature selection */}
        <div className="space-y-2">
          {features.map(([key, feat]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                selected === key
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-navy-200 bg-white hover:border-navy-300'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  selected === key ? 'border-brand-500 bg-brand-500' : 'border-navy-300'
                )}
              >
                {selected === key && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-900">{feat.label}</span>
                  <span className="text-sm font-bold text-navy-900">${feat.price}</span>
                </div>
                <p className="text-xs text-navy-500 mt-0.5">{feat.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Payment method (standalone mode only, when a feature is selected) */}
        {mode === 'standalone' && selected && (
          <div className="mt-4 space-y-3">
            {/* Provider tabs */}
            {availableProviders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-navy-600 mb-2">Pay with</p>
                <div className="flex gap-2">
                  {availableProviders.includes('nowpayments') && (
                    <button
                      type="button"
                      onClick={() => setPayMethod('nowpayments')}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all',
                        payMethod === 'nowpayments'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-navy-200 text-navy-600 hover:border-navy-300'
                      )}
                    >
                      <span>◎</span> Crypto
                    </button>
                  )}
                  {availableProviders.includes('stripe') && (
                    <button
                      type="button"
                      onClick={() => setPayMethod('stripe')}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all',
                        payMethod === 'stripe'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-navy-200 text-navy-600 hover:border-navy-300'
                      )}
                    >
                      <span>💳</span> Card
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Crypto currency selector */}
            {payMethod === 'nowpayments' && (
              <div>
                <p className="text-xs font-semibold text-navy-600 mb-2">Pay with</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {CRYPTO_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPayCurrency(opt.id)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-all',
                        payCurrency === opt.id
                          ? 'border-purple-400 bg-purple-50 text-purple-700'
                          : 'border-navy-200 text-navy-600 hover:border-navy-300'
                      )}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={processing}
              className={cn(
                'w-full py-3 rounded-lg font-semibold text-sm transition-all',
                payMethod === 'nowpayments'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : payMethod === 'stripe'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'btn-primary'
              )}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : payMethod === 'nowpayments' ? (
                `Pay with ${CRYPTO_OPTIONS.find(c => c.id === payCurrency)?.label ?? 'Crypto'} — $${PAID_FEATURES[selected as keyof typeof PAID_FEATURES].price}`
              ) : payMethod === 'stripe' ? (
                `Pay with Card — $${PAID_FEATURES[selected as keyof typeof PAID_FEATURES].price}`
              ) : (
                `Pay $${PAID_FEATURES[selected as keyof typeof PAID_FEATURES].price}`
              )}
            </button>

            {payMethod === 'nowpayments' && (
              <p className="text-xs text-navy-400 text-center">
                200+ cryptocurrencies accepted via NOWPayments. No KYC required.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
