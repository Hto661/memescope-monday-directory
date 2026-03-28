'use client';

import { useState } from 'react';
import type { Chain } from '@/lib/types';
import { getDexScreenerEmbedUrl } from '@/lib/types';

interface ChartEmbedProps {
  chain: Chain;
  contractAddress: string;
}

export function ChartEmbed({ chain, contractAddress }: ChartEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const embedUrl = getDexScreenerEmbedUrl(chain, contractAddress);

  if (contractAddress === 'TBA' || !contractAddress) {
    return (
      <div className="card p-8 text-center bg-navy-50">
        <p className="text-navy-400 text-sm">Chart will be available after launch</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100 bg-navy-50">
        <h3 className="font-bold text-navy-900 text-sm">Live Chart</h3>
        <span className="text-xs text-navy-400">via DexScreener</span>
      </div>
      <div className="relative" style={{ height: 400 }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-50">
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin w-6 h-6 text-navy-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs text-navy-400">Loading chart...</span>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          onLoad={() => setLoaded(true)}
          title="DexScreener Chart"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
}
