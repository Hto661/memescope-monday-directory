'use client';

import { useState } from 'react';
import { PAID_FEATURES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PaidFeaturesProps {
  coinSlug?: string;
  onSelect?: (feature: string | null) => void;
  mode: 'submit' | 'standalone';
}

export function PaidFeatures({ coinSlug, onSelect, mode }: PaidFeaturesProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

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
        body: JSON.stringify({ coinSlug, feature: selected }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          alert('Payment setup required. Contact admin to configure Stripe.');
        }
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
          Get more visibility for your coin. Select an option below.
        </p>

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

        {mode === 'standalone' && selected && (
          <button
            onClick={handleCheckout}
            disabled={processing}
            className="btn-primary w-full mt-4 py-3"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Pay $${PAID_FEATURES[selected as keyof typeof PAID_FEATURES].price}`
            )}
          </button>
        )}
      </div>
    </div>
  );
}
