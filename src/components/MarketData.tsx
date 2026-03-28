import type { DexToken } from '@/lib/dexscreener';
import { formatMarketCap, formatVolume, formatPrice } from '@/lib/dexscreener';
import { cn } from '@/lib/utils';

interface MarketDataProps {
  data: DexToken;
}

export function MarketDataCard({ data }: MarketDataProps) {
  const priceChange24h = data.priceChange?.h24 ?? 0;
  const isPositive = priceChange24h >= 0;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-100 bg-navy-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📈</span>
            <h3 className="font-bold text-navy-900 text-sm">Live Market Data</h3>
          </div>
          <span className="text-xs text-navy-400">via DexScreener</span>
        </div>
      </div>

      <div className="p-5">
        {/* Price + Change */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs text-navy-400 uppercase font-semibold mb-1">Price</p>
            <p className="text-2xl font-black text-navy-900">{formatPrice(data.priceUsd)}</p>
          </div>
          <div className={cn(
            'px-3 py-1.5 rounded-lg font-bold text-sm',
            isPositive ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-700'
          )}>
            {isPositive ? '+' : ''}{priceChange24h.toFixed(1)}%
            <span className="text-xs font-medium ml-1 opacity-60">24h</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-navy-400 mb-0.5">Market Cap</p>
            <p className="text-sm font-bold text-navy-900">{formatMarketCap(data.fdv)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 mb-0.5">Liquidity</p>
            <p className="text-sm font-bold text-navy-900">{formatMarketCap(data.liquidity?.usd)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 mb-0.5">24h Volume</p>
            <p className="text-sm font-bold text-navy-900">{formatVolume(data.volume?.h24)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 mb-0.5">24h Txns</p>
            <p className="text-sm font-bold text-navy-900">
              {(data.txns?.h24?.buys ?? 0) + (data.txns?.h24?.sells ?? 0)}
              <span className="text-xs text-navy-400 font-normal ml-1">
                ({data.txns?.h24?.buys ?? 0}B / {data.txns?.h24?.sells ?? 0}S)
              </span>
            </p>
          </div>
        </div>

        {/* Micro price changes */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-navy-100">
          {[
            { label: '5m', value: data.priceChange?.m5 },
            { label: '1h', value: data.priceChange?.h1 },
            { label: '6h', value: data.priceChange?.h6 },
            { label: '24h', value: data.priceChange?.h24 },
          ].map((p) => (
            <div key={p.label} className="flex-1 text-center">
              <p className="text-xs text-navy-400 mb-0.5">{p.label}</p>
              <p className={cn(
                'text-xs font-semibold',
                (p.value ?? 0) >= 0 ? 'text-brand-600' : 'text-red-600'
              )}>
                {p.value != null ? `${(p.value >= 0 ? '+' : '')}${p.value.toFixed(1)}%` : '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
