import { NextResponse } from 'next/server';
import { getApprovedCoins, getFeaturedCoins, getTrendingCoins } from '@/lib/data';
import type { Chain } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get('chain') as Chain | null;
  const featured = searchParams.get('featured');
  const trending = searchParams.get('trending');
  const q = searchParams.get('q');

  let coins;

  if (featured === 'true') {
    coins = await getFeaturedCoins();
  } else if (trending === 'true') {
    coins = await getTrendingCoins();
  } else {
    coins = await getApprovedCoins();
  }

  // Filter by chain
  if (chain) {
    coins = coins.filter((c) => c.chain === chain);
  }

  // Search
  if (q) {
    const query = q.toLowerCase();
    coins = coins.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.ticker.toLowerCase().includes(query) ||
        c.contractAddress.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ coins, total: coins.length });
}
