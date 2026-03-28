'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AutoFillResult {
  name: string;
  ticker: string;
  chain: string;
  marketCap: string;
  imageUrl?: string;
  dexScreenerUrl?: string;
}

interface AutoFillAddressProps {
  onAutoFill: (data: AutoFillResult) => void;
}

export function AutoFillAddress({ onAutoFill }: AutoFillAddressProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutoFillResult | null>(null);
  const [error, setError] = useState('');

  const handleLookup = useCallback(async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/token-data?address=${encodeURIComponent(address.trim())}`);
      if (!res.ok) {
        throw new Error('Token not found');
      }
      const data = await res.json();
      if (data.token) {
        setResult(data.token);
      } else {
        setError('No data found for this address');
      }
    } catch {
      setError('Could not fetch token data. You can still fill the form manually.');
    } finally {
      setLoading(false);
    }
  }, [address]);

  const handleApply = () => {
    if (result) {
      onAutoFill(result);
      setResult(null);
      setAddress('');
    }
  };

  return (
    <div className="card p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⚡</span>
        <h3 className="font-bold text-navy-900 text-sm">Quick Fill from Contract Address</h3>
      </div>
      <p className="text-xs text-navy-500 mb-3">
        Paste a contract address or PumpFun URL to auto-fill coin details from on-chain data.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Paste contract address or pump.fun URL..."
          className="input-field flex-1 font-mono text-sm"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLookup())}
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={loading || !address.trim()}
          className="btn-primary px-5 disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Lookup'
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-amber-600 mt-2">{error}</p>
      )}

      {result && (
        <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-navy-900 text-sm">{result.name}</span>
              <span className="text-xs text-navy-500">{result.ticker}</span>
              <span className="text-xs bg-navy-100 text-navy-600 px-1.5 py-0.5 rounded capitalize">{result.chain}</span>
            </div>
            {result.marketCap && (
              <span className="text-xs font-semibold text-navy-700">{result.marketCap}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="btn-brand w-full py-2 text-sm"
          >
            Auto-fill form with this data
          </button>
        </div>
      )}
    </div>
  );
}
