import type { Chain } from './types';

export interface DexToken {
  chainId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string | null;
  priceNative: string;
  fdv: number | null;
  marketCap: number | null;
  liquidity: {
    usd: number | null;
    base: number;
    quote: number;
  };
  volume: {
    h24: number | null;
    h6: number | null;
    h1: number | null;
    m5: number | null;
  };
  priceChange: {
    h24: number | null;
    h6: number | null;
    h1: number | null;
    m5: number | null;
  };
  txns: {
    h24: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    m5: { buys: number; sells: number };
  };
  pairCreatedAt: number | null;
  url: string;
  info?: {
    imageUrl?: string;
    websites?: { url: string }[];
    socials?: { type: string; url: string }[];
  };
}

export interface DexSearchResult {
  pairs: DexToken[] | null;
}

const DEX_API = 'https://api.dexscreener.com';

export async function fetchTokenByAddress(address: string): Promise<DexToken | null> {
  try {
    const res = await fetch(`${DEX_API}/latest/dex/tokens/${encodeURIComponent(address)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as DexSearchResult;
    if (!data.pairs || data.pairs.length === 0) return null;
    // Return the pair with the highest liquidity
    return data.pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
  } catch {
    return null;
  }
}

export async function searchToken(query: string): Promise<DexToken[]> {
  try {
    const res = await fetch(`${DEX_API}/latest/dex/search?q=${encodeURIComponent(query)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as DexSearchResult;
    return data.pairs ?? [];
  } catch {
    return [];
  }
}

export function mapDexChainToChain(chainId: string): Chain | null {
  const map: Record<string, Chain> = {
    solana: 'solana',
    base: 'base',
    bsc: 'bnb',
  };
  return map[chainId] ?? null;
}

export function formatMarketCap(value: number | null | undefined): string {
  if (!value) return 'N/A';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatVolume(value: number | null | undefined): string {
  if (!value) return '$0';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatPrice(value: string | null | undefined): string {
  if (!value) return 'N/A';
  const num = parseFloat(value);
  if (num < 0.00001) return `$${num.toExponential(2)}`;
  if (num < 0.01) return `$${num.toFixed(6)}`;
  if (num < 1) return `$${num.toFixed(4)}`;
  return `$${num.toFixed(2)}`;
}
