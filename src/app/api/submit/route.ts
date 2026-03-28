import { NextResponse } from 'next/server';
import { addCoin } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { CHAINS, CATEGORIES } from '@/lib/types';
import type { SubmitFormData, Chain, CoinType } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await getCurrentUser();

    const required: (keyof SubmitFormData)[] = [
      'name', 'ticker', 'chain', 'contractAddress', 'description', 'category', 'submitterEmail',
    ];

    for (const field of required) {
      if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    if (!CHAINS.some((c) => c.id === body.chain)) {
      return NextResponse.json({ error: 'Invalid chain' }, { status: 400 });
    }

    if (!CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.submitterEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (body.description.length > 500) {
      return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 });
    }

    const coinType: CoinType = body.coinType === 'upcoming' ? 'upcoming' : 'existing';

    if (coinType === 'upcoming' && body.launchDate) {
      const launchDate = new Date(body.launchDate);
      if (isNaN(launchDate.getTime())) {
        return NextResponse.json({ error: 'Invalid launch date' }, { status: 400 });
      }
    }

    const data: SubmitFormData = {
      name: body.name.trim(),
      ticker: body.ticker.trim(),
      chain: body.chain as Chain,
      contractAddress: body.contractAddress.trim(),
      description: body.description.trim(),
      imageUrl: body.imageUrl?.trim() || undefined,
      websiteUrl: body.websiteUrl?.trim() || undefined,
      twitterUrl: body.twitterUrl?.trim() || undefined,
      telegramUrl: body.telegramUrl?.trim() || undefined,
      pumpFunUrl: body.pumpFunUrl?.trim() || undefined,
      dexScreenerUrl: body.dexScreenerUrl?.trim() || undefined,
      category: body.category,
      submitterEmail: body.submitterEmail.trim(),
      coinType,
      launchDate: coinType === 'upcoming' && body.launchDate ? new Date(body.launchDate).toISOString() : undefined,
    };

    const coin = await addCoin(data, user?.id);

    return NextResponse.json({ success: true, coin: { id: coin.id, slug: coin.slug } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
