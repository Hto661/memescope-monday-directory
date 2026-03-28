import { NextResponse } from 'next/server';
import { fetchCoinNews, analyzeSentiment } from '@/lib/news';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);

  if (!query) {
    return NextResponse.json({ error: 'q parameter required' }, { status: 400 });
  }

  const articles = await fetchCoinNews(query, Math.min(limit, 20));
  const sentiment = analyzeSentiment(articles);

  return NextResponse.json({ articles, sentiment });
}
