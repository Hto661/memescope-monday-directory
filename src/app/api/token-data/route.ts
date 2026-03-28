import { NextResponse } from 'next/server';
import { fetchTokenByAddress, mapDexChainToChain, formatMarketCap } from '@/lib/dexscreener';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'address parameter required' }, { status: 400 });
  }

  // Extract address from PumpFun URL if needed
  const pumpFunMatch = address.match(/pump\.fun\/(?:coin\/)?([A-Za-z0-9]+)/);
  if (pumpFunMatch) {
    address = pumpFunMatch[1];
  }

  const dexData = await fetchTokenByAddress(address);

  if (!dexData) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  const chain = mapDexChainToChain(dexData.chainId);

  const token = {
    name: dexData.baseToken.name,
    ticker: `$${dexData.baseToken.symbol}`,
    chain: chain ?? dexData.chainId,
    contractAddress: dexData.baseToken.address,
    marketCap: formatMarketCap(dexData.fdv),
    priceUsd: dexData.priceUsd,
    liquidity: dexData.liquidity?.usd,
    volume24h: dexData.volume?.h24,
    imageUrl: dexData.info?.imageUrl,
    dexScreenerUrl: dexData.url,
    pairAddress: dexData.pairAddress,
  };

  return NextResponse.json({ token });
}
