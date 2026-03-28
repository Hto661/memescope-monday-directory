import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isInWatchlist } from '@/lib/data';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ watching: false });
  }

  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get('coinId');
  if (!coinId) {
    return NextResponse.json({ watching: false });
  }

  const watching = await isInWatchlist(user.id, coinId);
  return NextResponse.json({ watching });
}
