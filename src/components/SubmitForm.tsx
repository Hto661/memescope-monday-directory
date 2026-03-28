'use client';

import { useState, useRef } from 'react';
import { CHAINS, CATEGORIES, PAID_FEATURES } from '@/lib/types';
import type { Chain, CoinType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AutoFillAddress } from './AutoFillAddress';

export function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ slug: string } | null>(null);
  const [error, setError] = useState('');
  const [coinType, setCoinType] = useState<CoinType>('existing');
  const [selectedPaid, setSelectedPaid] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAutoFill = (data: { name: string; ticker: string; chain: string; marketCap: string; dexScreenerUrl?: string }) => {
    if (!formRef.current) return;
    const form = formRef.current;
    const nameInput = form.querySelector<HTMLInputElement>('#name');
    const tickerInput = form.querySelector<HTMLInputElement>('#ticker');
    const chainSelect = form.querySelector<HTMLSelectElement>('#chain');
    const dexInput = form.querySelector<HTMLInputElement>('#dexScreenerUrl');

    if (nameInput && !nameInput.value) nameInput.value = data.name;
    if (tickerInput && !tickerInput.value) tickerInput.value = data.ticker;
    if (chainSelect && !chainSelect.value) {
      const chainMap: Record<string, string> = { solana: 'solana', base: 'base', bsc: 'bnb', bnb: 'bnb' };
      chainSelect.value = chainMap[data.chain] ?? '';
    }
    if (dexInput && !dexInput.value && data.dexScreenerUrl) dexInput.value = data.dexScreenerUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: data.get('name') as string,
      ticker: data.get('ticker') as string,
      chain: data.get('chain') as Chain,
      contractAddress: data.get('contractAddress') as string,
      description: data.get('description') as string,
      imageUrl: (data.get('imageUrl') as string) || undefined,
      websiteUrl: (data.get('websiteUrl') as string) || undefined,
      twitterUrl: (data.get('twitterUrl') as string) || undefined,
      telegramUrl: (data.get('telegramUrl') as string) || undefined,
      pumpFunUrl: (data.get('pumpFunUrl') as string) || undefined,
      dexScreenerUrl: (data.get('dexScreenerUrl') as string) || undefined,
      category: data.get('category') as string,
      submitterEmail: data.get('submitterEmail') as string,
      coinType,
      launchDate: coinType === 'upcoming' ? (data.get('launchDate') as string) || undefined : undefined,
    };

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Submission failed');
      }

      const result = await res.json();
      setSuccess({ slug: result.coin.slug });

      // If paid feature selected, trigger checkout
      if (selectedPaid && result.coin.slug) {
        try {
          const checkoutRes = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coinSlug: result.coin.slug, feature: selectedPaid }),
          });
          if (checkoutRes.ok) {
            const checkoutData = await checkoutRes.json();
            if (checkoutData.checkoutUrl) {
              window.location.href = checkoutData.checkoutUrl;
              return;
            }
          }
        } catch {
          // payment failed but submission succeeded
        }
      }

      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card p-10 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-navy-900 mb-3">Coin Submitted!</h2>
        <p className="text-navy-500 mb-6">
          Your submission is being reviewed. Once approved, it will appear in the directory
          {selectedPaid ? ' (expedited review applied)' : ' for the next Memescope Monday'}.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => { setSuccess(null); setSelectedPaid(null); }} className="btn-outline">
            Submit Another
          </button>
          <a href={`/coins/${success.slug}`} className="btn-primary">
            View Listing
          </a>
          <a href="/coins" className="btn-outline">
            Browse Coins
          </a>
        </div>
      </div>
    );
  }

  const paidFeatures = Object.entries(PAID_FEATURES) as [string, typeof PAID_FEATURES[keyof typeof PAID_FEATURES]][];
  const selectedPrice = selectedPaid ? PAID_FEATURES[selectedPaid as keyof typeof PAID_FEATURES].price : 0;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Auto-fill from contract address */}
      {coinType === 'existing' && (
        <AutoFillAddress onAutoFill={handleAutoFill} />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Coin Type Toggle */}
      <div>
        <label className="block text-sm font-semibold text-navy-900 mb-3">
          What are you submitting? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCoinType('existing')}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              coinType === 'existing'
                ? 'border-brand-500 bg-brand-50'
                : 'border-navy-200 hover:border-navy-300'
            )}
          >
            <div className="text-lg mb-1">📊</div>
            <div className="font-semibold text-navy-900 text-sm">Existing Coin</div>
            <div className="text-xs text-navy-500 mt-0.5">Already trading on-chain</div>
          </button>
          <button
            type="button"
            onClick={() => setCoinType('upcoming')}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              coinType === 'upcoming'
                ? 'border-amber-500 bg-amber-50'
                : 'border-navy-200 hover:border-navy-300'
            )}
          >
            <div className="text-lg mb-1">🚀</div>
            <div className="font-semibold text-navy-900 text-sm">Upcoming Launch</div>
            <div className="text-xs text-navy-500 mt-0.5">Launching soon on Memescope Monday</div>
          </button>
        </div>
      </div>

      {/* Coin Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-navy-900 mb-2">
          Coin Name <span className="text-red-500">*</span>
        </label>
        <input type="text" id="name" name="name" required placeholder="e.g., GAKE" className="input-field" />
      </div>

      {/* Ticker */}
      <div>
        <label htmlFor="ticker" className="block text-sm font-semibold text-navy-900 mb-2">
          Ticker <span className="text-red-500">*</span>
        </label>
        <input type="text" id="ticker" name="ticker" required placeholder="e.g., $GAKE" className="input-field" />
      </div>

      {/* Chain */}
      <div>
        <label htmlFor="chain" className="block text-sm font-semibold text-navy-900 mb-2">
          Chain <span className="text-red-500">*</span>
        </label>
        <select id="chain" name="chain" required className="select-field">
          <option value="">Select a chain</option>
          {CHAINS.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.icon} {chain.name}
            </option>
          ))}
        </select>
      </div>

      {/* Contract Address */}
      <div>
        <label htmlFor="contractAddress" className="block text-sm font-semibold text-navy-900 mb-2">
          Contract Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="contractAddress"
          name="contractAddress"
          required
          placeholder={coinType === 'upcoming' ? 'Paste address or type TBA' : 'Paste the full contract address'}
          className="input-field font-mono text-sm"
        />
        {coinType === 'upcoming' && (
          <p className="text-xs text-navy-400 mt-1">Type &ldquo;TBA&rdquo; if the contract address isn&apos;t available yet.</p>
        )}
      </div>

      {/* Launch Date (upcoming only) */}
      {coinType === 'upcoming' && (
        <div>
          <label htmlFor="launchDate" className="block text-sm font-semibold text-navy-900 mb-2">
            Launch Date &amp; Time (UTC) <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="launchDate"
            name="launchDate"
            required
            className="input-field"
          />
          <p className="text-xs text-navy-400 mt-1">A countdown timer will be displayed on your listing.</p>
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-navy-900 mb-2">
          Short Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          maxLength={500}
          placeholder="What makes this coin special? Why should the community check it out?"
          className="input-field resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-semibold text-navy-900 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select id="category" name="category" required className="select-field">
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <hr className="border-navy-200" />
      <p className="text-sm text-navy-500 font-medium">Optional Links</p>

      {/* Links grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-navy-700 mb-1.5">Website</label>
          <input type="url" id="websiteUrl" name="websiteUrl" placeholder="https://..." className="input-field" />
        </div>
        <div>
          <label htmlFor="twitterUrl" className="block text-sm font-medium text-navy-700 mb-1.5">Twitter / X</label>
          <input type="url" id="twitterUrl" name="twitterUrl" placeholder="https://x.com/..." className="input-field" />
        </div>
        <div>
          <label htmlFor="telegramUrl" className="block text-sm font-medium text-navy-700 mb-1.5">Telegram</label>
          <input type="url" id="telegramUrl" name="telegramUrl" placeholder="https://t.me/..." className="input-field" />
        </div>
        <div>
          <label htmlFor="pumpFunUrl" className="block text-sm font-medium text-navy-700 mb-1.5">PumpFun Link</label>
          <input type="url" id="pumpFunUrl" name="pumpFunUrl" placeholder="https://pump.fun/..." className="input-field" />
        </div>
        <div>
          <label htmlFor="dexScreenerUrl" className="block text-sm font-medium text-navy-700 mb-1.5">DexScreener</label>
          <input type="url" id="dexScreenerUrl" name="dexScreenerUrl" placeholder="https://dexscreener.com/..." className="input-field" />
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-navy-700 mb-1.5">Image URL</label>
          <input type="url" id="imageUrl" name="imageUrl" placeholder="https://... (coin logo)" className="input-field" />
        </div>
      </div>

      <hr className="border-navy-200" />

      {/* Contact Email */}
      <div>
        <label htmlFor="submitterEmail" className="block text-sm font-semibold text-navy-900 mb-2">
          Contact Email <span className="text-red-500">*</span>
        </label>
        <input type="email" id="submitterEmail" name="submitterEmail" required placeholder="you@example.com" className="input-field" />
        <p className="text-xs text-navy-400 mt-1.5">Not displayed publicly. Used only if we need to reach out about your submission.</p>
      </div>

      <hr className="border-navy-200" />

      {/* Paid Features */}
      <div>
        <h3 className="font-bold text-navy-900 text-sm mb-1">Boost Your Listing</h3>
        <p className="text-xs text-navy-500 mb-4">
          Free submissions are reviewed within 24-48 hours. Upgrade for faster review and more visibility.
        </p>

        <div className="space-y-2">
          {/* Free option */}
          <button
            type="button"
            onClick={() => setSelectedPaid(null)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
              selectedPaid === null
                ? 'border-brand-500 bg-brand-50'
                : 'border-navy-200 bg-white hover:border-navy-300'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              selectedPaid === null ? 'border-brand-500 bg-brand-500' : 'border-navy-300'
            )}>
              {selectedPaid === null && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-navy-900">Free Submission</span>
                <span className="text-sm font-bold text-brand-600">$0</span>
              </div>
              <p className="text-xs text-navy-500 mt-0.5">Standard review within 24-48 hours.</p>
            </div>
          </button>

          {paidFeatures.map(([key, feat]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedPaid(key)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                selectedPaid === key
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-navy-200 bg-white hover:border-navy-300'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                selectedPaid === key ? 'border-brand-500 bg-brand-500' : 'border-navy-300'
              )}>
                {selectedPaid === key && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-900">{feat.label}</span>
                  <span className="text-sm font-bold text-navy-900">${feat.price}</span>
                </div>
                <p className="text-xs text-navy-500 mt-0.5">{feat.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-4 bg-navy-50 border-navy-200">
        <p className="text-xs text-navy-500 leading-relaxed">
          By submitting, you confirm that the information is accurate to the best of your knowledge.
          We reserve the right to reject or remove listings. This is not financial advice.
        </p>
      </div>

      {/* Submit button */}
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-base">
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </span>
        ) : selectedPaid ? (
          `Submit & Pay ($${selectedPrice})`
        ) : (
          'Submit Coin'
        )}
      </button>
    </form>
  );
}
