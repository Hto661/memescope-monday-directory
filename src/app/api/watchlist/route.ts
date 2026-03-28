import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { addToWatchlist, removeFromWatchlist, getUserWatchlist, isInWatchlist } from '@/lib/data';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const coins = await getUserWatchlist(user.id);
  return NextResponse.json({ coins });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { coinId, action } = await request.json();
  if (!coinId) {
    return NextResponse.json({ error: 'coinId is required' }, { status: 400 });
  }

  if (action === 'remove') {
    await removeFromWatchlist(user.id, coinId);
    return NextResponse.json({ success: true, watching: false });
  }

  await addToWatchlist(user.id, coinId);
  return NextResponse.json({ success: true, watching: true });
}
